"use client";

import { useRouter } from "next/navigation";
import {
  MoreVertical,
  Clock,
  CheckCircle,
  Calendar,
  Briefcase,
  MapPin,
  Users,
  Phone,
  IndianRupee,
  Pause,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Campaign } from "@/types/campaign";

interface CampaignSearchCardProps {
  campaign: Campaign;
  onView?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function CampaignSearchCard({
  campaign,
  onView,
  onDelete,
}: CampaignSearchCardProps) {
  const router = useRouter();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
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
    paused: {
      bgColor: "bg-orange-100",
      textColor: "text-orange-700",
      dotColor: "bg-orange-500",
      label: "Paused",
      icon: Pause,
    },
    completed: {
      bgColor: "bg-blue-100",
      textColor: "text-blue-700",
      dotColor: "bg-blue-500",
      label: "Completed",
      icon: CheckCircle,
    },
  } as const;

  const config = statusConfig[campaign.status as keyof typeof statusConfig] || {
    bgColor: "bg-gray-100",
    textColor: "text-gray-700",
    dotColor: "bg-gray-400",
    label: campaign.status || "Unknown",
    icon: Clock,
  };
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
                  : router.push(`/campaigns/${campaign.id}`)
              }
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-1 hover:text-primary-600 transition-colors">
                {campaign.name || campaign.job_role}
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                {campaign.job_role} • {campaign.hiring_company_name}
              </p>
              {campaign.description && (
                <p className="text-sm text-gray-500 line-clamp-2">
                  {campaign.description}
                </p>
              )}
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
                      : router.push(`/campaigns/${campaign.id}`);
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
            <Badge variant="outline" className="text-xs">
              {campaign.work_mode.charAt(0).toUpperCase() +
                campaign.work_mode.slice(1)}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {campaign.job_type === "fulltime"
                ? "Full Time"
                : campaign.job_type === "parttime"
                ? "Part Time"
                : "Contract"}
            </Badge>
            {campaign.is_drive && (
              <Badge variant="secondary" className="text-xs">
                Walk-in Drive
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-500">Location</span>
              </div>
              <p className="text-sm font-medium text-gray-900">
                {campaign.job_location}
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <IndianRupee className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-500">CTC Range</span>
              </div>
              <p className="text-sm font-medium text-gray-900">
                {campaign.min_ctc} - {campaign.max_ctc} LPA
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-500">Experience</span>
              </div>
              <p className="text-sm font-medium text-gray-900">
                {campaign.experience_min} - {campaign.experience_max} years
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-500">Contacts</span>
              </div>
              <p className="text-sm font-medium text-gray-900">
                {campaign.total_contacts}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>Created {formatDate(campaign.created_at)}</span>
              </div>
              {campaign.completed_calls > 0 && (
                <div className="flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  <span>
                    {campaign.completed_calls}/{campaign.total_contacts} calls
                  </span>
                </div>
              )}
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
