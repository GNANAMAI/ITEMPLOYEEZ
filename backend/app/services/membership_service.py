"""Community membership helpers."""

from datetime import datetime, timedelta

from sqlalchemy.orm import Session

from app.models.membership import CommunityMembership
from app.models.product import ProductDetail
from app.models.user import User


def membership_is_active(membership: CommunityMembership | None) -> bool:
    if not membership:
        return False
    if membership.status not in {"active", "authenticated"}:
        return False
    if membership.current_period_end and membership.current_period_end < datetime.utcnow():
        return False
    return True


def get_membership_for_product(
    db: Session, user_id: int, product_detail_id: int
) -> CommunityMembership | None:
    return (
        db.query(CommunityMembership)
        .filter(
            CommunityMembership.user_id == user_id,
            CommunityMembership.product_detail_id == product_detail_id,
        )
        .first()
    )


def get_or_create_membership(
    db: Session, user: User, product: ProductDetail
) -> CommunityMembership:
    membership = get_membership_for_product(db, user.id, product.id)
    if membership:
        return membership

    membership = CommunityMembership(
        user_id=user.id,
        product_detail_id=product.id,
        status="inactive",
    )
    db.add(membership)
    db.commit()
    db.refresh(membership)
    return membership


def activate_membership(
    db: Session,
    membership: CommunityMembership,
    razorpay_subscription_id: str | None,
    status: str,
    period_days: int = 365,
) -> None:
    membership.razorpay_subscription_id = razorpay_subscription_id
    membership.status = status
    if status in {"active", "authenticated"}:
        membership.current_period_end = datetime.utcnow() + timedelta(days=period_days)
    db.commit()


def activate_membership_from_webhook(
    db: Session, razorpay_subscription_id: str, status: str
) -> None:
    membership = (
        db.query(CommunityMembership)
        .filter(CommunityMembership.razorpay_subscription_id == razorpay_subscription_id)
        .first()
    )
    if not membership:
        return

    membership.status = status
    if status in {"active", "authenticated"}:
        membership.current_period_end = datetime.utcnow() + timedelta(days=365)
    db.commit()
