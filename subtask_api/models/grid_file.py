import base64
import mimetypes
import re
from secrets import token_urlsafe
from typing import AsyncIterator
from pydantic import Field
from .base import BaseObject
from motor.motor_asyncio import AsyncIOMotorGridFSBucket


class GridFile(BaseObject):
    id: str = Field(default_factory=lambda: token_urlsafe(32))
    file_name: str
    file_type: str
    owner_collection: str
    owner_id: str

    class Settings:
        name = "grid_file_data"

    @classmethod
    async def create(
        cls,
        content: bytes,
        owner_collection: str,
        owner_id: str,
        file_name: str | None = None,
        file_type: str = "application/octet-stream",
    ) -> "GridFile":
        file_id = token_urlsafe(32)
        if not file_name:
            guessed_type = mimetypes.guess_extension(file_type)
            file_name = f"file_{file_id}{guessed_type if guessed_type else '.bin'}"

        bucket = AsyncIOMotorGridFSBucket(cls.get_settings().motor_db)
        await bucket.upload_from_stream_with_id(
            file_id,
            file_name,
            content,
            metadata={
                "contentType": file_type,
                "owner": f"{owner_collection}:{owner_id}",
            },
        )
        new_file = GridFile(
            id=file_id,
            file_name=file_name,
            file_type=file_type,
            owner_collection=owner_collection,
            owner_id=owner_id,
        )
        await new_file.save()
        return new_file

    @classmethod
    async def create_from_data_url(
        cls, content: str, owner_collection: str, owner_id: str
    ) -> "GridFile":
        if not re.fullmatch("^data:(.*/.*;base64|.*/.*|;base64)?,.*", content):
            raise ValueError(f"Invalid data URI `{content}`")
        file_id = token_urlsafe(32)
        header, data = content.split(",", maxsplit=1)
        info = header.split(":", maxsplit=1)[1]
        parts = info.split(";")
        if len(parts) == 1:
            if len(parts[0]) > 0:
                mime = parts[0]
            else:
                mime = "text/plain"
            encoding = None
        else:
            if len(parts[0]) > 0:
                mime = parts[0]
            else:
                mime = "text/plain"
            encoding = "base64" if parts[1] == "base64" else None

        guessed_type = mimetypes.guess_extension(mime)
        file_name = f"file_{file_id}{guessed_type if guessed_type else '.bin'}"

        bucket = AsyncIOMotorGridFSBucket(cls.get_settings().motor_db)
        await bucket.upload_from_stream_with_id(
            file_id,
            file_name,
            (base64.b64decode(data) if encoding == "base64" else data.encode()),
            metadata={
                "contentType": mime,
                "owner": f"{owner_collection}:{owner_id}",
            },
        )
        new_file = GridFile(
            id=file_id,
            file_name=file_name,
            file_type=mime,
            owner_collection=owner_collection,
            owner_id=owner_id,
        )
        await new_file.save()
        return new_file

    async def get_content(self) -> AsyncIterator[bytes]:
        bucket = AsyncIOMotorGridFSBucket(self.get_settings().motor_db)
        stream = await bucket.open_download_stream(self.id)
        while True:
            data = await stream.readchunk()
            if not data:
                break

            yield data

    async def delete(self) -> None:
        bucket = AsyncIOMotorGridFSBucket(self.get_settings().motor_db)
        await bucket.delete(self.id)
        await super().delete()
