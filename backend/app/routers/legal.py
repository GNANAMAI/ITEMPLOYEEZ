"""Legal policy pages API routes."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.legal import LegalPage
from app.schemas.legal import LegalPageResponse

router = APIRouter(prefix="/legal", tags=["legal"])


@router.get("/{slug}", response_model=LegalPageResponse)
def get_legal_page(slug: str, db: Session = Depends(get_db)):
    page = db.query(LegalPage).filter(LegalPage.slug == slug).first()
    if not page:
        raise HTTPException(status_code=404, detail="Legal page not found")
    return page
