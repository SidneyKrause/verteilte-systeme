import os
from fastapi.staticfiles import StaticFiles
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from router.newsletter_router import newsletter_router
from router.html_router import html_router
from router.user_router import user_router
from router.checklist_router import checklist_router
from router.favorites_router import favorites_router


app = FastAPI()
origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.mount("/static", StaticFiles(directory="static"), name="static")

app.include_router(html_router)
app.include_router(user_router)
app.include_router(newsletter_router)
app.include_router(checklist_router)
app.include_router(favorites_router)
if __name__ == "__main__":
    if not os.path.exists(".env"):
        raise FileNotFoundError(
            ".env file not found. Please create one using the generate_secret.py script."
        )
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
