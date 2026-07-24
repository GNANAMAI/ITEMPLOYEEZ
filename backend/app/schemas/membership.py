"""Membership and community API schemas."""

from datetime import datetime

from pydantic import BaseModel


class MembershipProductSummary(BaseModel):
    id: int
    slug: str
    title: str
    image_url: str

    model_config = {"from_attributes": True}


class MembershipCategorySummary(BaseModel):
    id: int
    name: str
    slug: str
    image_url: str

    model_config = {"from_attributes": True}


class MembershipResponse(BaseModel):
    id: int
    product_detail_id: int
    status: str
    current_period_end: datetime | None
    is_active: bool
    product: MembershipProductSummary
    category: MembershipCategorySummary | None = None


class MembershipCheckResponse(BaseModel):
    has_access: bool
    membership: MembershipResponse | None = None


class MembershipGroupResponse(BaseModel):
    category: MembershipCategorySummary
    products: list[MembershipProductSummary]
