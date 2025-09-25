from fastapi import APIRouter, Cookie, HTTPException
from services.jwt_service import decode_jwt
from schemas.favorites_schema import FavoriteCities
from services.favorites_service import save_favorites, get_favorites, fav_delete

favorites_router = APIRouter(prefix="/favorites", tags=["Favorites"])


@favorites_router.post("")
async def favorites_save(
    favorites_data: FavoriteCities, access_token: str = Cookie(None)
):
    if not access_token:
        raise HTTPException(status_code=401, detail="Missing token")
    payload = decode_jwt(access_token)
    user_id = payload.get("sub")

    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")
    save_favorites(
        user_id, [fav.model_dump(mode="json") for fav in favorites_data.favorites]
    )
    return {"message": "Favorites saved successfully"}


@favorites_router.get("")
async def favorites_get(access_token: str = Cookie(None)):
    if not access_token:
        raise HTTPException(status_code=401, detail="Missing token")

    payload = decode_jwt(access_token)
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")

    favorites = get_favorites(user_id)
    if not isinstance(favorites, list):
        favorites = []  # fallback → leeres Array

    return {"favorites": favorites}


@favorites_router.delete("/{city_class}")
async def favorites_delete(city_class: str, access_token: str = Cookie(None)):
    if not access_token:
        raise HTTPException(status_code=401, detail="Missing token")

    payload = decode_jwt(access_token)
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")

    fav_delete(user_id, city_class)
    return {"message": f"Favorite {city_class} deleted for {user_id}"}
