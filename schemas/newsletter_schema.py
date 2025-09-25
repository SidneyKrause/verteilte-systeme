from pydantic import BaseModel, EmailStr, Field


class NewsletterSignup(BaseModel):
    email: EmailStr = Field(
        ...,
        title="Email Address",
        description="The user's email address for newsletter signup",
    )
    first_name: str = Field(
        ..., title="First Name", alias="first-name", description="The user's first name"
    )
