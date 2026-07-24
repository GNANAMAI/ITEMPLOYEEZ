"""Product category and featured product detail models."""

from sqlalchemy import ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class ProductCategory(Base):
    __tablename__ = "product_categories"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    image_url: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    product_detail_slug: Mapped[str | None] = mapped_column(String(255), nullable=True)
    show_on_home: Mapped[bool] = mapped_column(default=False)

    product_details = relationship("ProductDetail", back_populates="category")


class ProductDetail(Base):
    __tablename__ = "product_details"

    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    subtitle: Mapped[str | None] = mapped_column(String(500), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    image_url: Mapped[str] = mapped_column(String(500), nullable=False)
    gallery_urls: Mapped[str | None] = mapped_column(Text, nullable=True)
    category_id: Mapped[int | None] = mapped_column(ForeignKey("product_categories.id"), nullable=True)
    price_paise: Mapped[int] = mapped_column(Integer, default=9900)
    billing_period: Mapped[str] = mapped_column(String(20), default="yearly")
    razorpay_plan_id: Mapped[str | None] = mapped_column(String(100), nullable=True)

    category = relationship("ProductCategory", back_populates="product_details")
    memberships = relationship("CommunityMembership", back_populates="product_detail")
    posts = relationship("CommunityPost", back_populates="product_detail")
