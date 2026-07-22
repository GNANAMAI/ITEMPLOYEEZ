"""Subscription and Razorpay webhook routes."""

import hashlib
import hmac

from fastapi import APIRouter, Depends, Header, HTTPException, Request
from sqlalchemy.orm import Session

from app.config import get_settings
from app.database import get_db
from app.dependencies import get_current_user
from app.models.subscription import Subscription
from app.models.user import User
from app.schemas.subscription import RazorpayCheckoutResponse, SubscriptionCreate, SubscriptionResponse
from app.services.razorpay_service import create_checkout, subscription_is_active

router = APIRouter(prefix="/subscriptions", tags=["subscriptions"])
settings = get_settings()


@router.get("/status", response_model=SubscriptionResponse)
def get_subscription_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    subscription = db.query(Subscription).filter(Subscription.user_id == current_user.id).first()
    if not subscription:
        return SubscriptionResponse(id=0, plan_id="", status="inactive", current_period_end=None, is_active=False)

    return SubscriptionResponse(
        id=subscription.id,
        plan_id=subscription.plan_id,
        status=subscription.status,
        current_period_end=subscription.current_period_end,
        is_active=subscription_is_active(subscription),
    )


@router.post("/create", response_model=RazorpayCheckoutResponse)
def create_subscription(
    payload: SubscriptionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if payload.plan_type not in {"monthly", "yearly"}:
        raise HTTPException(status_code=400, detail="plan_type must be 'monthly' or 'yearly'")

    checkout = create_checkout(db, current_user, payload.plan_type)
    return RazorpayCheckoutResponse(**checkout)


@router.post("/webhooks/razorpay")
async def razorpay_webhook(
    request: Request,
    db: Session = Depends(get_db),
    x_razorpay_signature: str | None = Header(default=None),
):
    body = await request.body()

    if settings.razorpay_webhook_secret and x_razorpay_signature:
        expected = hmac.new(
            settings.razorpay_webhook_secret.encode(),
            body,
            hashlib.sha256,
        ).hexdigest()
        if not hmac.compare_digest(expected, x_razorpay_signature):
            raise HTTPException(status_code=400, detail="Invalid webhook signature")

    payload = await request.json()
    event = payload.get("event", "")
    entity = payload.get("payload", {}).get("subscription", {}).get("entity", {})
    subscription_id = entity.get("id")
    status_value = entity.get("status", "active")

    if subscription_id and event.startswith("subscription."):
        from app.services.razorpay_service import activate_subscription_from_webhook

        activate_subscription_from_webhook(db, subscription_id, status_value)

    return {"status": "ok"}
