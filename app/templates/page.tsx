"use client";

import { useState } from "react";
import MainLayout from "@/components/layouts/MainLayout";
import PageHeader from "@/components/PageHeader";
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
import { Plus, Trash2, Copy, GripVertical, Info, FileText } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface Template {
  id: string;
  name: string;
}

interface Section {
  id: string;
  type: "repeating" | "normal";
  repeatFor?: string;
  content: string;
  notesStyle: string;
  format: string;
  length: string;
  autofill: boolean;
}

export default function TemplatesPage() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [templateName, setTemplateName] = useState("");
  const [newTemplateName, setNewTemplateName] = useState("");
  const [sections, setSections] = useState<Section[]>([]);

  const handleCreateTemplate = () => {
    if (!newTemplateName.trim()) return;

    const newTemplate: Template = {
      id: Date.now().toString(),
      name: newTemplateName,
    };
    setTemplates([...templates, newTemplate]);
    setSelectedTemplate(newTemplate.id);
    setTemplateName(newTemplateName);
    setSections([]);
    setShowCreateDialog(false);
    setNewTemplateName("");
  };

  const handleSelectTemplate = (template: Template) => {
    setSelectedTemplate(template.id);
    setTemplateName(template.name);
  };

  const handleDeleteTemplate = () => {
    if (!selectedTemplate) return;

    const updatedTemplates = templates.filter((t) => t.id !== selectedTemplate);
    setTemplates(updatedTemplates);

    if (updatedTemplates.length > 0) {
      setSelectedTemplate(updatedTemplates[0].id);
      setTemplateName(updatedTemplates[0].name);
    } else {
      setSelectedTemplate(null);
      setTemplateName("");
      setSections([]);
    }
  };

  const handleTemplateNameChange = (newName: string) => {
    setTemplateName(newName);
    if (selectedTemplate) {
      setTemplates(
        templates.map((t) =>
          t.id === selectedTemplate ? { ...t, name: newName } : t
        )
      );
    }
  };

  const addSection = (type: "repeating" | "normal") => {
    const newSection: Section = {
      id: Date.now().toString(),
      type,
      repeatFor: type === "repeating" ? "Question" : undefined,
      content: "",
      notesStyle: "Text",
      format: "Paragraph",
      length: "Medium",
      autofill: true,
    };
    setSections([...sections, newSection]);
  };

  const updateSection = (id: string, updates: Partial<Section>) => {
    setSections(
      sections.map((section) =>
        section.id === id ? { ...section, ...updates } : section
      )
    );
  };

  const deleteSection = (id: string) => {
    setSections(sections.filter((section) => section.id !== id));
  };

  const duplicateSection = (id: string) => {
    const section = sections.find((s) => s.id === id);
    if (section) {
      const newSection = { ...section, id: Date.now().toString() };
      setSections([...sections, newSection]);
    }
  };

  return (
    <MainLayout>
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Left Sidebar - Template Library */}
        <div className="w-72 border-r border-gray-200 bg-white">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Template Library
            </h2>
            <button
              onClick={() => setShowCreateDialog(true)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <Plus className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          <div className="p-3">
            {/* Personal Section */}
            <div className="mb-4">
              <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <span>📁</span>
                <span>PERSONAL</span>
                <span className="ml-auto text-gray-400">
                  Only visible to you
                </span>
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
                      onClick={() => handleSelectTemplate(template)}
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

            {/* Made by Metaview Section */}
            <div>
              <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <span>🏢</span>
                <span>MADE BY METAVIEW</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          {selectedTemplate ? (
            <div className="max-w-4xl mx-auto p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-semibold text-gray-900">
                  {templateName}
                </h1>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDeleteTemplate}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Save Template
                  </Button>
                </div>
              </div>

              {/* Template Name Input */}
              <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template name
                </label>
                <Input
                  value={templateName}
                  onChange={(e) => handleTemplateNameChange(e.target.value)}
                  placeholder="Enter template name"
                  className="w-full"
                />
              </div>

              {/* Customize Template Section */}
              <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                <h3 className="text-base font-semibold text-gray-900 mb-2">
                  Customize Template
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  Get started with this default AI Notes templates by Metaview.
                  Personalize and add your own custom sections to format your AI
                  Notes exactly how you want them.
                </p>

                {/* Sections */}
                <div className="space-y-4">
                  {sections.map((section) => (
                    <div
                      key={section.id}
                      className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                    >
                      {/* Section Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <GripVertical className="w-5 h-5 text-gray-400" />
                          <span className="text-sm text-gray-600 flex items-center gap-2">
                            This is a repeating section
                            <Info className="w-4 h-4 text-gray-400" />
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => duplicateSection(section.id)}
                            className="p-1 hover:bg-gray-200 rounded"
                          >
                            <Copy className="w-4 h-4 text-gray-600" />
                          </button>
                          <button
                            onClick={() => deleteSection(section.id)}
                            className="p-1 hover:bg-gray-200 rounded"
                          >
                            <Trash2 className="w-4 h-4 text-gray-600" />
                          </button>
                        </div>
                      </div>

                      {/* Repeat For */}
                      {section.type === "repeating" && (
                        <div className="mb-4">
                          <Select
                            value={section.repeatFor}
                            onValueChange={(value) =>
                              updateSection(section.id, { repeatFor: value })
                            }
                          >
                            <SelectTrigger className="w-48">
                              <SelectValue placeholder="Select repeat type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Question">
                                For each Question
                              </SelectItem>
                              <SelectItem value="Topic">
                                For each Topic
                              </SelectItem>
                              <SelectItem value="Item">
                                For each Item
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {/* Content Textarea */}
                      <Textarea
                        value={section.content}
                        onChange={(e) =>
                          updateSection(section.id, { content: e.target.value })
                        }
                        placeholder="Enter section content..."
                        className="mb-4 min-h-24 resize-none"
                      />

                      {/* Options Row */}
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Notes style
                          </label>
                          <Select
                            value={section.notesStyle}
                            onValueChange={(value) =>
                              updateSection(section.id, { notesStyle: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Text">Text</SelectItem>
                              <SelectItem value="Bullet Points">
                                Bullet Points
                              </SelectItem>
                              <SelectItem value="Numbered List">
                                Numbered List
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Format
                          </label>
                          <Select
                            value={section.format}
                            onValueChange={(value) =>
                              updateSection(section.id, { format: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Paragraph">
                                Paragraph
                              </SelectItem>
                              <SelectItem value="Sentence">Sentence</SelectItem>
                              <SelectItem value="Word">Word</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Length
                          </label>
                          <Select
                            value={section.length}
                            onValueChange={(value) =>
                              updateSection(section.id, { length: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Short">Short</SelectItem>
                              <SelectItem value="Medium">Medium</SelectItem>
                              <SelectItem value="Long">Long</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Autofill Toggle */}
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={section.autofill}
                            onCheckedChange={(checked) =>
                              updateSection(section.id, { autofill: checked })
                            }
                          />
                          <span className="text-sm font-medium text-gray-900">
                            Autofill with AI
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">
                          Metaview will automatically populate this section.
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Section Buttons */}
                <div className="flex gap-4 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => addSection("normal")}
                    className="flex-1"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    New section
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => addSection("repeating")}
                    className="flex-1"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    New repeating section
                  </Button>
                </div>
              </div>
            </div>
          ) : (
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
                  onClick={() => setShowCreateDialog(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Template
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Template Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Template</DialogTitle>
            <DialogDescription>
              Create a new template to organize your AI notes.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Template Name
              </label>
              <Input
                placeholder="Enter template name"
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newTemplateName.trim()) {
                    handleCreateTemplate();
                  }
                }}
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateDialog(false);
                  setNewTemplateName("");
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateTemplate}
                disabled={!newTemplateName.trim()}
              >
                Create Template
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
