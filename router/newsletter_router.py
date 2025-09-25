from fastapi import APIRouter

from schemas.newsletter_schema import NewsletterSignup
from services.newsletter_service import subscribe_email

newsletter_router = APIRouter(prefix="/newsletter", tags=["Newsletter"])


@newsletter_router.post("/signup")
async def newsletter_signup(email_signup: NewsletterSignup):
    subscribe_email(email_signup)
    return {
        "message": f"Successfully subscribed {email_signup.first_name} to the newsletter!"
    }
