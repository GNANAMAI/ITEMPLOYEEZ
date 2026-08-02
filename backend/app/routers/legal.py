"""Legal policy pages and public site content API routes."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.cms import SiteSetting
from app.models.legal import LegalPage
from app.schemas.admin_cms import AboutContentResponse
from app.schemas.legal import LegalPageResponse

router = APIRouter(tags=["legal"])


@router.get("/legal/{slug}", response_model=LegalPageResponse)
def get_legal_page(slug: str, db: Session = Depends(get_db)):
    page = db.query(LegalPage).filter(LegalPage.slug == slug).first()
    if not page:
        raise HTTPException(status_code=404, detail="Legal page not found")
    return page


@router.get("/about", response_model=AboutContentResponse)
def get_about_page(db: Session = Depends(get_db)):
    title_row = db.query(SiteSetting).filter(SiteSetting.key == "about_title").first()
    content_row = db.query(SiteSetting).filter(SiteSetting.key == "about_content").first()
    return AboutContentResponse(
        title=title_row.value if title_row else "About Us",
        content=content_row.value if content_row else "",
    )
