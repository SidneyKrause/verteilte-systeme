from pydantic import AliasChoices, BaseModel, EmailStr, Field
from typing import Literal, Optional, Union


class User(BaseModel):
    username: EmailStr
    password: str
    age: int = Field(..., gt=0, lt=120)
    gender: Union[Literal["male"], Literal["female"], Literal["diverse"]] = Field(...)


class UserLogin(BaseModel):
    username: str
    password: str


class CreateUser(BaseModel):
    first_name: str = Field(
        ..., alias="first-name", title="First Name", description="The user's first name"
    )
    last_name: str = Field(
        ..., alias="last-name", title="Last Name", description="The user's last name"
    )
    age: int = Field(..., ge=1, description="Must be at least 1")
    gender: Literal["male", "female", "diverse"]
    username: EmailStr
    password: str

    class Config:
        populate_by_name = True


class UpdateUser(BaseModel):
    # accept "first-name" or "firstName" on input; serialize as "first-name"
    first_name: Optional[str] = Field(
        None,
        validation_alias=AliasChoices("first-name", "firstName"),
        serialization_alias="first-name",
    )
    last_name: Optional[str] = Field(
        None,
        validation_alias=AliasChoices("last-name", "lastName"),
        serialization_alias="last-name",
    )
    age: Optional[int] = Field(None, ge=1)
    gender: Optional[Literal["male", "female", "diverse"]] = None
    username: Optional[EmailStr] = None

    class Config:
        populate_by_name = True


class PasswordChange(BaseModel):
    new_password: str
