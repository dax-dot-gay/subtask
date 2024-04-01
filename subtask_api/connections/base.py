from pydantic import BaseModel
from ..utils import OAUTH_CONFIGS


class ConnectionProfileInfo(BaseModel):
    account_name: str | None
    account_image: str | None


class BaseConnectionProvider:
    @classmethod
    def get_redirect_url(cls, config: OAUTH_CONFIGS) -> str:
        raise NotImplementedError

    @classmethod
    async def get_access_token(cls, config: OAUTH_CONFIGS, **kwargs) -> str:
        raise NotImplementedError

    def __init__(self, config: OAUTH_CONFIGS, access_token: str) -> None:
        self.config = config
        self.access_token = access_token

    async def get_profile_info(self) -> ConnectionProfileInfo:
        raise NotImplementedError
