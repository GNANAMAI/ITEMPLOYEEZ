"""Product API schemas."""

from pydantic import BaseModel


class ProductCategoryResponse(BaseModel):
    id: int
    name: str
    slug: str
    image_url: str
    description: str | None
    product_detail_slug: str | None
    show_on_home: bool

    model_config = {"from_attributes": True}


class ProductDetailResponse(BaseModel):
    id: int
    slug: str
    title: str
    description: str | None
    image_url: str
    gallery_urls: list[str]
    category_id: int | None

    model_config = {"from_attributes": True}
