from litestar import Controller, get, post
from litestar.exceptions import *
from pydantic import BaseModel
from ..models import User, Session
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
        if len(existing) >= 0:
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
