"""Membership API routes."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.dependencies import get_current_user
from app.models.membership import CommunityMembership
from app.models.product import ProductCategory, ProductDetail
from app.models.user import User
from app.schemas.membership import (
    MembershipCategorySummary,
    MembershipCheckResponse,
    MembershipGroupResponse,
    MembershipProductSummary,
    MembershipResponse,
)
from app.services.membership_service import membership_is_active

router = APIRouter(prefix="/memberships", tags=["memberships"])


def _membership_response(membership: CommunityMembership) -> MembershipResponse:
    product = membership.product_detail
    category = product.category if product else None
    return MembershipResponse(
        id=membership.id,
        product_detail_id=membership.product_detail_id,
        status=membership.status,
        current_period_end=membership.current_period_end,
        is_active=membership_is_active(membership),
        product=MembershipProductSummary(
            id=product.id,
            slug=product.slug,
            title=product.title,
            image_url=product.image_url,
        ),
        category=MembershipCategorySummary(
            id=category.id,
            name=category.name,
            slug=category.slug,
            image_url=category.image_url,
        )
        if category
        else None,
    )


@router.get("/mine", response_model=list[MembershipResponse])
def list_my_memberships(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    memberships = (
        db.query(CommunityMembership)
        .options(joinedload(CommunityMembership.product_detail).joinedload(ProductDetail.category))
        .filter(CommunityMembership.user_id == current_user.id)
        .all()
    )
    return [_membership_response(m) for m in memberships if membership_is_active(m)]


@router.get("/mine/grouped", response_model=list[MembershipGroupResponse])
def list_grouped_memberships(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    memberships = (
        db.query(CommunityMembership)
        .options(joinedload(CommunityMembership.product_detail).joinedload(ProductDetail.category))
        .filter(CommunityMembership.user_id == current_user.id)
        .all()
    )
    active = [m for m in memberships if membership_is_active(m)]
    grouped: dict[int, MembershipGroupResponse] = {}

    for membership in active:
        product = membership.product_detail
        category = product.category
        if not category:
            continue
        if category.id not in grouped:
            grouped[category.id] = MembershipGroupResponse(
                category=MembershipCategorySummary(
                    id=category.id,
                    name=category.name,
                    slug=category.slug,
                    image_url=category.image_url,
                ),
                products=[],
            )
        grouped[category.id].products.append(
            MembershipProductSummary(
                id=product.id,
                slug=product.slug,
                title=product.title,
                image_url=product.image_url,
            )
        )

    return list(grouped.values())


@router.get("/check/{slug}", response_model=MembershipCheckResponse)
def check_membership(
    slug: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    product = db.query(ProductDetail).filter(ProductDetail.slug == slug).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    membership = (
        db.query(CommunityMembership)
        .options(joinedload(CommunityMembership.product_detail).joinedload(ProductDetail.category))
        .filter(
            CommunityMembership.user_id == current_user.id,
            CommunityMembership.product_detail_id == product.id,
        )
        .first()
    )

    if not membership or not membership_is_active(membership):
        return MembershipCheckResponse(has_access=False, membership=None)

    return MembershipCheckResponse(has_access=True, membership=_membership_response(membership))
