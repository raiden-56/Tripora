"""Payment provider abstraction — keeps Razorpay (or any provider) fully swappable."""

from abc import ABC, abstractmethod
from dataclasses import dataclass


@dataclass
class PaymentIntent:
    provider_reference: str
    status: str  # pending | succeeded | failed
    checkout_url: str | None = None


class PaymentProvider(ABC):
    @abstractmethod
    def create_payment_intent(self, *, amount: float, currency: str, user_email: str) -> PaymentIntent:
        raise NotImplementedError
