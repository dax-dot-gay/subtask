from datetime import datetime
from secrets import token_urlsafe
from typing import Literal
from .base import BaseObject
from pydantic import BaseModel, Field


class RedactedUserConnection(BaseModel):
    id: str
    user_id: str
    type: Literal["github"]
    account_name: str | None = None
    account_image: str | None = None


class UserConnection(BaseObject):
    id: str = Field(default_factory=lambda: token_urlsafe(32))
    user_id: str
    type: Literal["github"]
    access_token: str
    access_expire: datetime
    refresh_token: str
    refresh_expire: datetime
    account_name: str | None = None
    account_image: str | None = None

    class Settings:
        name = "users_connections"

    def redact(self) -> RedactedUserConnection:
        return RedactedUserConnection(
            id=self.id,
            user_id=self.user_id,
            type=self.type,
            account_name=self.account_name,
            account_image=self.account_image,
        )
