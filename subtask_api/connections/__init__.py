from .base import BaseConnectionProvider
from .github import GithubConnectionProvider
from ..models import UserConnection
from ..utils import ServerContext

CONNECTION_PROVIDERS = {"github": GithubConnectionProvider}


async def get_provider(
    connection: UserConnection, context: ServerContext
) -> GithubConnectionProvider | None:
    return await CONNECTION_PROVIDERS.get(connection.type).create(
        getattr(context.config.oauth, connection.type), connection
    )
