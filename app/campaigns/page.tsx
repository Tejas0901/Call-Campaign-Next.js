"use client";

import { useState } from "react";
import MainLayout from "@/components/layouts/MainLayout";
import CampaignCard from "@/components/CampaignCard";
import CreateCampaignModal from "@/components/CreateCampaignModal";
import { campaignData } from "@/data/campaignData";
import { Plus, ChevronDown } from "lucide-react";

export default function Campaigns() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <MainLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Campaigns</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create Campaign
        </button>
      </div>

      <CreateCampaignModal open={isModalOpen} onOpenChange={setIsModalOpen} />

      <div className="flex gap-2 mb-6 pb-4 border-b border-gray-200">
        <button className="px-4 py-2 text-sm font-medium text-primary-600 border-b-2 border-primary-600">
          Active <span className="ml-1 text-gray-500">06</span>
        </button>
        <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">
          Archived <span className="ml-1 text-gray-500">06</span>
        </button>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
          <span>Triggered By</span>
          <ChevronDown className="w-4 h-4" />
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
          <span>Status</span>
          <ChevronDown className="w-4 h-4" />
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
          <span>Tags</span>
          <ChevronDown className="w-4 h-4" />
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
          <span>Sort by: Sent Email</span>
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4">
        {campaignData.campaigns.map((campaign) => (
          <CampaignCard key={campaign.id} campaign={campaign} />
        ))}
      </div>
    </MainLayout>
  );
}
