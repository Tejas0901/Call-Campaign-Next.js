import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { NewTemplateForm } from "@/types/template";

interface CreateTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateTemplate: (form: NewTemplateForm) => Promise<void>;
}

const initialFormState: NewTemplateForm = {
  template_name: "",
  description: "",
  template_type: "straight",
  category: "",
  industry: "",
  role_type: "",
  experience_level: "",
  tags: "",
  difficulty_level: "SIMPLE",
  language: "en-IN",
  estimated_duration_seconds: 60,
  created_by: "admin",
  owner_id: "admin",
};

export default function CreateTemplateDialog({
  open,
  onOpenChange,
  onCreateTemplate,
}: CreateTemplateDialogProps) {
  const [form, setForm] = useState<NewTemplateForm>(initialFormState);

  const handleSubmit = async () => {
    if (!form.template_name.trim()) {
      alert("Template name is required");
      return;
    }
    if (!form.description.trim()) {
      alert("Description is required");
      return;
    }
    if (!form.category.trim()) {
      alert("Category is required");
      return;
    }
    if (!form.industry.trim()) {
      alert("Industry is required");
      return;
    }
    if (!form.role_type.trim()) {
      alert("Role type is required");
      return;
    }
    if (!form.tags.trim()) {
      alert("Tags are required");
      return;
    }

    await onCreateTemplate(form);
    setForm(initialFormState);
  };

  const handleCancel = () => {
    setForm(initialFormState);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Template</DialogTitle>
          <DialogDescription>
            Fill in the details to create a new call campaign template.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          {/* Template Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Template Name <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="e.g., Java Developer Advanced Screening"
              value={form.template_name}
              onChange={(e) =>
                setForm({ ...form, template_name: e.target.value })
              }
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <Textarea
              placeholder="Enter template description..."
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="min-h-20 resize-none"
            />
          </div>

          {/* Template Type and Difficulty Level */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Template Type <span className="text-red-500">*</span>
              </label>
              <Select
                value={form.template_type}
                onValueChange={(value) =>
                  setForm({ ...form, template_type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="straight">Straight</SelectItem>
                  <SelectItem value="nested">Nested</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty Level <span className="text-red-500">*</span>
              </label>
              <Select
                value={form.difficulty_level}
                onValueChange={(value) =>
                  setForm({ ...form, difficulty_level: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SIMPLE">Simple</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="ADVANCED">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Category and Industry */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="e.g., screening, interview"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Industry <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="e.g., IT, Healthcare, Finance"
                value={form.industry}
                onChange={(e) => setForm({ ...form, industry: e.target.value })}
              />
            </div>
          </div>

          {/* Role Type and Experience Level */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role Type <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="e.g., Developer, Manager"
                value={form.role_type}
                onChange={(e) =>
                  setForm({ ...form, role_type: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Experience Level
              </label>
              <Input
                placeholder="e.g., Junior, Senior, Expert"
                value={form.experience_level}
                onChange={(e) =>
                  setForm({ ...form, experience_level: e.target.value })
                }
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="Enter tags separated by commas (e.g., java, developer, screening)"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
            />
            <p className="text-xs text-gray-500 mt-1">
              Separate multiple tags with commas
            </p>
          </div>

          {/* Language and Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Language <span className="text-red-500">*</span>
              </label>
              <Select
                value={form.language}
                onValueChange={(value) => setForm({ ...form, language: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en-IN">English (India)</SelectItem>
                  <SelectItem value="en-US">English (US)</SelectItem>
                  <SelectItem value="hi-IN">Hindi</SelectItem>
                  <SelectItem value="es-ES">Spanish</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estimated Duration (seconds){" "}
                <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                placeholder="60"
                value={form.estimated_duration_seconds}
                onChange={(e) =>
                  setForm({
                    ...form,
                    estimated_duration_seconds: parseInt(e.target.value) || 60,
                  })
                }
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                !form.template_name.trim() ||
                !form.description.trim() ||
                !form.category.trim() ||
                !form.industry.trim() ||
                !form.role_type.trim() ||
                !form.tags.trim()
              }
              className="bg-blue-600 hover:bg-blue-700"
            >
              Create Template
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
