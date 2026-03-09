from fastapi import APIRouter, Request

router = APIRouter()

@router.get("/")
def read_root(request: Request):
    return {"status": "ok", "version": request.app.version}
