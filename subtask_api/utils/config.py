from urllib.parse import quote
from pydantic import BaseModel


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


class GithubOAuthConfig(BaseModel):
    app_id: str
    client_id: str
    client_secret: str
    private_key: str


OAUTH_CONFIGS = GithubOAuthConfig


class OAuthConfig(BaseModel):
    github: GithubOAuthConfig


class ServerConfig(BaseModel):
    databases: AllDatabasesConfig
    oauth: OAuthConfig
