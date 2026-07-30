from fastapi import Depends, FastAPI, HTTPException, status
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session
from .routers import user,auth
from .database import get_db
from app.services.email_service import send_email
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(user.router)
app.include_router(auth.router)

@app.get("/")
def root(database: Session = Depends(get_db)):
    try:
        database.execute(text("SELECT 1"))

        return {
            "message": "Hello World",
            "database": "connected",
        }

    except SQLAlchemyError as error:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database connection failed",
        ) from error

@app.post('/test-email')
def test_email():
    send_email("student1@example.com","SMTP Test","Mailtrap SMTP is working successfully.")
    return {"message":"Test email sent successfully"}