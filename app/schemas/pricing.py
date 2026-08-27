"""Pricing plan schemas."""

from pydantic import BaseModel, ConfigDict, Field


class PricingPlanOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    code: str
    name: str
    price: float
    currency: str
    billing_period: str
    features: list[str] = Field(default_factory=list)
    is_active: bool
