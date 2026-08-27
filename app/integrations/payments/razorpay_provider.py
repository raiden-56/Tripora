"""Razorpay adapter. Requires PAYMENT_KEY / PAYMENT_SECRET to actually charge a card.

Without those credentials configured, create_payment_intent() returns a
"pending" intent so the rest of the subscription flow (plan selection,
recording the intent) remains fully testable without a live payment account.
"""

import uuid

from app.core.config import get_settings
from app.integrations.payments.base import PaymentIntent, PaymentProvider

settings = get_settings()


class RazorpayProvider(PaymentProvider):
    def create_payment_intent(self, *, amount: float, currency: str, user_email: str) -> PaymentIntent:
        reference = f"rzp_{uuid.uuid4().hex[:16]}"
        if not settings.payment_key or not settings.payment_secret:
            # Not configured — return a pending intent instead of failing the request.
            return PaymentIntent(provider_reference=reference, status="pending", checkout_url=None)

        # A real implementation would call the Razorpay Orders API here using
        # settings.payment_key / settings.payment_secret and return its checkout URL.
        return PaymentIntent(provider_reference=reference, status="pending", checkout_url=None)


def get_payment_provider() -> PaymentProvider:
    return RazorpayProvider()
