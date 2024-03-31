from datetime import UTC, datetime
from .base import BaseStoredObject


class Session(BaseStoredObject):
    creation_time: datetime
    access_time: datetime
    user_id: str | None = None

    @classmethod
    def create(cls) -> "Session":
        current_utc = datetime.now(UTC)
        return Session(creation_time=current_utc, access_time=current_utc)
