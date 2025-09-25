import os
from typing import Annotated
from fastapi import APIRouter, Depends, Request
from fastapi.responses import RedirectResponse
from fastapi.templating import Jinja2Templates
from services.jwt_service import encode_jwt
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from db import client
from services.user_service import authenticate_user, user_authenticated

html_router = APIRouter(tags=["HTML"])
templates = Jinja2Templates(directory="templates")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


@html_router.get("/")
async def index_html(request: Request):
    return templates.TemplateResponse(
        "index.html",
        {"request": request, "user": {"is_authenticated": user_authenticated(request)}},
    )


@html_router.get("/destinations")
async def destinations_html(request: Request):
    return templates.TemplateResponse(
        "destinations.html",
        {"request": request, "user": {"is_authenticated": user_authenticated(request)}},
    )


@html_router.get("/advice")
async def about_html(request: Request):
    return templates.TemplateResponse(
        "advice.html",
        {"request": request, "user": {"is_authenticated": user_authenticated(request)}},
    )


@html_router.get("/contact")
async def contact_html(request: Request):
    return templates.TemplateResponse(
        "contact.html",
        {"request": request, "user": {"is_authenticated": user_authenticated(request)}},
    )


@html_router.get("/data-protection")
async def data_protection_html(request: Request):
    return templates.TemplateResponse(
        "data_protection.html",
        {"request": request, "user": {"is_authenticated": user_authenticated(request)}},
    )


@html_router.get("/register")
async def html_register(request: Request):
    if user_authenticated(request):
        return RedirectResponse(url="/")
    return templates.TemplateResponse(
        "register.html",
        {"request": request},
    )


@html_router.get("/gallery")
async def gallery_html(request: Request):
    return templates.TemplateResponse(
        "gallery.html",
        {"request": request, "user": {"is_authenticated": user_authenticated(request)}},
    )


@html_router.get("/imprint")
async def imprint_html(request: Request):
    return templates.TemplateResponse(
        "imprint.html",
        {"request": request, "user": {"is_authenticated": user_authenticated(request)}},
    )


@html_router.get("/login")
async def login_html(request: Request):
    if user_authenticated(request):
        return RedirectResponse(url="/")
    return templates.TemplateResponse(
        "login.html",
        {"request": request},
    )


@html_router.get("/profile")
async def profile_html(request: Request):
    auth = user_authenticated(request)
    if not auth:
        return RedirectResponse(url="/login")
    return templates.TemplateResponse(
        "profile.html",
        {"request": request, "user": {"is_authenticated": auth}},
    )


@html_router.post("/token")
async def jwt_token(form_data: Annotated[OAuth2PasswordRequestForm, Depends()]):
    authenticate_user(str(form_data.username), str(form_data.password))
    access_token = encode_jwt(sub=str(form_data.username))
    return {"access_token": access_token, "token_type": "bearer"}


@html_router.get("/logout")
async def logout_user():
    response = RedirectResponse(url="/")
    response.delete_cookie(key="access_token")
    return response


if os.getenv("DEV") == "True":

    @html_router.delete("/delete-db")
    async def delete_all_users():
        client.db.users.delete_many({})
        client.db.favorites.delete_many({})
