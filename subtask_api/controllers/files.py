from litestar import get
from ..models import GridFile
from litestar.response import Stream
from litestar.exceptions import NotFoundException


@get("/files/{file_id:str}")
async def get_file_content(file_id: str) -> Stream:
    file_info = await GridFile.get(file_id)
    if not file_info:
        raise NotFoundException("File not found.")

    return Stream(
        file_info.get_content(),
        media_type=file_info.file_type,
        headers={"Content-Disposition": f"filename={file_info.file_name}"},
    )
