from .base import BaseConnectionProvider
from .github import GithubConnectionProvider

CONNECTION_PROVIDERS = {"github": GithubConnectionProvider}
