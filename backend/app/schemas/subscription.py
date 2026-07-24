"""Subscription API schemas."""

from datetime import datetime

from pydantic import BaseModel


class SubscriptionCreate(BaseModel):
    product_slug: str
    plan_type: str = "yearly"


class SubscriptionResponse(BaseModel):
    id: int
    plan_id: str
    status: str
    current_period_end: datetime | None
    is_active: bool


class RazorpayCheckoutResponse(BaseModel):
    subscription_id: str | None
    key_id: str
    plan_id: str
    customer_notify: int = 1
    notes: dict | None = None
    mock_mode: bool = False
    product_slug: str | None = None
    product_title: str | None = None
    amount_paise: int | None = None
