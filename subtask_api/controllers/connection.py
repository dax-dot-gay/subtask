from typing import Any
from litestar import get, post, Controller
from ..models import (
    User,
    provide_user,
    guard_logged_in,
    RedactedUserConnection,
)
from litestar.di import Provide
from ..connections import *
from ..utils import ServerContext
from litestar.exceptions import *


class ConnectionController(Controller):
    path = "/connections"
    guards = [guard_logged_in]
    dependencies = {"user": Provide(provide_user)}

    @get("/")
    async def get_all_connections(self, user: User) -> list[RedactedUserConnection]:
        return [i.redact() for i in await user.get_connections()]

    @get("/{connection_type:str}/authentication/redirect")
    async def get_redirect_url(
        self, connection_type: str, context: ServerContext
    ) -> str:
        if connection_type in CONNECTION_PROVIDERS.keys() and hasattr(
            context.config.oauth, connection_type
        ):
            return CONNECTION_PROVIDERS[connection_type].get_redirect_url(
                getattr(context.config.oauth, connection_type)
            )
        raise NotFoundException(f"Unknown connection scheme `{connection_type}`")

    @post("/{connection_type:str}/authentication/")
    async def authenticate_with_code(
        self,
        connection_type: str,
        context: ServerContext,
        data: dict[str, Any],
        user: User,
    ) -> RedactedUserConnection:
        if connection_type in CONNECTION_PROVIDERS.keys() and hasattr(
            context.config.oauth, connection_type
        ):
            connection = await CONNECTION_PROVIDERS[connection_type].get_connection(
                getattr(context.config.oauth, connection_type), **data
            )

            if connection:
                instance = await CONNECTION_PROVIDERS[connection_type].create(
                    getattr(context.config.oauth, connection_type), connection
                )
                profile_data = await instance.get_profile_info()
                connection.account_name = profile_data.account_name
                connection.account_image = profile_data.account_image
                connection.user_id = user.id
                await connection.save()
                return connection.redact()
            else:
                raise InternalServerException("Failed to get authentication token.")

        raise NotFoundException(f"Unknown connection scheme `{connection_type}`")
