"""Sub-admin authentication and CMS dashboard routes."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import require_sub_admin
from app.models.cms import Banner, SiteSetting
from app.models.contact import ContactMessage
from app.models.legal import LegalPage
from app.models.membership import CommunityMembership
from app.models.product import ProductCategory, ProductDetail
from app.models.service import Service
from app.models.user import User
from app.schemas.admin_cms import (
    AboutContentResponse,
    AboutContentUpdate,
    BannerCreate,
    BannerResponse,
    BannerUpdate,
    CandidateResponse,
    CategoryCreate,
    CategoryUpdate,
    ContactDetailsResponse,
    ContactDetailsUpdate,
    DashboardStats,
    LegalPageAdminResponse,
    LegalPageUpdate,
    PaymentHistoryItem,
    ProductCreate,
    ProductUpdate,
    ServiceCreate,
    ServiceUpdate,
    SiteSettingResponse,
    SubAdminCreate,
    SubAdminUpdate,
    SubscriptionAmountUpdate,
)
from app.schemas.auth import SubAdminLogin, TokenResponse, UserResponse
from app.schemas.contact import ContactResponse
from app.schemas.product import ProductCategoryResponse, ProductDetailResponse
from app.schemas.service import ServiceResponse
from app.services.auth_service import (
    create_access_token,
    create_refresh_token,
    hash_password,
    verify_password,
)

router = APIRouter(prefix="/admin", tags=["admin"])

CONTACT_KEYS = ("phone", "phone_alt", "whatsapp", "email", "address")
ABOUT_TITLE_KEY = "about_title"
ABOUT_CONTENT_KEY = "about_content"
DEFAULT_SUBSCRIPTION_PRICE_KEY = "default_subscription_price_paise"


def _get_setting(db: Session, key: str, default: str = "") -> str:
    row = db.query(SiteSetting).filter(SiteSetting.key == key).first()
    return row.value if row else default


def _set_setting(db: Session, key: str, value: str, label: str | None = None) -> SiteSetting:
    row = db.query(SiteSetting).filter(SiteSetting.key == key).first()
    if row:
        row.value = value
        if label is not None:
            row.label = label
    else:
        row = SiteSetting(key=key, value=value, label=label)
        db.add(row)
    return row


def _product_detail_response(item: ProductDetail) -> ProductDetailResponse:
    gallery = [u.strip() for u in (item.gallery_urls or "").split(",") if u.strip()]
    return ProductDetailResponse(
        id=item.id,
        slug=item.slug,
        title=item.title,
        subtitle=item.subtitle,
        description=item.description,
        image_url=item.image_url,
        gallery_urls=gallery,
        category_id=item.category_id,
        price_paise=item.price_paise,
        billing_period=item.billing_period,
        category_name=item.category.name if item.category else None,
        category_image_url=item.category.image_url if item.category else None,
    )


# ── Auth ─────────────────────────────────────────────────────────────────────


@router.post("/login", response_model=TokenResponse)
def sub_admin_login(payload: SubAdminLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email, User.role == "sub_admin").first()
    if not user or not user.password_hash or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid sub-admin credentials")
    if not user.is_active:
        raise HTTPException(status_code=401, detail="Sub-admin account is inactive")

    return TokenResponse(
        access_token=create_access_token(user.email),
        refresh_token=create_refresh_token(user.email),
    )


@router.get("/me", response_model=UserResponse)
def sub_admin_me(current_user: User = Depends(require_sub_admin)):
    return current_user


@router.get("/stats", response_model=DashboardStats)
def dashboard_stats(
    db: Session = Depends(get_db),
    _: User = Depends(require_sub_admin),
):
    recent_members = (
        db.query(User)
        .filter(User.role == "member")
        .order_by(User.created_at.desc(), User.id.desc())
        .limit(8)
        .all()
    )
    recent_memberships = (
        db.query(CommunityMembership)
        .order_by(CommunityMembership.created_at.desc(), CommunityMembership.id.desc())
        .limit(8)
        .all()
    )
    recent_subscriptions = [
        PaymentHistoryItem(
            id=row.id,
            user_name=row.user.name if row.user else "Unknown",
            user_email=row.user.email if row.user else "",
            product_title=row.product_detail.title if row.product_detail else "Unknown",
            status=row.status,
            razorpay_subscription_id=row.razorpay_subscription_id,
            current_period_end=row.current_period_end,
            created_at=row.created_at,
        )
        for row in recent_memberships
    ]
    return DashboardStats(
        categories=db.query(ProductCategory).count(),
        products=db.query(ProductDetail).count(),
        services=db.query(Service).count(),
        candidates=db.query(User).filter(User.role == "member").count(),
        messages=db.query(ContactMessage).count(),
        payments=db.query(CommunityMembership).count(),
        banners=db.query(Banner).count(),
        sub_admins=db.query(User).filter(User.role == "sub_admin").count(),
        recent_joins=recent_members,
        recent_subscriptions=recent_subscriptions,
    )


# ── Banners ──────────────────────────────────────────────────────────────────


@router.get("/banners", response_model=list[BannerResponse])
def list_banners(db: Session = Depends(get_db), _: User = Depends(require_sub_admin)):
    return db.query(Banner).order_by(Banner.sort_order.asc(), Banner.id.desc()).all()


@router.post("/banners", response_model=BannerResponse, status_code=status.HTTP_201_CREATED)
def create_banner(
    payload: BannerCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_sub_admin),
):
    banner = Banner(**payload.model_dump())
    db.add(banner)
    db.commit()
    db.refresh(banner)
    return banner


@router.put("/banners/{banner_id}", response_model=BannerResponse)
def update_banner(
    banner_id: int,
    payload: BannerUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_sub_admin),
):
    banner = db.query(Banner).filter(Banner.id == banner_id).first()
    if not banner:
        raise HTTPException(status_code=404, detail="Banner not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(banner, key, value)
    db.commit()
    db.refresh(banner)
    return banner


@router.delete("/banners/{banner_id}")
def delete_banner(
    banner_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_sub_admin),
):
    banner = db.query(Banner).filter(Banner.id == banner_id).first()
    if not banner:
        raise HTTPException(status_code=404, detail="Banner not found")
    db.delete(banner)
    db.commit()
    return {"message": "Banner deleted"}


# ── Contact details (site settings) ─────────────────────────────────────────


@router.get("/contact-details", response_model=ContactDetailsResponse)
def get_contact_details(db: Session = Depends(get_db), _: User = Depends(require_sub_admin)):
    return ContactDetailsResponse(**{k: _get_setting(db, f"contact_{k}") for k in CONTACT_KEYS})


@router.put("/contact-details", response_model=ContactDetailsResponse)
def update_contact_details(
    payload: ContactDetailsUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_sub_admin),
):
    labels = {
        "phone": "Primary Phone",
        "phone_alt": "Alternate Phone",
        "whatsapp": "WhatsApp",
        "email": "Email",
        "address": "Address",
    }
    data = payload.model_dump()
    for key in CONTACT_KEYS:
        _set_setting(db, f"contact_{key}", data.get(key, ""), labels.get(key))
    db.commit()
    return ContactDetailsResponse(**{k: data.get(k, "") for k in CONTACT_KEYS})


# ── About Us ─────────────────────────────────────────────────────────────────


@router.get("/about", response_model=AboutContentResponse)
def get_about(db: Session = Depends(get_db), _: User = Depends(require_sub_admin)):
    return AboutContentResponse(
        title=_get_setting(db, ABOUT_TITLE_KEY, "About Us"),
        content=_get_setting(db, ABOUT_CONTENT_KEY, ""),
    )


@router.put("/about", response_model=AboutContentResponse)
def update_about(
    payload: AboutContentUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_sub_admin),
):
    _set_setting(db, ABOUT_TITLE_KEY, payload.title, "About Title")
    _set_setting(db, ABOUT_CONTENT_KEY, payload.content, "About Content")
    db.commit()
    return AboutContentResponse(title=payload.title, content=payload.content)


# ── Sub-admins ───────────────────────────────────────────────────────────────


@router.get("/sub-admins", response_model=list[UserResponse])
def list_sub_admins(db: Session = Depends(get_db), _: User = Depends(require_sub_admin)):
    return db.query(User).filter(User.role == "sub_admin").order_by(User.id.asc()).all()


@router.post("/sub-admins", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_sub_admin(
    payload: SubAdminCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_sub_admin),
):
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        name=payload.name,
        email=payload.email,
        phone=payload.phone,
        password_hash=hash_password(payload.password),
        role="sub_admin",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.put("/sub-admins/{user_id}", response_model=UserResponse)
def update_sub_admin(
    user_id: int,
    payload: SubAdminUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_sub_admin),
):
    user = db.query(User).filter(User.id == user_id, User.role == "sub_admin").first()
    if not user:
        raise HTTPException(status_code=404, detail="Sub-admin not found")
    data = payload.model_dump(exclude_unset=True)
    password = data.pop("password", None)
    for key, value in data.items():
        setattr(user, key, value)
    if password:
        user.password_hash = hash_password(password)
    db.commit()
    db.refresh(user)
    return user


@router.delete("/sub-admins/{user_id}")
def delete_sub_admin(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_sub_admin),
):
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    user = db.query(User).filter(User.id == user_id, User.role == "sub_admin").first()
    if not user:
        raise HTTPException(status_code=404, detail="Sub-admin not found")
    db.delete(user)
    db.commit()
    return {"message": "Sub-admin deleted"}


# ── Categories ───────────────────────────────────────────────────────────────


@router.get("/categories", response_model=list[ProductCategoryResponse])
def list_categories(db: Session = Depends(get_db), _: User = Depends(require_sub_admin)):
    return db.query(ProductCategory).order_by(ProductCategory.id.asc()).all()


@router.post("/categories", response_model=ProductCategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(
    payload: CategoryCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_sub_admin),
):
    if db.query(ProductCategory).filter(ProductCategory.slug == payload.slug).first():
        raise HTTPException(status_code=400, detail="Slug already exists")
    category = ProductCategory(**payload.model_dump())
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


@router.put("/categories/{category_id}", response_model=ProductCategoryResponse)
def update_category(
    category_id: int,
    payload: CategoryUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_sub_admin),
):
    category = db.query(ProductCategory).filter(ProductCategory.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    data = payload.model_dump(exclude_unset=True)
    if "slug" in data:
        clash = (
            db.query(ProductCategory)
            .filter(ProductCategory.slug == data["slug"], ProductCategory.id != category_id)
            .first()
        )
        if clash:
            raise HTTPException(status_code=400, detail="Slug already exists")
    for key, value in data.items():
        setattr(category, key, value)
    db.commit()
    db.refresh(category)
    return category


@router.delete("/categories/{category_id}")
def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_sub_admin),
):
    category = db.query(ProductCategory).filter(ProductCategory.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    db.delete(category)
    db.commit()
    return {"message": "Category deleted"}


# ── Products ─────────────────────────────────────────────────────────────────


@router.get("/products", response_model=list[ProductDetailResponse])
def list_products(db: Session = Depends(get_db), _: User = Depends(require_sub_admin)):
    items = db.query(ProductDetail).order_by(ProductDetail.id.asc()).all()
    return [_product_detail_response(item) for item in items]


@router.post("/products", response_model=ProductDetailResponse, status_code=status.HTTP_201_CREATED)
def create_product(
    payload: ProductCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_sub_admin),
):
    if db.query(ProductDetail).filter(ProductDetail.slug == payload.slug).first():
        raise HTTPException(status_code=400, detail="Slug already exists")
    product = ProductDetail(**payload.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return _product_detail_response(product)


@router.put("/products/{product_id}", response_model=ProductDetailResponse)
def update_product(
    product_id: int,
    payload: ProductUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_sub_admin),
):
    product = db.query(ProductDetail).filter(ProductDetail.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    data = payload.model_dump(exclude_unset=True)
    if "slug" in data:
        clash = (
            db.query(ProductDetail)
            .filter(ProductDetail.slug == data["slug"], ProductDetail.id != product_id)
            .first()
        )
        if clash:
            raise HTTPException(status_code=400, detail="Slug already exists")
    for key, value in data.items():
        setattr(product, key, value)
    db.commit()
    db.refresh(product)
    return _product_detail_response(product)


@router.delete("/products/{product_id}")
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_sub_admin),
):
    product = db.query(ProductDetail).filter(ProductDetail.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(product)
    db.commit()
    return {"message": "Product deleted"}


@router.put("/products/{product_id}/subscription-amount", response_model=ProductDetailResponse)
def update_subscription_amount(
    product_id: int,
    payload: SubscriptionAmountUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_sub_admin),
):
    product = db.query(ProductDetail).filter(ProductDetail.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    product.price_paise = payload.price_paise
    product.billing_period = payload.billing_period
    db.commit()
    db.refresh(product)
    return _product_detail_response(product)


# ── Services ─────────────────────────────────────────────────────────────────


@router.get("/services", response_model=list[ServiceResponse])
def list_services(db: Session = Depends(get_db), _: User = Depends(require_sub_admin)):
    return db.query(Service).order_by(Service.id.asc()).all()


@router.post("/services", response_model=ServiceResponse, status_code=status.HTTP_201_CREATED)
def create_service(
    payload: ServiceCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_sub_admin),
):
    if db.query(Service).filter(Service.slug == payload.slug).first():
        raise HTTPException(status_code=400, detail="Slug already exists")
    service = Service(**payload.model_dump())
    db.add(service)
    db.commit()
    db.refresh(service)
    return service


@router.put("/services/{service_id}", response_model=ServiceResponse)
def update_service(
    service_id: int,
    payload: ServiceUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_sub_admin),
):
    service = db.query(Service).filter(Service.id == service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(service, key, value)
    db.commit()
    db.refresh(service)
    return service


@router.delete("/services/{service_id}")
def delete_service(
    service_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_sub_admin),
):
    service = db.query(Service).filter(Service.id == service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    db.delete(service)
    db.commit()
    return {"message": "Service deleted"}


# ── Legal pages ──────────────────────────────────────────────────────────────


@router.get("/legal", response_model=list[LegalPageAdminResponse])
def list_legal_pages(db: Session = Depends(get_db), _: User = Depends(require_sub_admin)):
    return db.query(LegalPage).order_by(LegalPage.id.asc()).all()


@router.get("/legal/{slug}", response_model=LegalPageAdminResponse)
def get_legal_page(
    slug: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_sub_admin),
):
    page = db.query(LegalPage).filter(LegalPage.slug == slug).first()
    if not page:
        raise HTTPException(status_code=404, detail="Legal page not found")
    return page


@router.put("/legal/{slug}", response_model=LegalPageAdminResponse)
def update_legal_page(
    slug: str,
    payload: LegalPageUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_sub_admin),
):
    page = db.query(LegalPage).filter(LegalPage.slug == slug).first()
    if not page:
        raise HTTPException(status_code=404, detail="Legal page not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(page, key, value)
    db.commit()
    db.refresh(page)
    return page


# ── Messages / Contact Us submissions ────────────────────────────────────────


@router.get("/messages", response_model=list[ContactResponse])
def list_messages(db: Session = Depends(get_db), _: User = Depends(require_sub_admin)):
    return db.query(ContactMessage).order_by(ContactMessage.id.desc()).all()


@router.delete("/messages/{message_id}")
def delete_message(
    message_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_sub_admin),
):
    msg = db.query(ContactMessage).filter(ContactMessage.id == message_id).first()
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")
    db.delete(msg)
    db.commit()
    return {"message": "Message deleted"}


# ── Candidates (members) ─────────────────────────────────────────────────────


@router.get("/candidates", response_model=list[CandidateResponse])
def list_candidates(db: Session = Depends(get_db), _: User = Depends(require_sub_admin)):
    return (
        db.query(User)
        .filter(User.role == "member")
        .order_by(User.id.desc())
        .all()
    )


@router.put("/candidates/{user_id}/toggle-active", response_model=CandidateResponse)
def toggle_candidate_active(
    user_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_sub_admin),
):
    user = db.query(User).filter(User.id == user_id, User.role == "member").first()
    if not user:
        raise HTTPException(status_code=404, detail="Candidate not found")
    user.is_active = not user.is_active
    db.commit()
    db.refresh(user)
    return user


# ── Payment history ──────────────────────────────────────────────────────────


@router.get("/payments", response_model=list[PaymentHistoryItem])
def list_payments(db: Session = Depends(get_db), _: User = Depends(require_sub_admin)):
    rows = (
        db.query(CommunityMembership)
        .order_by(CommunityMembership.id.desc())
        .all()
    )
    results: list[PaymentHistoryItem] = []
    for row in rows:
        results.append(
            PaymentHistoryItem(
                id=row.id,
                user_name=row.user.name if row.user else "Unknown",
                user_email=row.user.email if row.user else "",
                product_title=row.product_detail.title if row.product_detail else "Unknown",
                status=row.status,
                razorpay_subscription_id=row.razorpay_subscription_id,
                current_period_end=row.current_period_end,
                created_at=row.created_at,
            )
        )
    return results


# ── Settings list (optional debug) ───────────────────────────────────────────


@router.get("/settings", response_model=list[SiteSettingResponse])
def list_settings(db: Session = Depends(get_db), _: User = Depends(require_sub_admin)):
    return db.query(SiteSetting).order_by(SiteSetting.key.asc()).all()
