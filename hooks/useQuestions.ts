import { useState } from "react";
import { Question, FollowUpQuestion } from "@/types/template";

export function useQuestions() {
  const [questions, setQuestions] = useState<Question[]>([]);

  const loadQuestionsFromTemplate = async (templateId: string) => {
    try {
      const url = `/api/templates/${templateId}`;
      console.log("Fetching template details from:", url);

      const response = await fetch(url);
      if (!response.ok) {
        console.error(
          `Failed to fetch template details: ${response.status} ${response.statusText}`
        );
        return;
      }

      const templateDetails = await response.json();
      const mappedQuestions: Question[] =
        templateDetails.script_json?.questions?.map((q: any) => ({
          id: q.id,
          question: q.text || "",
          answer: q.answer || "",
          followUps:
            q.follow_ups?.map((f: any) => ({
              id: f.id,
              question: f.text || "",
              answer: f.answer || "",
            })) || [],
        })) || [];

      setQuestions(mappedQuestions);
    } catch (error) {
      console.error("Error fetching template details:", error);
      if (error instanceof Error) {
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
      }
    }
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      question: "",
      answer: "",
      followUps: [],
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (id: string, field: keyof Question, value: string) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, [field]: value } : q))
    );
  };

  const deleteQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const addFollowUp = (questionId: string) => {
    const newFollowUp: FollowUpQuestion = {
      id: Date.now().toString(),
      question: "",
      answer: "",
    };
    setQuestions(
      questions.map((q) =>
        q.id === questionId
          ? { ...q, followUps: [...q.followUps, newFollowUp] }
          : q
      )
    );
  };

  const updateFollowUp = (
    questionId: string,
    followUpId: string,
    field: keyof FollowUpQuestion,
    value: string
  ) => {
    setQuestions(
      questions.map((q) =>
        q.id === questionId
          ? {
              ...q,
              followUps: q.followUps.map((f) =>
                f.id === followUpId ? { ...f, [field]: value } : f
              ),
            }
          : q
      )
    );
  };

  const deleteFollowUp = (questionId: string, followUpId: string) => {
    setQuestions(
      questions.map((q) =>
        q.id === questionId
          ? { ...q, followUps: q.followUps.filter((f) => f.id !== followUpId) }
          : q
      )
    );
  };

  const clearQuestions = () => {
    setQuestions([]);
  };

  return {
    questions,
    setQuestions,
    loadQuestionsFromTemplate,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    addFollowUp,
    updateFollowUp,
    deleteFollowUp,
    clearQuestions,
  };
}
