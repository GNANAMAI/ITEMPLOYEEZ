"""Community posts, comments, experts, and messaging API routes."""

from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import and_, func, or_
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.dependencies import get_current_user
from app.models.community import CommunityComment, CommunityExpertMessage, CommunityPost
from app.models.membership import CommunityMembership
from app.models.product import ProductDetail
from app.models.user import User
from app.schemas.community import (
    CommunityCommentCreate,
    CommunityCommentResponse,
    CommunityExpertProfileUpdate,
    CommunityExpertResponse,
    CommunityPostAuthor,
    CommunityPostCreate,
    CommunityPostResponse,
    CommunityPostStatusUpdate,
    CommunityStatsResponse,
    ExpertMessageCreate,
    ExpertMessageResponse,
)
from app.services.membership_service import membership_is_active

router = APIRouter(prefix="/communities", tags=["communities"])

VALID_POST_TYPES = {"issue", "blog", "job"}


def _require_membership(db: Session, user: User, slug: str) -> tuple[ProductDetail, CommunityMembership]:
    product = db.query(ProductDetail).filter(ProductDetail.slug == slug).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    membership = (
        db.query(CommunityMembership)
        .filter(
            CommunityMembership.user_id == user.id,
            CommunityMembership.product_detail_id == product.id,
        )
        .first()
    )
    if not membership or not membership_is_active(membership):
        raise HTTPException(status_code=403, detail="Active membership required for this community")

    return product, membership


def _author(user: User) -> CommunityPostAuthor:
    return CommunityPostAuthor(id=user.id, name=user.name, job_title=user.job_title)


def _post_response(post: CommunityPost, product: ProductDetail, comment_count: int | None = None) -> CommunityPostResponse:
    count = comment_count
    if count is None:
        count = len(post.comments) if post.comments is not None else 0
    return CommunityPostResponse(
        id=post.id,
        post_type=post.post_type,
        title=post.title,
        content=post.content,
        status=post.status or "open",
        company=post.company,
        location=post.location,
        contact_info=post.contact_info,
        comment_count=count,
        created_at=post.created_at,
        resolved_at=post.resolved_at,
        author=_author(post.user),
        product_slug=product.slug,
    )


def _get_post_or_404(db: Session, product: ProductDetail, post_id: int) -> CommunityPost:
    post = (
        db.query(CommunityPost)
        .options(joinedload(CommunityPost.user), joinedload(CommunityPost.comments))
        .filter(CommunityPost.id == post_id, CommunityPost.product_detail_id == product.id)
        .first()
    )
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post


@router.get("/{slug}/stats", response_model=CommunityStatsResponse)
def community_stats(
    slug: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    product, _ = _require_membership(db, current_user, slug)

    open_issues = (
        db.query(func.count(CommunityPost.id))
        .filter(
            CommunityPost.product_detail_id == product.id,
            CommunityPost.post_type == "issue",
            CommunityPost.status == "open",
        )
        .scalar()
        or 0
    )
    active_jobs = (
        db.query(func.count(CommunityPost.id))
        .filter(CommunityPost.product_detail_id == product.id, CommunityPost.post_type == "job")
        .scalar()
        or 0
    )
    blog_count = (
        db.query(func.count(CommunityPost.id))
        .filter(CommunityPost.product_detail_id == product.id, CommunityPost.post_type == "blog")
        .scalar()
        or 0
    )
    expert_count = (
        db.query(func.count(CommunityMembership.id))
        .filter(
            CommunityMembership.product_detail_id == product.id,
            CommunityMembership.is_expert.is_(True),
            CommunityMembership.status.in_(("active", "authenticated")),
        )
        .scalar()
        or 0
    )
    member_count = (
        db.query(func.count(CommunityMembership.id))
        .filter(
            CommunityMembership.product_detail_id == product.id,
            CommunityMembership.status.in_(("active", "authenticated")),
        )
        .scalar()
        or 0
    )

    return CommunityStatsResponse(
        open_issues=open_issues,
        active_jobs=active_jobs,
        blog_count=blog_count,
        expert_count=expert_count,
        member_count=member_count,
    )


@router.get("/{slug}/posts", response_model=list[CommunityPostResponse])
def list_posts(
    slug: str,
    post_type: str = Query(default="issue"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if post_type not in VALID_POST_TYPES:
        raise HTTPException(status_code=400, detail="Invalid post type")

    product, _ = _require_membership(db, current_user, slug)
    posts = (
        db.query(CommunityPost)
        .options(joinedload(CommunityPost.user), joinedload(CommunityPost.comments))
        .filter(
            CommunityPost.product_detail_id == product.id,
            CommunityPost.post_type == post_type,
        )
        .order_by(CommunityPost.created_at.desc())
        .all()
    )

    return [_post_response(post, product, len(post.comments)) for post in posts]


@router.get("/{slug}/posts/{post_id}", response_model=CommunityPostResponse)
def get_post(
    slug: str,
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    product, _ = _require_membership(db, current_user, slug)
    post = _get_post_or_404(db, product, post_id)
    return _post_response(post, product, len(post.comments))


@router.post("/{slug}/posts", response_model=CommunityPostResponse)
def create_post(
    slug: str,
    payload: CommunityPostCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if payload.post_type not in VALID_POST_TYPES:
        raise HTTPException(status_code=400, detail="Invalid post type")
    if not payload.content.strip():
        raise HTTPException(status_code=400, detail="Content is required")

    title = (payload.title or "").strip() or None
    if payload.post_type in {"issue", "blog", "job"} and not title:
        raise HTTPException(status_code=400, detail="Title is required")

    if payload.post_type == "job" and not (payload.company or "").strip():
        raise HTTPException(status_code=400, detail="Company is required for job posts")

    product, _ = _require_membership(db, current_user, slug)
    post = CommunityPost(
        user_id=current_user.id,
        product_detail_id=product.id,
        post_type=payload.post_type,
        title=title,
        content=payload.content.strip(),
        status="open" if payload.post_type == "issue" else "open",
        company=(payload.company or "").strip() or None,
        location=(payload.location or "").strip() or None,
        contact_info=(payload.contact_info or "").strip() or None,
    )
    db.add(post)
    db.commit()
    db.refresh(post)
    post.user = current_user
    post.comments = []

    return _post_response(post, product, 0)


@router.patch("/{slug}/posts/{post_id}/status", response_model=CommunityPostResponse)
def update_post_status(
    slug: str,
    post_id: int,
    payload: CommunityPostStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    product, _ = _require_membership(db, current_user, slug)
    post = _get_post_or_404(db, product, post_id)

    if post.post_type != "issue":
        raise HTTPException(status_code=400, detail="Only issue posts have status")

    post.status = payload.status
    if payload.status == "resolved":
        post.resolved_by_user_id = current_user.id
        post.resolved_at = datetime.utcnow()
    else:
        post.resolved_by_user_id = None
        post.resolved_at = None

    db.commit()
    db.refresh(post)
    return _post_response(post, product, len(post.comments))


@router.get("/{slug}/posts/{post_id}/comments", response_model=list[CommunityCommentResponse])
def list_comments(
    slug: str,
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    product, _ = _require_membership(db, current_user, slug)
    _get_post_or_404(db, product, post_id)

    comments = (
        db.query(CommunityComment)
        .options(joinedload(CommunityComment.user))
        .filter(CommunityComment.post_id == post_id)
        .order_by(CommunityComment.created_at.asc())
        .all()
    )
    return [
        CommunityCommentResponse(
            id=c.id,
            post_id=c.post_id,
            content=c.content,
            is_solution=c.is_solution,
            created_at=c.created_at,
            author=_author(c.user),
        )
        for c in comments
    ]


@router.post("/{slug}/posts/{post_id}/comments", response_model=CommunityCommentResponse)
def create_comment(
    slug: str,
    post_id: int,
    payload: CommunityCommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not payload.content.strip():
        raise HTTPException(status_code=400, detail="Content is required")

    product, _ = _require_membership(db, current_user, slug)
    post = _get_post_or_404(db, product, post_id)

    is_solution = bool(payload.is_solution and post.post_type == "issue")
    comment = CommunityComment(
        post_id=post.id,
        user_id=current_user.id,
        content=payload.content.strip(),
        is_solution=is_solution,
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)

    return CommunityCommentResponse(
        id=comment.id,
        post_id=comment.post_id,
        content=comment.content,
        is_solution=comment.is_solution,
        created_at=comment.created_at,
        author=_author(current_user),
    )


@router.get("/{slug}/experts", response_model=list[CommunityExpertResponse])
def list_experts(
    slug: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    product, _ = _require_membership(db, current_user, slug)

    memberships = (
        db.query(CommunityMembership)
        .options(joinedload(CommunityMembership.user))
        .filter(
            CommunityMembership.product_detail_id == product.id,
            CommunityMembership.is_expert.is_(True),
            CommunityMembership.status.in_(("active", "authenticated")),
        )
        .all()
    )

    return [
        CommunityExpertResponse(
            user_id=m.user_id,
            name=m.user.name,
            job_title=m.user.job_title,
            expert_headline=m.expert_headline,
            expert_bio=m.expert_bio,
            is_self=m.user_id == current_user.id,
        )
        for m in memberships
        if membership_is_active(m)
    ]


@router.put("/{slug}/experts/me", response_model=CommunityExpertResponse)
def update_my_expert_profile(
    slug: str,
    payload: CommunityExpertProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    product, membership = _require_membership(db, current_user, slug)

    membership.is_expert = payload.is_expert
    membership.expert_headline = (payload.expert_headline or "").strip() or None
    membership.expert_bio = (payload.expert_bio or "").strip() or None
    if membership.is_expert and not membership.expert_headline:
        raise HTTPException(status_code=400, detail="Expert headline is required")

    db.commit()
    db.refresh(membership)

    return CommunityExpertResponse(
        user_id=current_user.id,
        name=current_user.name,
        job_title=current_user.job_title,
        expert_headline=membership.expert_headline,
        expert_bio=membership.expert_bio,
        is_self=True,
    )


@router.get("/{slug}/experts/{user_id}/thread", response_model=list[ExpertMessageResponse])
def get_expert_thread(
    slug: str,
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    product, _ = _require_membership(db, current_user, slug)

    expert_membership = (
        db.query(CommunityMembership)
        .filter(
            CommunityMembership.product_detail_id == product.id,
            CommunityMembership.user_id == user_id,
            CommunityMembership.is_expert.is_(True),
            CommunityMembership.status.in_(("active", "authenticated")),
        )
        .first()
    )
    if not expert_membership or not membership_is_active(expert_membership):
        raise HTTPException(status_code=404, detail="Expert not found in this community")

    messages = (
        db.query(CommunityExpertMessage)
        .options(
            joinedload(CommunityExpertMessage.from_user),
            joinedload(CommunityExpertMessage.to_user),
        )
        .filter(
            CommunityExpertMessage.product_detail_id == product.id,
            or_(
                and_(
                    CommunityExpertMessage.from_user_id == current_user.id,
                    CommunityExpertMessage.to_user_id == user_id,
                ),
                and_(
                    CommunityExpertMessage.from_user_id == user_id,
                    CommunityExpertMessage.to_user_id == current_user.id,
                ),
            ),
        )
        .order_by(CommunityExpertMessage.created_at.asc())
        .all()
    )

    return [
        ExpertMessageResponse(
            id=m.id,
            from_user_id=m.from_user_id,
            to_user_id=m.to_user_id,
            content=m.content,
            created_at=m.created_at,
            from_user_name=m.from_user.name,
            to_user_name=m.to_user.name,
        )
        for m in messages
    ]


@router.post("/{slug}/experts/{user_id}/thread", response_model=ExpertMessageResponse)
def send_expert_message(
    slug: str,
    user_id: int,
    payload: ExpertMessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not payload.content.strip():
        raise HTTPException(status_code=400, detail="Content is required")
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot message yourself")

    product, _ = _require_membership(db, current_user, slug)

    # Target must be an active community member; prefer expert as recipient
    target_membership = (
        db.query(CommunityMembership)
        .options(joinedload(CommunityMembership.user))
        .filter(
            CommunityMembership.product_detail_id == product.id,
            CommunityMembership.user_id == user_id,
            CommunityMembership.status.in_(("active", "authenticated")),
        )
        .first()
    )
    if not target_membership or not membership_is_active(target_membership):
        raise HTTPException(status_code=404, detail="Member not found in this community")

    # At least one party should be an expert
    sender_membership = (
        db.query(CommunityMembership)
        .filter(
            CommunityMembership.product_detail_id == product.id,
            CommunityMembership.user_id == current_user.id,
        )
        .first()
    )
    if not (target_membership.is_expert or (sender_membership and sender_membership.is_expert)):
        raise HTTPException(status_code=400, detail="Messages require an expert participant")

    message = CommunityExpertMessage(
        product_detail_id=product.id,
        from_user_id=current_user.id,
        to_user_id=user_id,
        content=payload.content.strip(),
    )
    db.add(message)
    db.commit()
    db.refresh(message)

    return ExpertMessageResponse(
        id=message.id,
        from_user_id=message.from_user_id,
        to_user_id=message.to_user_id,
        content=message.content,
        created_at=message.created_at,
        from_user_name=current_user.name,
        to_user_name=target_membership.user.name,
    )
