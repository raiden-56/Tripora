import { apiRequest } from "./client";

export interface PricingPlan {
  id: number;
  code: string;
  name: string;
  price: number;
  currency: string;
  billing_period: string;
  features: string[];
  is_active: boolean;
}

export function listPricingPlans() {
  return apiRequest<PricingPlan[]>("/api/v1/pricing/plans", { auth: false });
}
