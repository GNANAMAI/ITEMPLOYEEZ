"""Service API schemas."""

from pydantic import BaseModel


class ServiceResponse(BaseModel):
    id: int
    slug: str
    title: str
    excerpt: str
    content: str

    model_config = {"from_attributes": True}
