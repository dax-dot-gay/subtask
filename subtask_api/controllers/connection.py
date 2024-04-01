from typing import Any
from litestar import get, post, Controller
from ..models import (
    Session,
    User,
    provide_user,
    guard_logged_in,
    RedactedUserConnection,
    UserConnection,
)
from litestar.di import Provide
from ..connections import *
from ..utils import ServerContext
from litestar.exceptions import *


class ConnectionController(Controller):
    path = "/connections"
    guards = [guard_logged_in]
    dependencies = {"user": Provide(provide_user)}

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
            token = await CONNECTION_PROVIDERS[connection_type].get_access_token(
                getattr(context.config.oauth, connection_type), **data
            )

            if token:
                instance = CONNECTION_PROVIDERS[connection_type](
                    getattr(context.config.oauth, connection_type), token
                )
                profile_data = await instance.get_profile_info()
                new_connection = UserConnection(
                    type=connection_type,
                    access_token=token,
                    account_name=profile_data.account_name,
                    account_image=profile_data.account_image,
                )
                user.connections.append(new_connection)
                await user.save()
                return new_connection.redact()
            else:
                raise InternalServerException("Failed to get authentication token.")

        raise NotFoundException(f"Unknown connection scheme `{connection_type}`")
