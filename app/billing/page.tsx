"use client";

import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import MainLayout from "@/components/layouts/MainLayout";
import {
  CreditCard,
  FileText,
  BarChart3,
  Settings,
  DollarSign,
  AlertCircle,
} from "lucide-react";

type TabType = "overview" | "payment" | "history" | "credits" | "preferences";

export default function BillingPage() {
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  const tabs: { id: TabType; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "payment", label: "Payment methods" },
    { id: "history", label: "Billing history" },
    { id: "credits", label: "Credit grants" },
    { id: "preferences", label: "Preferences" },
  ];

  return (
    <MainLayout>
      <div className="p-6 max-w-7xl">
        <PageHeader title="Billing" />

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <div className="flex gap-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-4 px-1 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? "text-gray-900 border-b-2 border-orange-500"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Sections */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Free Trial Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                Free trial
              </h2>

              <div className="mb-8">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-gray-600">
                    Credit remaining
                  </span>
                  <AlertCircle className="w-4 h-4 text-gray-400" />
                </div>
                <div className="text-5xl font-bold text-gray-900 mb-6">
                  $0.00
                </div>
                <div className="flex gap-3">
                  <button className="px-6 py-2 bg-white border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                    Add payment details
                  </button>
                  <button className="px-6 py-2 bg-white border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                    View usage
                  </button>
                </div>
              </div>

              {/* Note Box */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex gap-3">
                <AlertCircle className="w-5 h-5 text-gray-600 mt-0.5 shrink-0" />
                <p className="text-sm text-gray-700">
                  Note: This does not reflect the status of your ChatGPT
                  account.
                </p>
              </div>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Payment Methods Card */}
              <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex gap-3 mb-4">
                  <CreditCard className="w-6 h-6 text-gray-700" />
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">
                      Payment methods
                    </h3>
                    <p className="text-sm text-gray-600">
                      Add or change payment method
                    </p>
                  </div>
                </div>
              </div>

              {/* Billing History Card */}
              <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex gap-3 mb-4">
                  <FileText className="w-6 h-6 text-gray-700" />
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">
                      Billing history
                    </h3>
                    <p className="text-sm text-gray-600">
                      View past and current invoices
                    </p>
                  </div>
                </div>
              </div>

              {/* Preferences Card */}
              <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex gap-3 mb-4">
                  <Settings className="w-6 h-6 text-gray-700" />
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">
                      Preferences
                    </h3>
                    <p className="text-sm text-gray-600">
                      Manage billing information
                    </p>
                  </div>
                </div>
              </div>

              {/* Usage Limits Card */}
              <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex gap-3 mb-4">
                  <BarChart3 className="w-6 h-6 text-gray-700" />
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">
                      Usage limits
                    </h3>
                    <p className="text-sm text-gray-600">
                      Set monthly spend limits
                    </p>
                  </div>
                </div>
              </div>

              {/* Pricing Card */}
              <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex gap-3 mb-4">
                  <DollarSign className="w-6 h-6 text-gray-700" />
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">
                      Pricing
                    </h3>
                    <p className="text-sm text-gray-600">
                      View pricing and FAQs
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "payment" && (
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Payment methods
            </h2>
            <div className="text-center py-12">
              <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No payment methods added yet</p>
              <button className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors">
                Add payment method
              </button>
            </div>
          </div>
        )}

        {activeTab === "history" && (
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Billing history
            </h2>
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No billing history available</p>
            </div>
          </div>
        )}

        {activeTab === "credits" && (
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Credit grants
            </h2>
            <div className="text-center py-12">
              <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No credits available</p>
            </div>
          </div>
        )}

        {activeTab === "preferences" && (
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Preferences
            </h2>
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-6">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                  />
                  <span className="text-gray-900 font-medium">
                    Email notifications for billing
                  </span>
                </label>
              </div>
              <div className="border-b border-gray-200 pb-6">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                  />
                  <span className="text-gray-900 font-medium">
                    Monthly usage reports
                  </span>
                </label>
              </div>
              <div className="pb-6">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                  />
                  <span className="text-gray-900 font-medium">
                    Remind me when credits are low
                  </span>
                </label>
              </div>
              <button className="px-6 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors">
                Save preferences
              </button>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
