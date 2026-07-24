"""Razorpay subscription integration."""

from datetime import datetime, timedelta

import razorpay
from sqlalchemy.orm import Session

from app.config import get_settings
from app.models.product import ProductDetail
from app.models.user import User
from app.services.membership_service import activate_membership, get_or_create_membership

settings = get_settings()


def get_razorpay_client() -> razorpay.Client | None:
    if not settings.razorpay_key_id or not settings.razorpay_key_secret:
        return None
    return razorpay.Client(auth=(settings.razorpay_key_id, settings.razorpay_key_secret))


def resolve_plan_id(product: ProductDetail, plan_type: str) -> str:
    if product.razorpay_plan_id:
        return product.razorpay_plan_id
    if plan_type == "monthly":
        return settings.razorpay_plan_monthly
    return settings.razorpay_plan_yearly


def create_product_checkout(
    db: Session, user: User, product: ProductDetail, plan_type: str = "yearly"
) -> dict:
    plan_id = resolve_plan_id(product, plan_type)
    membership = get_or_create_membership(db, user, product)

    client = get_razorpay_client()
    if client is None:
        activate_membership(
            db,
            membership,
            razorpay_subscription_id=f"mock_sub_{user.id}_{product.id}",
            status="active",
            period_days=365 if plan_type == "yearly" else 30,
        )
        return {
            "subscription_id": membership.razorpay_subscription_id,
            "key_id": "mock_key",
            "plan_id": plan_id,
            "customer_notify": 1,
            "notes": {
                "user_id": str(user.id),
                "product_slug": product.slug,
                "email": user.email,
            },
            "mock_mode": True,
            "product_slug": product.slug,
            "product_title": product.title,
            "amount_paise": product.price_paise,
        }

    payload = {
        "plan_id": plan_id,
        "total_count": 12 if plan_type == "monthly" else 1,
        "customer_notify": 1,
        "notes": {
            "user_id": str(user.id),
            "product_slug": product.slug,
            "email": user.email,
        },
    }
    razorpay_subscription = client.subscription.create(payload)

    membership.razorpay_subscription_id = razorpay_subscription["id"]
    membership.status = razorpay_subscription.get("status", "created")
    db.commit()

    return {
        "subscription_id": razorpay_subscription["id"],
        "key_id": settings.razorpay_key_id,
        "plan_id": plan_id,
        "customer_notify": 1,
        "notes": {
            "user_id": str(user.id),
            "product_slug": product.slug,
            "email": user.email,
        },
        "mock_mode": False,
        "product_slug": product.slug,
        "product_title": product.title,
        "amount_paise": product.price_paise,
    }
