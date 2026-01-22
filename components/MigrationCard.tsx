"use client";

import { useRouter } from "next/navigation";
import {
  MoreVertical,
  Clock,
  CheckCircle,
  Calendar,
  Briefcase,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Campaign {
  id: string;
  job_role: string;
  status: string; // allow unknown statuses safely
  created_at: string;
}

interface MigrationCardProps {
  campaign: Campaign;
  onView?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export default function MigrationCard({
  campaign,
  onView,
  onDelete,
}: MigrationCardProps) {
  const router = useRouter();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const statusConfig = {
    draft: {
      bgColor: "bg-amber-100",
      textColor: "text-amber-700",
      dotColor: "bg-amber-500",
      label: "Draft",
      icon: Clock,
    },
    active: {
      bgColor: "bg-green-100",
      textColor: "text-green-700",
      dotColor: "bg-green-500",
      label: "Active",
      icon: CheckCircle,
    },
    archived: {
      bgColor: "bg-gray-100",
      textColor: "text-gray-700",
      dotColor: "bg-gray-400",
      label: "Archived",
      icon: Clock,
    },
  } as const;

  const fallbackConfig = {
    bgColor: "bg-gray-100",
    textColor: "text-gray-700",
    dotColor: "bg-gray-400",
    label: campaign.status || "Unknown",
    icon: Clock,
  } as const;

  const config =
    statusConfig[campaign.status as keyof typeof statusConfig] ||
    fallbackConfig;
  const StatusIcon = config.icon;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <div
          className={`w-12 h-12 ${config.bgColor} rounded-xl flex items-center justify-center shrink-0`}
        >
          <Briefcase className={`w-5 h-5 ${config.textColor}`} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div
              className="flex-1 cursor-pointer"
              onClick={() =>
                onView
                  ? onView(campaign.id)
                  : router.push(`/campaigns/migrations/${campaign.id}`)
              }
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-1 hover:text-primary-600 transition-colors">
                {campaign.job_role || "Untitled Campaign"}
              </h3>
              <p className="text-sm text-gray-600">
                ID:{" "}
                <span className="font-medium">{campaign.id.slice(0, 8)}</span>
              </p>
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
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onView
                      ? onView(campaign.id)
                      : router.push(`/campaigns/migrations/${campaign.id}`);
                  }}
                  className="hover:bg-blue-50 hover:text-blue-700"
                >
                  View Details
                </DropdownMenuItem>
                {onDelete && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(campaign.id);
                    }}
                    className="hover:bg-red-50 hover:text-red-700"
                  >
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            <span
              className={`px-3 py-1 ${config.bgColor} ${config.textColor} text-xs font-medium rounded-full`}
            >
              {config.label}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-500">Created</span>
              </div>
              <p className="text-lg font-semibold text-gray-900">
                {formatDate(campaign.created_at)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {formatTime(campaign.created_at)}
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <StatusIcon className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-500">Status</span>
              </div>
              <p className="text-lg font-semibold text-gray-900 capitalize">
                {campaign.status}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Campaign {config.label}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
            <div className="text-sm text-gray-500">
              Created {formatDate(campaign.created_at)}
            </div>
            <span
              className={`px-3 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${config.bgColor} ${config.textColor}`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${config.dotColor}`}
              ></span>
              {config.label}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
