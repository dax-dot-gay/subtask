from typing import Any, Literal

from pydantic import BaseModel
from ..base import BaseObject


class TaskAttribute(BaseObject):
    type: Any
    project: str

    class Settings:
        name = "task_attribute"
        is_root = True


class TaskTag(TaskAttribute):
    type: Literal["tag"] = "tag"
    name: str


class TaskStatus(TaskAttribute):
    type: Literal["status"] = "status"
    name: str
    color: str | None = None


class TaskField(TaskAttribute):
    type: Literal["field"] = "field"
    name: str
    icon: str | None = None
    data_type: Literal["text", "number", "switch", "choice", "date", "rich"]
    default: Any = None
    choices: list[str] | None = None
    multiple: bool = False
    text_mode: Literal["line", "area"] = "line"


class TaskFieldEntry(BaseModel):
    field: str
    value: Any


class Task(BaseObject):
    project: str
    name: str
    status: str | None = None
    tags: list[str] = []
    fields: list[TaskFieldEntry] = []
    creator: str
    assigned: list[str] = []

    class Settings:
        name = "task"
