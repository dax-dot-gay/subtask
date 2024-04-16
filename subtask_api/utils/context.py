from urllib.parse import quote
from pydantic import BaseModel
from litestar.stores.redis import RedisStore
from litestar.datastructures import State
import tomllib
from redis.asyncio import Redis
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from ..models import User, UserConnection, GridFile, Project
from .config import *


class ServerContext:
    def __init__(self) -> None:
        with open("config.toml", "rb") as config_file:
            self.config = ServerConfig(**tomllib.load(config_file))

        self.store = RedisStore(
            Redis.from_url(self.config.databases.redis.parsed), namespace="SUBTASK"
        )
        self.mongo = AsyncIOMotorClient(self.config.databases.mongo.parsed)

    async def initialize(self):
        await init_beanie(
            database=self.mongo[self.config.databases.mongo.database],
            document_models=[User, UserConnection, GridFile, Project],
        )


async def provide_context(state: State) -> ServerContext:
    return state.context
