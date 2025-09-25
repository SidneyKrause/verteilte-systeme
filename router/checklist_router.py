from fastapi import APIRouter, Cookie, HTTPException
from services.jwt_service import decode_jwt
from schemas.checklist_schema import Checklist
from services.checklist_service import save_checklist, get_checklist

checklist_router = APIRouter(prefix="/checklist", tags=["Checklist"])


@checklist_router.post("")
async def checklist_save(checklist_data: dict, access_token: str = Cookie(None)):
    if not access_token:
        raise HTTPException(status_code=401, detail="Missing token")

    payload = decode_jwt(access_token)
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")

    checklist = Checklist(user_id=str(user_id), items=checklist_data.get("items", []))
    save_checklist(checklist)

    return {"message": f"Checklist saved for {user_id}"}


@checklist_router.get("")
async def checklist_get(access_token: str = Cookie(None)):
    if not access_token:
        raise HTTPException(status_code=401, detail="Missing token")

    payload = decode_jwt(access_token)
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")

    checklist = get_checklist(user_id)
    return {"checklist": checklist}
