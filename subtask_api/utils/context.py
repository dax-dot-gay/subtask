from urllib.parse import quote
from pydantic import BaseModel
from litestar.stores.redis import RedisStore
import tomllib
from redis.asyncio import Redis
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie


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


class ServerConfig(BaseModel):
    databases: AllDatabasesConfig


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
            document_models=[],
        )
