import asyncio
from github import Github, Auth
import httpx

from .base import BaseConnectionProvider, ConnectionProfileInfo
from ..utils import GithubOAuthConfig
from urllib.parse import quote, parse_qs


class GithubConnectionProvider(BaseConnectionProvider):
    def __init__(self, config: GithubOAuthConfig, access_token: str) -> None:
        super().__init__(config, access_token)
        self.github = Github(access_token)

    @classmethod
    def get_redirect_url(cls, config: GithubOAuthConfig) -> str:
        return f"https://github.com/login/oauth/authorize?client_id={quote(config.client_id)}"

    @classmethod
    async def get_access_token(
        cls, config: GithubOAuthConfig, code: str = None, **kwargs
    ) -> str | None:
        async with httpx.AsyncClient() as client:
            result = await client.post(
                "https://github.com/login/oauth/access_token",
                params={
                    "client_id": config.client_id,
                    "client_secret": config.client_secret,
                    "code": code,
                },
                follow_redirects=True,
                headers={"Content-Type": "application/json"},
            )
            if result.is_success:
                result_dict = parse_qs(result.text)
                return result_dict.get("access_token", [None])[0]
            else:
                return None

    async def get_profile_info(self) -> ConnectionProfileInfo:
        result = await asyncio.to_thread(self.github.get_user)
        return ConnectionProfileInfo(
            account_name=result.name, account_image=result.avatar_url
        )
