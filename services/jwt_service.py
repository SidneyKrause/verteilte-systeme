import jwt
from fastapi import HTTPException
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta, timezone


load_dotenv()


def encode_jwt(sub, data={}):
    payload = data.copy()
    payload["exp"] = (datetime.now(tz=timezone.utc) + timedelta(hours=1)).timestamp()
    payload["iat"] = datetime.now(tz=timezone.utc).timestamp()
    payload["sub"] = sub
    payload["nbf"] = datetime.now(tz=timezone.utc).timestamp()

    return jwt.encode(payload, os.getenv("SECRET_KEY"), algorithm="HS512")


def decode_jwt(token: str):
    try:
        return jwt.decode(token, os.getenv("SECRET_KEY"), algorithms=["HS512"])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
