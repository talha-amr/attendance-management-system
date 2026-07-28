from enum import Enum


class UserRoles(str,Enum):
    ADMIN="admin"
    TEACHER="teacher"
    STUDENT="student"