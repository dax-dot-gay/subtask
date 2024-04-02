import asyncio
from datetime import UTC, datetime, timedelta
from typing import Type, TypeVar
from github import Github, Auth
import httpx

from ..models import UserConnection

from .base import BaseConnectionProvider, ConnectionProfileInfo
from ..utils import GithubOAuthConfig
from urllib.parse import quote, parse_qs

TConnection = TypeVar("TConnection")

class GithubConnectionProvider(BaseConnectionProvider):

    def __init__(
        self, config: GithubOAuthConfig, connection: UserConnection, github: Github
    ) -> None:
        super().__init__(config, connection)
        self.github = github

    @classmethod
    async def create(
        cls: Type["GithubConnectionProvider"],
        config: GithubOAuthConfig,
        connection: UserConnection,
        *args,
        **kwargs,
    ) -> "GithubConnectionProvider":
        github = await cls.create_authenticated_github(config, connection)
        return cls(config, connection, github)

    @classmethod
    async def create_authenticated_github(
        cls, config: GithubOAuthConfig, connection: UserConnection
    ) -> Github:
        if datetime.now(UTC) > connection.access_expire:
            connection = await cls.refresh(config, connection)
        return Github(
            auth=Auth.AppUserAuth(
                config.client_id, config.client_secret, connection.access_token
            )
        )

    @classmethod
    async def refresh(
        cls, config: GithubOAuthConfig, connection: UserConnection
    ) -> UserConnection:
        async with httpx.AsyncClient() as client:
            result = await client.post(
                "https://github.com/login/oauth/access_token",
                params={
                    "client_id": config.client_id,
                    "client_secret": config.client_secret,
                    "grant_type": "refresh_token",
                    "refresh_token": connection.refresh_token,
                },
                follow_redirects=True,
                headers={"Content-Type": "application/json"},
            )
            if result.is_success:
                result_dict = {
                    k: v[0] if type(v) == list else v
                    for k, v in parse_qs(result.text).items()
                }
                return UserConnection(
                    id=connection.id,
                    user_id=connection.user_id,
                    type="github",
                    access_token=result_dict.get("access_token", ""),
                    access_expire=datetime.now(UTC)
                    + timedelta(seconds=float(result_dict.get("expires_in", "0"))),
                    refresh_token=result_dict.get("refresh_token", ""),
                    refresh_expire=datetime.now(UTC)
                    + timedelta(
                        seconds=float(result_dict.get("refresh_token_expires_in", "0"))
                    ),
                    account_name=connection.account_name,
                    account_image=connection.account_image,
                )
            else:
                return None

    @classmethod
    def get_redirect_url(cls, config: GithubOAuthConfig) -> str:
        return f"https://github.com/login/oauth/authorize?client_id={quote(config.client_id)}"

    @classmethod
    async def get_connection(
        cls, config: GithubOAuthConfig, code: str = None, **kwargs
    ) -> UserConnection | None:
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
                result_dict = {
                    k: v[0] if type(v) == list else v
                    for k, v in parse_qs(result.text).items()
                }
                print(result_dict)
                return UserConnection(
                    type="github",
                    user_id="",
                    access_token=result_dict.get("access_token", ""),
                    access_expire=datetime.now(UTC)
                    + timedelta(seconds=float(result_dict.get("expires_in", "0"))),
                    refresh_token=result_dict.get("refresh_token", ""),
                    refresh_expire=datetime.now(UTC)
                    + timedelta(
                        seconds=float(result_dict.get("refresh_token_expires_in", "0"))
                    ),
                )
            else:
                return None

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
