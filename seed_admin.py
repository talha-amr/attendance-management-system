from app.database import SessionLocal
from app.enums import  UserRoles
from app.models import  User
from app.security import hash_password


def seed_admin():
    db = SessionLocal()

    try:
        admin_email = "admin@school.com"

        existing_admin = (
            db.query(User)
            .filter(User.email == admin_email)
            .first()
        )

        if existing_admin:
            print("Admin already exists.")
            return

        admin = User(
            name="School Admin",
            email=admin_email,
            password=hash_password("Admin@123"),
            role=UserRoles.ADMIN,
        )

        db.add(admin)
        db.commit()

        print("Admin created successfully.")

    finally:
        db.close()


if __name__ == "__main__":
    seed_admin()