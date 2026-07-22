"""Contact form schemas."""

from pydantic import BaseModel, EmailStr, Field


class ContactCreate(BaseModel):
    name: str = Field(min_length=2, max_length=255)
    email: EmailStr
    phone: str | None = None
    subject: str | None = None
    message: str = Field(min_length=10, max_length=5000)


class ContactResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    phone: str | None
    subject: str | None
    message: str

    model_config = {"from_attributes": True}
