from secrets import token_urlsafe
from litestar import Controller, get, post
from litestar.di import Provide
from ..models import (
    Project,
    guard_logged_in,
    provide_user,
    User,
    ProjectConnection,
    ProjectMember,
    ProjectGrant,
    ProjectPermission,
    GridFile,
)
from pydantic import BaseModel
from litestar.exceptions import *


class ProjectCreationModel(BaseModel):
    name: str
    summary: str = ""
    image: str | None = None
    connection: ProjectConnection | None = None


async def provide_project(user: User, id: str) -> Project:
    result = await Project.from_id(id)
    if result and user.id in [i.user_id for i in result.members]:
        return result
    raise NotFoundException(f"Project `{id}` not found or not accessible.")


class ProjectMetaController(Controller):
    path = "/projects"
    guards = [guard_logged_in]
    dependencies = {"user": Provide(provide_user)}

    @post("/")
    async def create_project(self, user: User, data: ProjectCreationModel) -> Project:
        project_id = token_urlsafe(32)
        if data.image:
            try:
                project_img = await GridFile.create_from_data_url(
                    data.image, "projects", project_id
                )
            except ValueError:
                raise ClientException("Invalid data URI")
        else:
            project_img = None

        new_project = Project(
            name=data.name,
            summary=data.summary,
            image=f"/files/{project_img.id}" if project_img else None,
            connection=data.connection,
            members=[
                ProjectMember(
                    user_id=user.id,
                    permission=ProjectPermission.OWNER,
                    grant=ProjectGrant.OWNER,
                )
            ],
        )
        await new_project.save()
        return new_project

    @get("/")
    async def get_projects(self, user: User) -> list[Project]:
        return await Project.from_query(query={"members.user_id": user.id})


class SingleProjectController(Controller):
    path = "/projects/{id:str}"
    guards = [guard_logged_in]
    dependencies = {"user": Provide(provide_user), "project": Provide(provide_project)}

    @get("/")
    async def get_project(self, project: Project) -> Project:
        return project
