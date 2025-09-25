from fastapi import APIRouter
from fastapi.responses import JSONResponse
from fastapi import HTTPException
from schemas.user_schema import UserLogin, CreateUser
from db import client
from passlib.context import CryptContext
from dotenv import load_dotenv
from services.user_service import change_password, delete_user, update_user
from services.user_service import create_user, authenticate_user
from services.jwt_service import encode_jwt, decode_jwt
from fastapi import Request, Cookie
from schemas.user_schema import UpdateUser, PasswordChange

load_dotenv(override=True)
crypt_context = CryptContext(schemes=["argon2"], deprecated="auto")

user_router = APIRouter(prefix="/user", tags=["User"])


@user_router.post("/register")
async def user_register(user: CreateUser):
    create_user(user)

    access_token = encode_jwt(sub=str(user.username))
    response = JSONResponse(
        status_code=200, content={"message": "User created successfully"}
    )

    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=True,
        samesite="strict",
        max_age=3600 * 60,
        expires=3600 * 60,  # 1 hour
    )

    return response


@user_router.post("/login")
async def login_user(credentials: UserLogin):
    if authenticate_user(credentials.username, credentials.password):
        access_token = encode_jwt(sub=credentials.username)
        response = JSONResponse(content={"message": "Login successful"})
        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            secure=True,
            samesite="strict",
            expires=3600 * 60,  # 1 hour
            max_age=3600 * 60,  # 1 hour
        )
        return response
    raise HTTPException(status_code=401, detail="Invalid credentials")


@user_router.get("/logout")
async def logout_user():
    response = JSONResponse(content={"message": "Logged out successfully"})
    response.delete_cookie(key="access_token")
    return response


@user_router.delete("/delete")
async def delete_user_endpoint(access_token: str = Cookie(None)):
    if not access_token:
        raise HTTPException(status_code=401, detail="Missing token")

    payload = decode_jwt(access_token)
    username = payload.get("sub")
    if not username:
        raise HTTPException(status_code=401, detail="Invalid token")

    delete_user(username)

    response = JSONResponse(
        content={"message": "Account deleted successfully"}, status_code=200
    )
    response.delete_cookie(key="access_token")
    return response


@user_router.get("")
async def get_logged_in_user(request: Request, access_token: str = Cookie(None)):
    if not access_token:
        raise HTTPException(status_code=401, detail="Missing token")

    payload = decode_jwt(access_token)
    username = payload.get("sub")
    if not username:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = client.db.users.find_one({"username": username})
    if user:
        del user["_id"]
        del user["password"]
        user["first-name"] = user.pop("first_name")
        user["last-name"] = user.pop("last_name")

        return user
    raise HTTPException(status_code=404, detail="User not found")


@user_router.put("")
async def update_user_endpoint(user: UpdateUser, access_token: str = Cookie(None)):
    if not access_token:
        raise HTTPException(status_code=401, detail="Missing token")

    payload = decode_jwt(access_token)
    username = payload.get("sub")
    if not username:
        raise HTTPException(status_code=401, detail="Invalid token")

    new_username = update_user(user, username)

    response = JSONResponse(content={"message": "User updated successfully"})
    if new_username != username:
        # issue new JWT because username changed
        new_token = encode_jwt(sub=new_username)
        response.set_cookie(
            key="access_token",
            value=new_token,
            httponly=True,
            secure=True,
            samesite="strict",
            max_age=3600 * 60,
            expires=3600 * 60,
        )

    return response


@user_router.put("/password-reset")
async def pw_change(password_change: PasswordChange, access_token: str = Cookie(None)):
    if not access_token:
        raise HTTPException(status_code=401, detail="Missing token")

    payload = decode_jwt(access_token)
    username = payload.get("sub")
    if not username:
        raise HTTPException(status_code=401, detail="Invalid token")

    change_password(username, password_change.new_password)
    resp = JSONResponse(content={"message": "Password changed successfully"})
    resp.delete_cookie(key="access_token")
    return resp


@user_router.get("/is-authenticated")
async def is_authenticated(access_token: str = Cookie(None)):
    if not access_token:
        return {"is_authenticated": False}

    try:
        payload = decode_jwt(access_token)
    except Exception:
        return {"is_authenticated": False}

    username = payload.get("sub")
    if not username:
        return {"is_authenticated": False}

    return {"is_authenticated": True}
