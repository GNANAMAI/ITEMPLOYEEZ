"""Per-product community membership (subscription access)."""

from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class CommunityMembership(Base):
    __tablename__ = "community_memberships"
    __table_args__ = (UniqueConstraint("user_id", "product_detail_id", name="uq_user_product"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    product_detail_id: Mapped[int] = mapped_column(ForeignKey("product_details.id"), nullable=False, index=True)
    razorpay_subscription_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="inactive")
    current_period_end: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    is_expert: Mapped[bool] = mapped_column(Boolean, default=False)
    expert_headline: Mapped[str | None] = mapped_column(String(255), nullable=True)
    expert_bio: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="memberships")
    product_detail = relationship("ProductDetail", back_populates="memberships")
