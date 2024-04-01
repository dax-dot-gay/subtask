from hashlib import pbkdf2_hmac
import os
from typing import Literal

from pydantic import BaseModel
from .base import BaseObject


class RedactedUserConnection(BaseModel):
    type: Literal["github"]
    account_name: str | None = None
    account_image: str | None = None


class UserConnection(BaseModel):
    type: Literal["github"]
    access_token: str
    account_name: str | None = None
    account_image: str | None = None

    def redact(self) -> RedactedUserConnection:
        return RedactedUserConnection(
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
