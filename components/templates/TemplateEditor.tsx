import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import QuestionCard from "./QuestionCard";
import { Question, FollowUpQuestion } from "@/types/template";

interface TemplateEditorProps {
  templateName: string;
  questions: Question[];
  onTemplateNameChange: (name: string) => void;
  onSaveTemplate: () => void;
  onDeleteTemplate: () => void;
  onAddQuestion: () => void;
  onUpdateQuestion: (id: string, field: keyof Question, value: string) => void;
  onDeleteQuestion: (id: string) => void;
  onAddFollowUp: (questionId: string) => void;
  onUpdateFollowUp: (
    questionId: string,
    followUpId: string,
    field: keyof FollowUpQuestion,
    value: string
  ) => void;
  onDeleteFollowUp: (questionId: string, followUpId: string) => void;
}

export default function TemplateEditor({
  templateName,
  questions,
  onTemplateNameChange,
  onSaveTemplate,
  onDeleteTemplate,
  onAddQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
  onAddFollowUp,
  onUpdateFollowUp,
  onDeleteFollowUp,
}: TemplateEditorProps) {
  return (
    <div className="max-w-4xl mx-auto p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">{templateName}</h1>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={onDeleteTemplate}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
          <Button
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={onSaveTemplate}
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
          onChange={(e) => onTemplateNameChange(e.target.value)}
          placeholder="Enter template name"
          className="w-full"
        />
      </div>

      {/* Questions Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">
              Questions & Answers
            </h3>
            <p className="text-sm text-gray-600">
              Add questions with answers and follow-up questions for your
              template
            </p>
          </div>
          <Button
            onClick={onAddQuestion}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Question
          </Button>
        </div>

        {/* Questions List */}
        <div className="space-y-6">
          {questions.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
              <p className="text-gray-500 mb-4">No questions added yet</p>
              <Button onClick={onAddQuestion} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Question
              </Button>
            </div>
          ) : (
            questions.map((question, index) => (
              <QuestionCard
                key={question.id}
                question={question}
                index={index}
                onUpdateQuestion={onUpdateQuestion}
                onDeleteQuestion={onDeleteQuestion}
                onAddFollowUp={onAddFollowUp}
                onUpdateFollowUp={onUpdateFollowUp}
                onDeleteFollowUp={onDeleteFollowUp}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
