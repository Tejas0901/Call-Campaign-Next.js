import { Plus } from "lucide-react";
import { Template } from "@/types/template";

interface TemplateSidebarProps {
  templates: Template[];
  selectedTemplate: string | null;
  onSelectTemplate: (template: Template) => void;
  onCreateTemplate: () => void;
}

export default function TemplateSidebar({
  templates,
  selectedTemplate,
  onSelectTemplate,
  onCreateTemplate,
}: TemplateSidebarProps) {
  return (
    <div className="w-72 border-r border-gray-200 bg-white">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          Template Library
        </h2>
        <button
          onClick={onCreateTemplate}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <Plus className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      <div className="p-3">
        <div className="mb-4">
          <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <span>📁</span>
            <span>PERSONAL</span>
            <span className="ml-auto text-gray-400">Only visible to you</span>
          </div>
          <div className="space-y-1">
            {templates.length === 0 ? (
              <p className="px-3 py-2 text-sm text-gray-500 italic">
                No templates yet. Click + to create one.
              </p>
            ) : (
              templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => onSelectTemplate(template)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedTemplate === template.id
                      ? "bg-gray-100 text-gray-900 font-medium"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {template.name}
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
