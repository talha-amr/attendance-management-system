from fastapi import Depends, FastAPI, HTTPException, status
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session
from .routers import user,auth
from .database import get_db


app = FastAPI()

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

