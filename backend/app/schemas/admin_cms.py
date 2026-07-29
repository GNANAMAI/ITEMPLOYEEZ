"""Pydantic schemas for admin CMS endpoints."""

from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class BannerCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    image_url: str = Field(min_length=1, max_length=500)
    link_url: str | None = None
    sort_order: int = 0
    is_active: bool = True


class BannerUpdate(BaseModel):
    title: str | None = None
    image_url: str | None = None
    link_url: str | None = None
    sort_order: int | None = None
    is_active: bool | None = None


class BannerResponse(BaseModel):
    id: int
    title: str
    image_url: str
    link_url: str | None
    sort_order: int
    is_active: bool
    created_at: datetime | None = None

    model_config = {"from_attributes": True}


class SiteSettingUpdate(BaseModel):
    value: str


class SiteSettingResponse(BaseModel):
    id: int
    key: str
    value: str
    label: str | None

    model_config = {"from_attributes": True}


class ContactDetailsUpdate(BaseModel):
    phone: str = ""
    phone_alt: str = ""
    whatsapp: str = ""
    email: str = ""
    address: str = ""


class ContactDetailsResponse(BaseModel):
    phone: str = ""
    phone_alt: str = ""
    whatsapp: str = ""
    email: str = ""
    address: str = ""


class AboutContentUpdate(BaseModel):
    title: str = "About Us"
    content: str


class AboutContentResponse(BaseModel):
    title: str
    content: str


class CategoryCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    slug: str = Field(min_length=1, max_length=255)
    image_url: str = Field(min_length=1, max_length=500)
    description: str | None = None
    product_detail_slug: str | None = None
    show_on_home: bool = False


class CategoryUpdate(BaseModel):
    name: str | None = None
    slug: str | None = None
    image_url: str | None = None
    description: str | None = None
    product_detail_slug: str | None = None
    show_on_home: bool | None = None


class ProductCreate(BaseModel):
    slug: str = Field(min_length=1, max_length=255)
    title: str = Field(min_length=1, max_length=255)
    subtitle: str | None = None
    description: str | None = None
    image_url: str = Field(min_length=1, max_length=500)
    gallery_urls: str | None = None
    category_id: int | None = None
    price_paise: int = 9900
    billing_period: str = "yearly"


class ProductUpdate(BaseModel):
    slug: str | None = None
    title: str | None = None
    subtitle: str | None = None
    description: str | None = None
    image_url: str | None = None
    gallery_urls: str | None = None
    category_id: int | None = None
    price_paise: int | None = None
    billing_period: str | None = None


class ServiceCreate(BaseModel):
    slug: str = Field(min_length=1, max_length=255)
    title: str = Field(min_length=1, max_length=255)
    excerpt: str
    content: str


class ServiceUpdate(BaseModel):
    slug: str | None = None
    title: str | None = None
    excerpt: str | None = None
    content: str | None = None


class LegalPageUpdate(BaseModel):
    title: str | None = None
    content: str | None = None


class LegalPageAdminResponse(BaseModel):
    id: int
    slug: str
    title: str
    content: str

    model_config = {"from_attributes": True}


class SubAdminCreate(BaseModel):
    name: str = Field(min_length=2, max_length=255)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    phone: str | None = None


class SubAdminUpdate(BaseModel):
    name: str | None = None
    phone: str | None = None
    password: str | None = Field(default=None, min_length=8, max_length=128)
    is_active: bool | None = None


class CandidateResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    phone: str | None
    job_title: str | None
    role: str
    is_active: bool
    created_at: datetime | None = None

    model_config = {"from_attributes": True}


class PaymentHistoryItem(BaseModel):
    id: int
    user_name: str
    user_email: str
    product_title: str
    status: str
    razorpay_subscription_id: str | None
    current_period_end: datetime | None
    created_at: datetime | None

    model_config = {"from_attributes": True}


class SubscriptionAmountUpdate(BaseModel):
    price_paise: int = Field(ge=100)
    billing_period: str = "yearly"


class DashboardStats(BaseModel):
    categories: int
    products: int
    services: int
    candidates: int
    messages: int
    payments: int
    banners: int
    sub_admins: int
    recent_joins: list[CandidateResponse] = []
    recent_subscriptions: list[PaymentHistoryItem] = []
