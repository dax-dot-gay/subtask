from hashlib import pbkdf2_hmac
import os

from pydantic import BaseModel
from .base import BaseObject


class RedactedUser(BaseModel):
    id: str
    username: str
    display_name: str


class User(BaseObject):
    username: str
    display_name: str
    password_hash: str
    password_salt: str

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
            id=self.id, username=self.username, display_name=self.display_name
        )
