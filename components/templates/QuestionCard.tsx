import { Plus, Trash2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Question, FollowUpQuestion } from "@/types/template";

interface QuestionCardProps {
  question: Question;
  index: number;
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

export default function QuestionCard({
  question,
  index,
  onUpdateQuestion,
  onDeleteQuestion,
  onAddFollowUp,
  onUpdateFollowUp,
  onDeleteFollowUp,
}: QuestionCardProps) {
  return (
    <div className="border border-gray-200 rounded-lg p-5 bg-gray-50">
      {/* Question Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <GripVertical className="w-5 h-5 text-gray-400 mt-1" />
          <span className="text-sm font-semibold text-gray-700">
            Question {index + 1}
          </span>
        </div>
        <button
          onClick={() => onDeleteQuestion(question.id)}
          className="p-1 hover:bg-gray-200 rounded text-red-600"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Question Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Question
        </label>
        <Input
          value={question.question}
          onChange={(e) =>
            onUpdateQuestion(question.id, "question", e.target.value)
          }
          placeholder="Enter your question..."
          className="w-full"
        />
      </div>

      {/* Answer Textarea */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Answer
        </label>
        <Textarea
          value={question.answer}
          onChange={(e) =>
            onUpdateQuestion(question.id, "answer", e.target.value)
          }
          placeholder="Enter the answer..."
          className="w-full min-h-24 resize-none"
        />
      </div>

      {/* Follow-up Questions */}
      <div className="mt-4 pl-8 border-l-2 border-blue-200">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-gray-700">
            Follow-up Questions
          </h4>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onAddFollowUp(question.id)}
          >
            <Plus className="w-3 h-3 mr-1" />
            Add Follow-up
          </Button>
        </div>

        {question.followUps.length === 0 ? (
          <p className="text-xs text-gray-500 italic py-2">
            No follow-up questions yet
          </p>
        ) : (
          <div className="space-y-3">
            {question.followUps.map((followUp, fIndex) => (
              <div
                key={followUp.id}
                className="bg-white border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-blue-600">
                    Follow-up {fIndex + 1}
                  </span>
                  <button
                    onClick={() => onDeleteFollowUp(question.id, followUp.id)}
                    className="p-1 hover:bg-gray-100 rounded text-red-500"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
                <div className="mb-3">
                  <Input
                    value={followUp.question}
                    onChange={(e) =>
                      onUpdateFollowUp(
                        question.id,
                        followUp.id,
                        "question",
                        e.target.value
                      )
                    }
                    placeholder="Follow-up question..."
                    className="text-sm"
                  />
                </div>
                <Textarea
                  value={followUp.answer}
                  onChange={(e) =>
                    onUpdateFollowUp(
                      question.id,
                      followUp.id,
                      "answer",
                      e.target.value
                    )
                  }
                  placeholder="Follow-up answer..."
                  className="text-sm min-h-16 resize-none"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
