from typing import Annotated
from litestar import Controller, get, post, delete
from litestar.exceptions import *
from litestar.di import Provide
from litestar.datastructures import UploadFile
from litestar.params import Body
from litestar.enums import RequestEncodingType
from pydantic import BaseModel

from ..models import (
    User,
    Session,
    guard_logged_in,
    provide_user,
    RedactedUser,
    GridFile,
)
from ..utils import ServerContext


class UserCreationModel(BaseModel):
    username: str
    displayName: str
    password: str


class UserLoginModel(BaseModel):
    username: str
    password: str


class UserAuthenticationController(Controller):
    path = "/user/auth"

    @post("/create")
    async def create_user(
        self, context: ServerContext, session: Session, data: UserCreationModel
    ) -> User:
        existing = await User.from_query({"username": data.username})
        if len(existing) > 0:
            raise MethodNotAllowedException("The desired username already exists")

        created = User.create(data.username, data.displayName, data.password)
        await created.save()
        session.user_id = created.id
        await session.to_storage(context.store)
        return created

    @post("/login")
    async def login_user(
        self, context: ServerContext, session: Session, data: UserLoginModel
    ) -> User:
        results = await User.from_query({"username": data.username}, limit=1)
        if len(results) == 0:
            raise NotFoundException("Username or password is incorrect")

        if not results[0].verify(data.password):
            raise NotFoundException("Username or password is incorrect")

        session.user_id = results[0].id
        await session.to_storage(context.store)
        return results[0]

    @post("/logout")
    async def logout_user(self, context: ServerContext, session: Session) -> None:
        session.user_id = None
        await session.to_storage(context.store)


class UserSelfController(Controller):
    path = "/user/self"
    guards = [guard_logged_in]
    dependencies = {"user": Provide(provide_user)}

    @get("/")
    async def get_self(self, user: User) -> RedactedUser:
        return user.redact()

    @post("/settings/username")
    async def update_settings_username(self, user: User, username: str) -> RedactedUser:
        check = await User.from_query(query={"username": username})
        if len(check) > 0:
            raise MethodNotAllowedException("A user with that username already exists.")

        user.username = username
        await user.save()
        return user.redact()

    @post("/settings/display_name")
    async def update_settings_display_name(
        self, user: User, display_name: str
    ) -> RedactedUser:
        user.display_name = display_name
        await user.save()
        return user.redact()

    @post("/settings/avatar")
    async def update_settings_avatar(
        self,
        user: User,
        data: Annotated[UploadFile, Body(media_type=RequestEncodingType.MULTI_PART)],
    ) -> RedactedUser:
        contents = await data.read()
        generated_file = await GridFile.create(
            contents,
            "users",
            user.id,
            file_name=data.filename,
            file_type=data.content_type,
        )
        user.avatar = f"/files/{generated_file.id}"
        await user.save()
        return user.redact()

    @delete("/settings/avatar")
    async def update_settings_clear_avatar(self, user: User) -> None:
        if user.avatar:
            file_id = user.avatar.split("/")[-1]
            result = await GridFile.from_id(file_id)
            if result:
                await result.delete()

            user.avatar = None
            await user.save()
