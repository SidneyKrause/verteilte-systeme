from db import client
from fastapi import HTTPException
from passlib.context import CryptContext
from fastapi import Request
from schemas.user_schema import UpdateUser
from services.jwt_service import decode_jwt

crypt_context = CryptContext(schemes=["argon2"], deprecated="auto")


def get_user(username):
    """
    Gets a user from the database by username.

    :param username: The username of the user to retrieve.
    """
    return client.db.users.find_one({"username": username})


def create_user(user):
    if get_user(user.username):
        raise HTTPException(status_code=400, detail="Username already exists")

    user = user.model_dump()
    user["password"] = crypt_context.hash(user["password"])

    client.db.users.create_index("username", unique=True)
    result = client.db.users.insert_one(user)

    return {
        "id": str(result.inserted_id),
        "username": user["username"],
        "first_name": user["first_name"],
        "last_name": user["last_name"],
        "age": user["age"],
        "gender": user["gender"],
    }


def authenticate_user(username, password):
    """
    Authenticates a user by username and password.

    :param username: The username of the user to authenticate.
    :param password: The plain-text password of the user.
    :return: The user object if authentication is successful.
    """
    user = get_user(username)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not crypt_context.verify(password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return user


def user_authenticated(request: Request | None = None, token: str | None = None):
    if not token and request:
        token = request.cookies.get("access_token")
    if token:
        if token.startswith("Bearer "):
            token = token.split(" ", 1)[1]
        try:
            decode_jwt(token)
            return True
        except HTTPException:
            return False
    return False


def delete_user(username: str):
    result = client.db.users.delete_one({"username": username})
    return result.deleted_count > 0


def update_user(user: UpdateUser, username: str):
    update_data = user.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields provided")

    existing_user = get_user(username)
    if not existing_user:
        raise HTTPException(status_code=404, detail="User not found")

    new_username = update_data.get("username")
    if new_username and new_username != username:
        if get_user(new_username):
            raise HTTPException(status_code=400, detail="Username already exists")

    result = client.db.users.update_one({"username": username}, {"$set": update_data})

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")

    return update_data.get("username", username)


def change_password(username: str, new_password: str):
    """
    Change a user's password if it's not the same as the old one.
    """
    user = get_user(username)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if crypt_context.verify(new_password, user["password"]):
        raise HTTPException(
            status_code=400,
            detail="New password must be different from the old one",
        )

    hashed_password = crypt_context.hash(new_password)
    result = client.db.users.update_one(
        {"username": username}, {"$set": {"password": hashed_password}}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")

    return True
