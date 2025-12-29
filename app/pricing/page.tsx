"use client";

import PageHeader from "@/components/PageHeader";
import MainLayout from "@/components/layouts/MainLayout";
import { CreditCard, DollarSign, TrendingUp, CheckCircle } from "lucide-react";

const plans = [
  {
    title: "Basic Plan",
    price: "$10",
    period: "/month",
    description: "Perfect for small businesses",
    features: [
      "Up to 5 users",
      "Basic call analytics",
      "500 minutes/month",
      "Email support",
      "Standard campaigns",
    ],
    popular: false,
  },
  {
    title: "Professional",
    price: "$29",
    period: "/month",
    description: "For growing businesses",
    features: [
      "Up to 20 users",
      "Advanced analytics",
      "2000 minutes/month",
      "Priority support",
      "Unlimited campaigns",
      "CRM integration",
    ],
    popular: true,
  },
  {
    title: "Enterprise",
    price: "$99",
    period: "/month",
    description: "For large organizations",
    features: [
      "Unlimited users",
      "Advanced reporting",
      "Unlimited minutes",
      "24/7 dedicated support",
      "Custom integrations",
      "White-label options",
      "SLA guarantee",
    ],
    popular: false,
  },
];

export default function PricingPage() {
  return (
    <MainLayout>
      <div className="p-6">
        <PageHeader title="Pricing" />

        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Current Plan: Professional
          </h2>
          <p className="text-gray-600">Renews on January 15, 2024</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`border rounded-lg p-6 ${
                plan.popular
                  ? "border-orange-500 ring-2 ring-orange-500/20 relative cursor-pointer hover:shadow-md transition-shadow"
                  : "border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
              }`}
              onClick={() => {
                // Handle plan selection
                console.log(`Selected plan: ${plan.title}`);
                // In a real app, you would navigate to a checkout page or open a modal
                alert(
                  `Plan selected: ${plan.title}. In a real application, this would proceed to checkout.`
                );
              }}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-orange-500 text-white text-xs font-semibold px-4 py-1 rounded-full">
                  MOST POPULAR
                </div>
              )}
              <h3 className="text-lg font-semibold text-gray-900">
                {plan.title}
              </h3>
              <div className="mt-4 mb-6">
                <span className="text-3xl font-bold text-gray-900">
                  {plan.price}
                </span>
                <span className="text-gray-600">{plan.period}</span>
                <p className="text-sm text-gray-600 mt-1">{plan.description}</p>
              </div>
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                className={`w-full py-2 px-4 rounded-lg font-medium ${
                  plan.popular
                    ? "bg-orange-500 text-white hover:bg-orange-600"
                    : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                }`}
                onClick={(e) => {
                  e.stopPropagation(); // Prevent triggering parent click handler
                  // Handle plan selection
                  console.log(`Selected plan: ${plan.title}`);
                  // In a real app, you would navigate to a checkout page or open a modal
                  alert(
                    `Plan selected: ${plan.title}. In a real application, this would proceed to checkout.`
                  );
                }}
              >
                {plan.popular ? "Upgrade Plan" : "Select Plan"}
              </button>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Payment Information
          </h2>
          <div className="flex items-center gap-4">
            <CreditCard className="w-8 h-8 text-gray-400" />
            <div>
              <p className="font-medium">Visa ending in 4237</p>
              <p className="text-sm text-gray-600">Expires 12/2026</p>
            </div>
          </div>
          <button className="mt-4 text-orange-500 hover:text-orange-600 font-medium">
            Update Payment Method
          </button>
        </div>
      </div>
    </MainLayout>
  );
}
