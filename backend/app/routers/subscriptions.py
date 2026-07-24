"""Subscription and Razorpay webhook routes."""

import hashlib
import hmac

from fastapi import APIRouter, Depends, Header, HTTPException, Request
from sqlalchemy.orm import Session

from app.config import get_settings
from app.database import get_db
from app.dependencies import get_current_user
from app.models.product import ProductDetail
from app.models.user import User
from app.schemas.subscription import RazorpayCheckoutResponse, SubscriptionCreate, SubscriptionResponse
from app.services.membership_service import membership_is_active
from app.models.membership import CommunityMembership
from app.services.razorpay_service import create_product_checkout

router = APIRouter(prefix="/subscriptions", tags=["subscriptions"])
settings = get_settings()


@router.get("/status", response_model=SubscriptionResponse)
def get_subscription_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    membership = (
        db.query(CommunityMembership)
        .filter(CommunityMembership.user_id == current_user.id)
        .order_by(CommunityMembership.updated_at.desc())
        .first()
    )
    if not membership:
        return SubscriptionResponse(id=0, plan_id="", status="inactive", current_period_end=None, is_active=False)

    return SubscriptionResponse(
        id=membership.id,
        plan_id=membership.razorpay_subscription_id or "",
        status=membership.status,
        current_period_end=membership.current_period_end,
        is_active=membership_is_active(membership),
    )


@router.post("/create", response_model=RazorpayCheckoutResponse)
def create_subscription(
    payload: SubscriptionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if payload.plan_type not in {"monthly", "yearly"}:
        raise HTTPException(status_code=400, detail="plan_type must be 'monthly' or 'yearly'")

    product = db.query(ProductDetail).filter(ProductDetail.slug == payload.product_slug).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    checkout = create_product_checkout(db, current_user, product, payload.plan_type)
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
        from app.services.membership_service import activate_membership_from_webhook

        activate_membership_from_webhook(db, subscription_id, status_value)

    return {"status": "ok"}
