"""Product catalog API routes."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.product import ProductCategory, ProductDetail
from app.schemas.product import ProductCategoryResponse, ProductDetailResponse

router = APIRouter(prefix="/products", tags=["products"])


def _parse_gallery(raw: str | None) -> list[str]:
    if not raw:
        return []
    return [item.strip() for item in raw.split(",") if item.strip()]


def _detail_to_response(detail: ProductDetail) -> ProductDetailResponse:
    return ProductDetailResponse(
        id=detail.id,
        slug=detail.slug,
        title=detail.title,
        description=detail.description,
        image_url=detail.image_url,
        gallery_urls=_parse_gallery(detail.gallery_urls),
        category_id=detail.category_id,
    )


@router.get("", response_model=list[ProductCategoryResponse])
def list_products(db: Session = Depends(get_db)):
    return db.query(ProductCategory).order_by(ProductCategory.id).all()


@router.get("/home", response_model=list[ProductCategoryResponse])
def list_home_products(db: Session = Depends(get_db)):
    return (
        db.query(ProductCategory)
        .filter(ProductCategory.show_on_home.is_(True))
        .order_by(ProductCategory.id.desc())
        .all()
    )


@router.get("/details/list", response_model=list[ProductDetailResponse])
def list_product_details(db: Session = Depends(get_db)):
    details = db.query(ProductDetail).order_by(ProductDetail.id).all()
    return [_detail_to_response(item) for item in details]


@router.get("/details/{slug}", response_model=ProductDetailResponse)
def get_product_detail(slug: str, db: Session = Depends(get_db)):
    detail = db.query(ProductDetail).filter(ProductDetail.slug == slug).first()
    if not detail:
        raise HTTPException(status_code=404, detail="Product detail not found")
    return _detail_to_response(detail)


@router.get("/{product_id}", response_model=ProductCategoryResponse)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(ProductCategory).filter(ProductCategory.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product category not found")
    return product
