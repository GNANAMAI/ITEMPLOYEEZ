"""Community posts, comments, and expert API schemas."""

from datetime import datetime

from pydantic import BaseModel, Field


class CommunityPostAuthor(BaseModel):
    id: int
    name: str
    job_title: str | None = None

    model_config = {"from_attributes": True}


class CommunityPostCreate(BaseModel):
    post_type: str = "issue"
    title: str | None = None
    content: str
    company: str | None = None
    location: str | None = None
    contact_info: str | None = None


class CommunityPostResponse(BaseModel):
    id: int
    post_type: str
    title: str | None
    content: str
    status: str
    company: str | None = None
    location: str | None = None
    contact_info: str | None = None
    comment_count: int = 0
    created_at: datetime
    resolved_at: datetime | None = None
    author: CommunityPostAuthor
    product_slug: str

    model_config = {"from_attributes": True}


class CommunityPostStatusUpdate(BaseModel):
    status: str = Field(pattern="^(open|resolved)$")


class CommunityCommentCreate(BaseModel):
    content: str
    is_solution: bool = False


class CommunityCommentResponse(BaseModel):
    id: int
    post_id: int
    content: str
    is_solution: bool
    created_at: datetime
    author: CommunityPostAuthor

    model_config = {"from_attributes": True}


class CommunityExpertResponse(BaseModel):
    user_id: int
    name: str
    job_title: str | None = None
    expert_headline: str | None = None
    expert_bio: str | None = None
    is_self: bool = False


class CommunityExpertProfileUpdate(BaseModel):
    is_expert: bool = True
    expert_headline: str | None = None
    expert_bio: str | None = None


class ExpertMessageCreate(BaseModel):
    content: str


class ExpertMessageResponse(BaseModel):
    id: int
    from_user_id: int
    to_user_id: int
    content: str
    created_at: datetime
    from_user_name: str
    to_user_name: str


class CommunityStatsResponse(BaseModel):
    open_issues: int
    active_jobs: int
    blog_count: int
    expert_count: int
    member_count: int
