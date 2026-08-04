from enum import Enum


class UserRoles(str,Enum):
    ADMIN="admin"
    TEACHER="teacher"
    STUDENT="student"


class TeacherApprovalStatus(str,Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"