"""Sub-admin authentication and dashboard routes."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import require_sub_admin
from app.models.user import User
from app.schemas.auth import SubAdminLogin, TokenResponse, UserResponse
from app.services.auth_service import create_access_token, create_refresh_token, verify_password

router = APIRouter(prefix="/admin", tags=["admin"])


@router.post("/login", response_model=TokenResponse)
def sub_admin_login(payload: SubAdminLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email, User.role == "sub_admin").first()
    if not user or not user.password_hash or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid sub-admin credentials")

    return TokenResponse(
        access_token=create_access_token(user.email),
        refresh_token=create_refresh_token(user.email),
    )


@router.get("/me", response_model=UserResponse)
def sub_admin_me(current_user: User = Depends(require_sub_admin)):
    return current_user
