from fastapi import HTTPException
from schemas.newsletter_schema import NewsletterSignup
from db import client


def subscribe_email(email: NewsletterSignup):
    if client.db.newsletter.find_one({"email": email.email}):
        raise HTTPException(status_code=400, detail="Email already subscribed")
    client.db.newsletter.insert_one(email.model_dump())
    return {"message": f"Successfully subscribed {email.first_name} to the newsletter!"}
