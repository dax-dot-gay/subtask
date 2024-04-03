from typing import Any
from pydantic import BaseModel
from ..base import BaseObject
from ..user import User
from enum import IntEnum, StrEnum


class ProjectPermission(IntEnum):
    """An Enum describing project permissions. Permissions with lower numbers are granted the capabilities of all above them."""

    OWNER = 0  # Allows all project actions
    ADMIN = 1  # Allows all project actions, except for deletion & ownership transfer
    MANAGE = 2  # Allows creation & deletion of tasks
    EDIT = 3  # Allows editing individual tasks, including moving their position in the tree
    VIEW = 4  # Allows viewing tasks


class ProjectGrant(StrEnum):
    """An Enum describing how the user was added to the project."""

    OWNER = "owner"  # Member is the project owner
    DIRECT = "direct"  # Member was added directly
    INVITE = "invite"  # Member joined with an invite link


class ProjectMember(BaseModel):
    user_id: str
    permission: ProjectPermission = ProjectPermission.VIEW
    grant: ProjectGrant = ProjectGrant.DIRECT
    invite_id: str | None = None

    async def user(self) -> User | None:
        return await User.from_id(self.user_id)

    def has_permission(self, permission: ProjectPermission | int) -> bool:
        return self.permission <= permission


class ProjectConnection(BaseModel):
    connection_id: str
    location: Any


class Project(BaseObject):
    name: str
    summary: str | None = None
    image: str | None = None
    connection: ProjectConnection | None = None
    members: list[ProjectMember]

    class Settings:
        name = "projects"

    async def owner(self) -> User | None:
        result = [
            member
            for member in self.members
            if member.has_permission(ProjectPermission.OWNER)
        ]
        if len(result) > 0:
            return await result[0].user()
        else:
            return None
