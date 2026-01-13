"use client";

import { FileText, MoreVertical, Clock } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Draft {
  id: string;
  jobCode: string;
  jobInfo: string;
  savedAt: string;
}

interface DraftCardProps {
  draft: Draft;
  onContinue: (draft: Draft) => void;
  onDelete: (id: string) => void;
}

export default function DraftCard({
  draft,
  onContinue,
  onDelete,
}: DraftCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
          <FileText className="w-5 h-5 text-amber-600" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div
              className="flex-1 cursor-pointer"
              onClick={() => onContinue(draft)}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-1 hover:text-primary-600 transition-colors">
                {draft.jobInfo || "Untitled Draft"}
              </h3>
              <p className="text-sm text-gray-600">
                Job Code:{" "}
                <span className="font-medium">{draft.jobCode || "N/A"}</span>
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
              <DropdownMenuContent align="end" className="w-32">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onContinue(draft);
                  }}
                  className="hover:bg-blue-50 hover:text-blue-700"
                >
                  Continue
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(draft.id);
                  }}
                  className="hover:bg-red-50 hover:text-red-700"
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
              Draft
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-500">Saved</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">—</p>
              <p className="text-xs text-gray-500 mt-1">
                {formatDate(draft.savedAt)}
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <FileText className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-500">Status</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">—</p>
              <p className="text-xs text-gray-500 mt-1">In Progress</p>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
            <div className="text-sm text-gray-500">
              Last modified {formatDate(draft.savedAt)}
            </div>
            <span className="px-3 py-1 text-xs font-medium rounded-full flex items-center gap-1 bg-amber-50 text-amber-700">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              Draft
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
