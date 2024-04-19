from datetime import datetime
from typing import Any
from litestar import Litestar, get, MediaType, Request, Response
from litestar.datastructures import State

from .utils import ServerContext, CookieSessionManager, provide_session, provide_context
from litestar.status_codes import HTTP_500_INTERNAL_SERVER_ERROR
from litestar.di import Provide
from .models import Session, ExpandedSession
from .controllers import *


async def handle_startup(app: Litestar) -> None:
    context = ServerContext()
    await context.initialize()
    app.state.context = context


@get("/")
async def get_root(session: Session) -> ExpandedSession:
    return await session.expand()


def plain_text_exception_handler(req: Request, exc: Exception) -> Response:
    """Default handler for exceptions subclassed from HTTPException."""
    status_code = getattr(exc, "status_code", HTTP_500_INTERNAL_SERVER_ERROR)
    detail = getattr(exc, "detail", "")
    if status_code == HTTP_500_INTERNAL_SERVER_ERROR:
        req.app.logger.exception("Server error:\n")

    return Response(
        media_type=MediaType.TEXT,
        content=detail,
        status_code=status_code,
    )


app = Litestar(
    route_handlers=[
        get_root,
        get_file_content,
        UserAuthenticationController,
        ConnectionController,
        ConnectionOperationController,
        UserSelfController,
        ProjectMetaController,
        SingleProjectController,
    ],
    state=State(state={"context": None}),
    on_startup=[handle_startup],
    middleware=[CookieSessionManager],
    exception_handlers={Exception: plain_text_exception_handler},
    dependencies={
        "session": Provide(provide_session),
        "context": Provide(provide_context),
    },
)
