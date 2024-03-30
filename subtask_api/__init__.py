from datetime import datetime
from litestar import Litestar, get


@get("/")
async def get_root() -> datetime:
    return datetime.now()


app = Litestar(route_handlers=[get_root])
