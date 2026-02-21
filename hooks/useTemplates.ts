import { useState, useEffect } from "react";
import { Template } from "@/types/template";

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

export function useTemplates() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [templateName, setTemplateName] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setIsLoading(true);
      console.log("Fetching templates from:", "/api/templates");

      const response = await fetch("/api/templates", {
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        if (response.status === 404) {
          console.warn(
            `Templates API not found: ${response.status} ${response.statusText}`
          );
          console.warn("Returning empty template list as fallback.");
          setTemplates([]);
          return;
        } else {
          console.error(
            `Failed to fetch templates: ${response.status} ${response.statusText}`
          );
          alert(`Failed to load templates. Status: ${response.status}`);
          return;
        }
      }

      const data = await response.json();
      const mappedTemplates: Template[] = data.map((t: any) => ({
        id: t.template_id,
        name: t.template_name,
        questions: [],
      }));

      setTemplates(mappedTemplates);
    } catch (error) {
      console.error("Error fetching templates:", error);
      if (error instanceof Error) {
        console.error("Error details:", error.message);
      }
      alert("An error occurred while loading templates.");
    } finally {
      setIsLoading(false);
    }
  };

  const createTemplate = async (payload: any) => {
    try {
      const response = await fetch("/api/templates", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        if (response.status === 404) {
          console.warn(
            `Templates API not found: ${response.status} ${response.statusText}`
          );
          console.warn("Returning null as fallback.");
          return null;
        } else {
          console.error(
            `Failed to create template: ${response.status} ${response.statusText}`,
            errorText
          );
          alert(`Failed to create template: ${response.status}. ${errorText}`);
          return null;
        }
      }

      const createdTemplate = await response.json();
      return createdTemplate;
    } catch (error) {
      console.error("Error creating template:", error);
      alert("An error occurred while creating the template. Please try again.");
      return null;
    }
  };

  const deleteTemplate = async (templateId: string) => {
    try {
      const url = `/api/templates/${templateId}`;
      console.log("Deleting template from:", url);

      const response = await fetch(url, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      console.log(`Delete response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        if (response.status === 404) {
          console.warn(
            `Templates API not found: ${response.status} ${response.statusText}`
          );
          console.warn("Returning true as fallback.");
          return true; // Return true since 404 means it's already gone
        } else {
          console.error(
            `Failed to delete template: ${response.status} ${response.statusText}`,
            errorText
          );
          alert(
            `Failed to delete template. Status: ${response.status}. Please try again.`
          );
          return false;
        }
      }

      // Skip verification if API is not available
      const verifyResponse = await fetch("/api/templates", {
        headers: getAuthHeaders(),
      });
      if (!verifyResponse.ok) {
        if (verifyResponse.status === 404) {
          console.warn(
            `Templates API not found for verification: ${verifyResponse.status} ${verifyResponse.statusText}`
          );
          console.warn("Assuming deletion was successful.");
          return true; // Assume success if API doesn't exist
        } else {
          console.error(
            `Failed to verify deletion: ${verifyResponse.status} ${verifyResponse.statusText}`
          );
          alert("Unable to verify deletion. Please refresh the page to confirm.");
          return false;
        }
      }

      const data = await verifyResponse.json();
      const templateStillExists = data.some(
        (t: any) => t.template_id === templateId
      );

      if (templateStillExists) {
        console.error("Template still exists after deletion attempt");
        alert(
          "Template deletion failed on the server. Please try again or contact support."
        );
        return false;
      }

      console.log("Template verified as deleted from API");
      return true;
    } catch (error) {
      console.error("Error deleting template:", error);
      if (error instanceof Error) {
        console.error("Error message:", error.message);
      }
      alert("An error occurred while deleting the template. Please try again.");
      return false;
    }
  };

  const updateTemplateName = async (templateId: string, name: string, questions: any[]) => {
    try {
      const payload = {
        template_name: name,
        script_json: {
          template_id: templateId,
          questions: questions.map((q) => ({
            id: q.id,
            text: q.question,
            answer: q.answer,
            follow_ups: q.followUps.map((f: any) => ({
              id: f.id,
              text: f.question,
              answer: f.answer,
            })),
          })),
        },
      };

      const response = await fetch(`/api/templates/${templateId}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        if (response.status === 404) {
          console.warn(
            `Templates API not found: ${response.status} ${response.statusText}`
          );
          console.warn("Returning true as fallback.");
          return true; // Return true as fallback
        } else {
          console.error(
            `Failed to save template: ${response.status} ${response.statusText}`
          );
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error("Error saving template:", error);
      return false;
    }
  };

  const addNewTemplate = (template: Template) => {
    setTemplates([...templates, template]);
  };

  const removeTemplate = (templateId: string) => {
    const updatedTemplates = templates.filter((t) => t.id !== templateId);
    setTemplates(updatedTemplates);
    return updatedTemplates;
  };

  const updateTemplateInList = (templateId: string, name: string) => {
    setTemplates(
      templates.map((t) =>
        t.id === templateId ? { ...t, name } : t
      )
    );
  };

  return {
    templates,
    selectedTemplate,
    templateName,
    isLoading,
    setSelectedTemplate,
    setTemplateName,
    createTemplate,
    deleteTemplate,
    updateTemplateName,
    addNewTemplate,
    removeTemplate,
    updateTemplateInList,
    fetchTemplates,
  };
}
