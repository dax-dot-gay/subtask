from hashlib import pbkdf2_hmac
import os
from secrets import token_urlsafe
from typing import Literal

from httpx import request
from pydantic import BaseModel, Field
from .base import BaseObject
from litestar.connection import ASGIConnection
from litestar.handlers.base import BaseRouteHandler
from litestar.exceptions import *
from litestar import Request


class RedactedUserConnection(BaseModel):
    id: str
    type: Literal["github"]
    account_name: str | None = None
    account_image: str | None = None


class UserConnection(BaseModel):
    id: str = Field(default_factory=lambda: token_urlsafe(32))
    type: Literal["github"]
    access_token: str
    account_name: str | None = None
    account_image: str | None = None

    def redact(self) -> RedactedUserConnection:
        return RedactedUserConnection(
            id=self.id,
            type=self.type,
            account_name=self.account_name,
            account_image=self.account_image,
        )


class RedactedUser(BaseModel):
    id: str
    username: str
    display_name: str
    connections: list[RedactedUserConnection]


class User(BaseObject):
    username: str
    display_name: str
    password_hash: str
    password_salt: str
    connections: list[UserConnection] = []

    class Settings:
        name = "users"

    @classmethod
    def create(cls, username: str, display_name: str, password: str) -> "User":
        salt = os.urandom(32)
        hashed = pbkdf2_hmac("sha256", password.encode(), salt, 500000).hex()
        return User(
            username=username,
            display_name=display_name,
            password_hash=hashed,
            password_salt=salt.hex(),
        )

    def verify(self, attempt: str) -> bool:
        hashed_attempt = pbkdf2_hmac(
            "sha256", attempt.encode(), bytes.fromhex(self.password_salt), 500000
        ).hex()
        return hashed_attempt == self.password_hash

    def change_password(self, old_password: str, new_password: str):
        if not self.verify(old_password):
            raise ValueError("Incorrect passphrase supplied")

        salt = os.urandom(32)
        hashed = pbkdf2_hmac("sha256", new_password.encode(), salt, 500000).hex()
        self.password_hash = hashed
        self.password_salt = salt.hex()

    def redact(self) -> RedactedUser:
        return RedactedUser(
            id=self.id,
            username=self.username,
            display_name=self.display_name,
            connections=[i.redact() for i in self.connections],
        )


async def get_active_user(connection: ASGIConnection) -> User | None:
    session = connection.scope.get("token", None)
    if session and session.user_id:
        return await User.from_id(session.user_id)
    return None


async def guard_logged_in(connection: ASGIConnection, _: BaseRouteHandler) -> None:
    user = await get_active_user(connection)
    if not user:
        raise NotAuthorizedException("You must be logged in to access this endpoint.")


async def provide_user(request: Request) -> User | None:
    return await get_active_user(request)
