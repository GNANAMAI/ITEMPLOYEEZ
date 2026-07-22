"""Contact form API routes."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import require_sub_admin
from app.models.contact import ContactMessage
from app.models.user import User
from app.schemas.contact import ContactCreate, ContactResponse

router = APIRouter(prefix="/contact", tags=["contact"])


@router.post("", response_model=ContactResponse, status_code=201)
def submit_contact(payload: ContactCreate, db: Session = Depends(get_db)):
    message = ContactMessage(
        name=payload.name,
        email=payload.email,
        phone=payload.phone,
        subject=payload.subject,
        message=payload.message,
    )
    db.add(message)
    db.commit()
    db.refresh(message)
    return message


@router.get("/messages", response_model=list[ContactResponse])
def list_contact_messages(
    db: Session = Depends(get_db),
    _: User = Depends(require_sub_admin),
):
    return db.query(ContactMessage).order_by(ContactMessage.created_at.desc()).all()
