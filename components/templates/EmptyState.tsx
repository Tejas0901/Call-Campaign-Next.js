import { Plus, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onCreateTemplate: () => void;
}

export default function EmptyState({ onCreateTemplate }: EmptyStateProps) {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-12 h-12 text-gray-400" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          No Template Selected
        </h2>
        <p className="text-gray-600 mb-6">
          Create a new template to get started
        </p>
        <Button
          onClick={onCreateTemplate}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Template
        </Button>
      </div>
    </div>
  );
}
