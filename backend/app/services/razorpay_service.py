"""Razorpay subscription integration."""

from datetime import datetime, timedelta

import razorpay
from sqlalchemy.orm import Session

from app.config import get_settings
from app.models.subscription import Subscription
from app.models.user import User

settings = get_settings()


def get_razorpay_client() -> razorpay.Client | None:
    if not settings.razorpay_key_id or not settings.razorpay_key_secret:
        return None
    return razorpay.Client(auth=(settings.razorpay_key_id, settings.razorpay_key_secret))


def resolve_plan_id(plan_type: str) -> str:
    if plan_type == "yearly":
        return settings.razorpay_plan_yearly
    return settings.razorpay_plan_monthly


def get_or_create_subscription(db: Session, user: User) -> Subscription:
    subscription = db.query(Subscription).filter(Subscription.user_id == user.id).first()
    if subscription:
        return subscription

    subscription = Subscription(user_id=user.id, plan_id=settings.razorpay_plan_monthly, status="inactive")
    db.add(subscription)
    db.commit()
    db.refresh(subscription)
    return subscription


def subscription_is_active(subscription: Subscription | None) -> bool:
    if not subscription:
        return False
    if subscription.status not in {"active", "authenticated"}:
        return False
    if subscription.current_period_end and subscription.current_period_end < datetime.utcnow():
        return False
    return True


def create_checkout(db: Session, user: User, plan_type: str) -> dict:
    plan_id = resolve_plan_id(plan_type)
    subscription = get_or_create_subscription(db, user)
    subscription.plan_id = plan_id
    db.commit()

    client = get_razorpay_client()
    if client is None:
        # Mock mode when Razorpay keys are not configured (local development).
        subscription.status = "active"
        subscription.current_period_end = datetime.utcnow() + timedelta(days=30 if plan_type == "monthly" else 365)
        subscription.razorpay_subscription_id = f"mock_sub_{user.id}"
        db.commit()
        return {
            "subscription_id": subscription.razorpay_subscription_id,
            "key_id": "mock_key",
            "plan_id": plan_id,
            "customer_notify": 1,
            "notes": {"user_id": str(user.id)},
            "mock_mode": True,
        }

    payload = {
        "plan_id": plan_id,
        "total_count": 12 if plan_type == "monthly" else 1,
        "customer_notify": 1,
        "notes": {"user_id": str(user.id), "email": user.email},
    }
    razorpay_subscription = client.subscription.create(payload)

    subscription.razorpay_subscription_id = razorpay_subscription["id"]
    subscription.status = razorpay_subscription.get("status", "created")
    db.commit()

    return {
        "subscription_id": razorpay_subscription["id"],
        "key_id": settings.razorpay_key_id,
        "plan_id": plan_id,
        "customer_notify": 1,
        "notes": {"user_id": str(user.id)},
        "mock_mode": False,
    }


def activate_subscription_from_webhook(db: Session, razorpay_subscription_id: str, status: str) -> None:
    subscription = (
        db.query(Subscription)
        .filter(Subscription.razorpay_subscription_id == razorpay_subscription_id)
        .first()
    )
    if not subscription:
        return

    subscription.status = status
    if status in {"active", "authenticated"}:
        days = 365 if "yearly" in subscription.plan_id else 30
        subscription.current_period_end = datetime.utcnow() + timedelta(days=days)
    db.commit()
