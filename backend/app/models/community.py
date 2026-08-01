"""Community posts, comments, and expert messages within a product subscription."""

from datetime import datetime, timezone
import sqlalchemy as sa
from sqlalchemy import Boolean, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


# 🛠️ Custom SQLite Timezone Decorator
class UTCDateTime(sa.TypeDecorator):
    """Ensures datetimes saved/read from SQLite always preserve UTC awareness."""
    impl = sa.DateTime
    cache_ok = True

    def process_bind_param(self, value, dialect):
        if value is not None and value.tzinfo is not None:
            # Convert to UTC and strip tzinfo so SQLite saves a clean ISO-like string
            return value.astimezone(timezone.utc).replace(tzinfo=None)
        return value

    def process_result_value(self, value, dialect):
        if value is not None and value.tzinfo is None:
            # Tag raw strings coming from SQLite cleanly as explicit UTC
            return value.replace(tzinfo=timezone.utc)
        return value


class CommunityPost(Base):
    __tablename__ = "community_posts"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    product_detail_id: Mapped[int] = mapped_column(ForeignKey("product_details.id"), nullable=False, index=True)
    post_type: Mapped[str] = mapped_column(String(20), default="issue", nullable=False)
    title: Mapped[str | None] = mapped_column(String(500), nullable=True)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="open", nullable=False)
    company: Mapped[str | None] = mapped_column(String(255), nullable=True)
    location: Mapped[str | None] = mapped_column(String(255), nullable=True)
    contact_info: Mapped[str | None] = mapped_column(String(500), nullable=True)
    resolved_by_user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    
    # Updated to custom UTCDateTime
    resolved_at: Mapped[datetime | None] = mapped_column(UTCDateTime, nullable=True)
    
    # Updated to custom UTCDateTime and replaced deprecated datetime.utcnow
    created_at: Mapped[datetime] = mapped_column(
        UTCDateTime, 
        default=lambda: datetime.now(timezone.utc)
    )

    user = relationship("User", back_populates="community_posts", foreign_keys=[user_id])
    resolved_by = relationship("User", foreign_keys=[resolved_by_user_id])
    product_detail = relationship("ProductDetail", back_populates="posts")
    comments = relationship("CommunityComment", back_populates="post", cascade="all, delete-orphan")


class CommunityComment(Base):
    __tablename__ = "community_comments"

    id: Mapped[int] = mapped_column(primary_key=True)
    post_id: Mapped[int] = mapped_column(ForeignKey("community_posts.id"), nullable=False, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    is_solution: Mapped[bool] = mapped_column(Boolean, default=False)
  
    created_at: Mapped[datetime] = mapped_column(
        UTCDateTime, 
        default=lambda: datetime.now(timezone.utc)
    )

    post = relationship("CommunityPost", back_populates="comments")
    user = relationship("User", back_populates="community_comments")


class CommunityExpertMessage(Base):
    __tablename__ = "community_expert_messages"

    id: Mapped[int] = mapped_column(primary_key=True)
    product_detail_id: Mapped[int] = mapped_column(ForeignKey("product_details.id"), nullable=False, index=True)
    from_user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    to_user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    
    created_at: Mapped[datetime] = mapped_column(
        UTCDateTime, 
        default=lambda: datetime.now(timezone.utc)
    )

    product_detail = relationship("ProductDetail")
    from_user = relationship("User", foreign_keys=[from_user_id])
    to_user = relationship("User", foreign_keys=[to_user_id])
