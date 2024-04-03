from typing import Type, TypeVar
from pydantic import BaseModel
from ..utils import OAUTH_CONFIGS
from ..models import UserConnection, ConnectionLocation


class ConnectionProfileInfo(BaseModel):
    account_name: str | None
    account_image: str | None

TConnection = TypeVar("TConnection")

class BaseConnectionProvider:
    @classmethod
    def get_redirect_url(cls, config: OAUTH_CONFIGS) -> str:
        raise NotImplementedError

    @classmethod
    async def get_connection(
        cls, config: OAUTH_CONFIGS, **kwargs
    ) -> UserConnection | None:
        raise NotImplementedError

    @classmethod
    async def refresh(
        cls, config: OAUTH_CONFIGS, connection: UserConnection
    ) -> UserConnection:
        raise NotImplementedError

    @classmethod
    async def create(
        cls: Type[TConnection],
        config: OAUTH_CONFIGS,
        connection: UserConnection,
        *args,
        **kwargs
    ) -> TConnection:
        return cls(config, connection, *args, **kwargs)

    def __init__(
        self, config: OAUTH_CONFIGS, connection: UserConnection, *args, **kwargs
    ) -> None:
        self.config = config
        self.connection = connection

    async def get_profile_info(self) -> ConnectionProfileInfo:
        raise NotImplementedError

    async def get_locations(self) -> list[ConnectionLocation]:
        raise NotImplementedError
