from datetime import UTC, datetime, timedelta
from ..utils import ServerContext
from ..models import Session
from litestar.datastructures import State
from litestar.datastructures import MutableScopeHeaders
from litestar.types import Message, Receive, Scope, Send
from litestar.connection import ASGIConnection
from litestar.middleware.base import MiddlewareProtocol
from litestar.types import ASGIApp


class CookieSessionManager(MiddlewareProtocol):
    def __init__(self, app: ASGIApp) -> None:
        super().__init__(app)
        self.app = app

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] == "http":
            connection = ASGIConnection(scope, receive=receive, send=send)
            context: ServerContext = connection.app.state.context
            active_token = (
                await Session.from_storage(
                    context.store,
                    connection.cookies.get("subtask-token", None),
                    renew=timedelta(hours=2),
                )
                if "subtask-token" in connection.cookies.keys()
                else None
            )
            if active_token:
                active_token.access_time = datetime.now(UTC)
                scope["token"] = active_token
                await active_token.to_storage(context.store, expire=timedelta(hours=2))
            else:
                new_session = Session.create()
                await new_session.to_storage(context.store, expire=timedelta(hours=2))
                scope["token"] = new_session

            async def send_wrapper(message: Message) -> None:
                if message["type"] == "http.response.start":
                    headers = MutableScopeHeaders.from_message(message=message)
                    headers["Set-Cookie"] = f"subtask-token={scope['token'].id}"
                await send(message)

            await self.app(scope, receive, send_wrapper)


async def provide_session(scope: Scope) -> Session:
    return scope["token"]
