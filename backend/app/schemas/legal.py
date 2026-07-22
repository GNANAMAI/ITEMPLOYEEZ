"""Legal page schemas."""

from pydantic import BaseModel


class LegalPageResponse(BaseModel):
    slug: str
    title: str
    content: str

    model_config = {"from_attributes": True}
