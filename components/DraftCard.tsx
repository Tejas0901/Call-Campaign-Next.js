"use client";

import { FileText, MoreVertical } from "lucide-react";
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
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
          <FileText className="w-5 h-5 text-amber-600" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {draft.jobInfo || "Untitled Draft"}
              </h3>
              <p className="text-sm text-gray-600">
                Job Code:{" "}
                <span className="font-medium">{draft.jobCode || "N/A"}</span>
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                  <MoreVertical className="w-5 h-5 text-gray-400" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-32">
                <DropdownMenuItem
                  onClick={() => onContinue(draft)}
                  className="hover:bg-blue-50 hover:text-blue-700"
                >
                  Continue
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete(draft.id)}
                  className="hover:bg-red-50 hover:text-red-700"
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            <span className="px-3 py-1 bg-amber-50 text-amber-700 text-xs font-medium rounded-full">
              Draft
            </span>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="text-sm text-gray-500">
              Saved {new Date(draft.savedAt).toLocaleString()}
            </div>
            <button
              onClick={() => onContinue(draft)}
              className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
            >
              Continue Editing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
