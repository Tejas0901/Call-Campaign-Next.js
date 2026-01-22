"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { X } from "lucide-react";

export interface CandidateRow {
  id: string;
  name: string;
  phone: string;
  email: string;
  resume?: File | string | null;
  resumeFileName?: string;
  role?: string;
  company?: string;
  candidateId?: string;
}

interface CandidatesTableProps {
  data: CandidateRow[];
  onDataChange?: (data: CandidateRow[]) => void;
  onSelectionChange?: (selectedIds: string[]) => void;
}

export default function CandidatesTable({
  data,
  onDataChange,
  onSelectionChange,
}: CandidatesTableProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(data.map((row) => row.id));
      setSelectedIds(allIds);
      onSelectionChange?.(Array.from(allIds));
    } else {
      setSelectedIds(new Set());
      onSelectionChange?.([]);
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
    onSelectionChange?.(Array.from(newSelected));
  };

  const handleRemoveResume = (rowId: string) => {
    const updatedData = data.map((row) =>
      row.id === rowId
        ? { ...row, resume: null, resumeFileName: undefined }
        : row,
    );
    onDataChange?.(updatedData);
  };

  const isAllSelected = data.length > 0 && selectedIds.size === data.length;
  const isPartiallySelected =
    selectedIds.size > 0 && selectedIds.size < data.length;

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left">
                <Checkbox
                  checked={isAllSelected || isPartiallySelected}
                  onCheckedChange={handleSelectAll}
                  className="mt-1"
                />
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                Name
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                Candidate ID
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                Phone No.
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                Email
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                Resume
              </th>
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((row, index) => (
                <tr
                  key={row.id}
                  className={`border-b border-gray-200 transition-colors ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  } hover:bg-orange-50`}
                >
                  <td className="px-4 py-3">
                    <Checkbox
                      checked={selectedIds.has(row.id)}
                      onCheckedChange={(checked) =>
                        handleSelectRow(row.id, checked as boolean)
                      }
                      className="mt-1"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                    {row.name}
                  </td>
                  <td
                    className="px-4 py-3 text-sm text-gray-600 font-mono truncate max-w-xs"
                    title={row.candidateId || row.id}
                  >
                    {row.candidateId || row.id}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {row.phone}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {row.email}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {row.resumeFileName ? (
                        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded px-2 py-1">
                          <a
                            href={
                              typeof row.resume === "string"
                                ? row.resume
                                : undefined
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-semibold text-green-700 hover:text-green-800 underline"
                          >
                            View resume
                          </a>
                          <span className="text-xs text-green-700 truncate max-w-32">
                            {row.resumeFileName}
                          </span>
                          <button
                            onClick={() => handleRemoveResume(row.id)}
                            className="text-green-600 hover:text-green-700"
                            title="Remove resume"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500">—</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  No candidates added yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
