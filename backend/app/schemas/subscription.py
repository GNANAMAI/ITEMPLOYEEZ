"""Subscription API schemas."""

from datetime import datetime

from pydantic import BaseModel


class SubscriptionCreate(BaseModel):
    plan_type: str  # "monthly" or "yearly"


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
