from datetime import UTC, datetime

from pydantic import BaseModel
from .base import BaseStoredObject
from .user import RedactedUser, User


class ExpandedSession(BaseModel):
    id: str
    creation_time: datetime
    access_time: datetime
    user: RedactedUser | None = None


class Session(BaseStoredObject):
    creation_time: datetime
    access_time: datetime
    user_id: str | None = None

    @classmethod
    def create(cls) -> "Session":
        current_utc = datetime.now(UTC)
        return Session(creation_time=current_utc, access_time=current_utc)

    async def expand(self) -> ExpandedSession:
        user = await User.from_id(self.user_id) if self.user_id else None
        return ExpandedSession(
            id=self.id,
            creation_time=self.creation_time,
            access_time=self.access_time,
            user=user.redact() if user else None,
        )
