"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Mail, MessageSquare, Clock, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Campaign {
  id: number;
  name: string;
  description: string;
  icon: string;
  iconBg: string;
  tags: string[];
  metrics: {
    delivered: number;
    deliveredPeriod: string;
    opened: number;
    openedPeriod: string;
    clicked: number;
    clickedPeriod: string;
    converted: number;
    convertedPeriod: string;
  };
  status: string;
  messagesCount: number;
  actionsCount: number;
}

export default function CampaignCard({ campaign }: { campaign: Campaign }) {
  const [status, setStatus] = useState<string>(campaign.status);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const savedStatus = localStorage.getItem(`campaign-${campaign.id}-status`);
    if (savedStatus) {
      setStatus(savedStatus);
    }
    setHydrated(true);
  }, [campaign.id]);

  useEffect(() => {
    if (hydrated) {
      localStorage.setItem(`campaign-${campaign.id}-status`, status);
    }
  }, [status, campaign.id, hydrated]);

  const getIconComponent = (icon: string) => {
    switch (icon) {
      case "Mail":
        return <Mail className="w-5 h-5 text-white" />;
      case "MessageSquare":
        return <MessageSquare className="w-5 h-5 text-white" />;
      default:
        return <Mail className="w-5 h-5 text-white" />;
    }
  };

  const statusStyles: Record<string, { container: string; dot: string }> = {
    Running: { container: "bg-green-50 text-green-700", dot: "bg-green-500" },
    Closed: { container: "bg-red-50 text-red-700", dot: "bg-red-500" },
    Paused: { container: "bg-amber-50 text-amber-700", dot: "bg-amber-500" },
  };

  const statusClass = statusStyles[status] || {
    container: "bg-gray-50 text-gray-700",
    dot: "bg-gray-500",
  };

  return (
    <Link href={`/campaigns/${campaign.id}`} className="block">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex items-start gap-4">
          <div
            className={`w-12 h-12 ${campaign.iconBg} rounded-xl flex items-center justify-center shrink-0`}
          >
            {getIconComponent(campaign.icon)}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {campaign.name}
                </h3>
                <p className="text-sm text-gray-600">{campaign.description}</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="p-1 hover:bg-gray-100 rounded transition-colors cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="w-5 h-5 text-gray-400" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-32">
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      setStatus("Running");
                    }}
                    className="hover:bg-green-50 hover:text-green-700"
                  >
                    Start
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      setStatus("Paused");
                    }}
                    className="hover:bg-amber-50 hover:text-amber-700"
                  >
                    Pause
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      setStatus("Running");
                    }}
                    className="hover:bg-blue-50 hover:text-blue-700"
                  >
                    Resume
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      setStatus("Closed");
                    }}
                    className="hover:bg-red-50 hover:text-red-700"
                  >
                    Stop
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {campaign.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-500">Delivered</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {campaign.metrics.delivered}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {campaign.metrics.deliveredPeriod}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-500">Opened</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {campaign.metrics.opened}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {campaign.metrics.openedPeriod}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-500">Clicked</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {campaign.metrics.clicked}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {campaign.metrics.clickedPeriod}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-500">Converted</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {campaign.metrics.converted}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {campaign.metrics.convertedPeriod}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {campaign.messagesCount < 10
                      ? `0${campaign.messagesCount}`
                      : campaign.messagesCount}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {campaign.actionsCount < 10
                      ? `0${campaign.actionsCount}`
                      : campaign.actionsCount}
                  </span>
                </div>
              </div>
              {hydrated && (
                <span
                  className={`px-3 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${statusClass.container}`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${statusClass.dot}`}
                  ></span>
                  {status}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
