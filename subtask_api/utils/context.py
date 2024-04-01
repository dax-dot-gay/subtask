from urllib.parse import quote
from pydantic import BaseModel
from litestar.stores.redis import RedisStore
from litestar.datastructures import State
import tomllib
from redis.asyncio import Redis
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from ..models import User


class DatabaseConfig(BaseModel):
    connection_uri: str
    username: str
    password: str
    database: str

    @property
    def parsed(self) -> str:
        return self.connection_uri.format(
            username=quote(self.username),
            password=quote(self.password),
            database=quote(self.database),
        )


class AllDatabasesConfig(BaseModel):
    mongo: DatabaseConfig
    redis: DatabaseConfig


class OAuthConnectionConfig(BaseModel):
    client_id: str
    client_secret: str


class OAuthConfig(BaseModel):
    github: OAuthConnectionConfig


class ServerConfig(BaseModel):
    databases: AllDatabasesConfig
    oauth: OAuthConfig


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
            document_models=[User],
        )


async def provide_context(state: State) -> ServerContext:
    return state.context
