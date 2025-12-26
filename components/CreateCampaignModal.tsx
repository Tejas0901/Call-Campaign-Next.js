"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

// Sample job codes - replace with your actual data
const jobCodes = [
  { value: "JC001", label: "Marketing Campaign - Email" },
  { value: "JC002", label: "Sales Outreach - Phone" },
  { value: "JC003", label: "Customer Support - SMS" },
  { value: "JC004", label: "Product Launch - Multi-Channel" },
  { value: "JC005", label: "Event Promotion - Social Media" },
  { value: "JC006", label: "Lead Generation - Email" },
  { value: "JC007", label: "Customer Retention - SMS" },
  { value: "JC008", label: "Brand Awareness - Multi-Channel" },
];

interface CreateCampaignModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValues?: {
    id?: string;
    jobCode?: string;
    jobInfo?: string;
  };
  onCreated?: (payload: {
    id?: string;
    jobCode: string;
    jobInfo: string;
  }) => void;
  onDraftSaved?: (
    drafts: Array<{
      id: string;
      jobCode: string;
      jobInfo: string;
      savedAt: string;
    }>
  ) => void;
}

export default function CreateCampaignModal({
  open,
  onOpenChange,
  initialValues,
  onCreated,
  onDraftSaved,
}: CreateCampaignModalProps) {
  const [jobCode, setJobCode] = useState("");
  const [jobInfo, setJobInfo] = useState("");
  const [openCombobox, setOpenCombobox] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showMigrateDialog, setShowMigrateDialog] = useState(false);

  // Prefill form when opening with initial values

  // eslint-disable-next-line react-hooks/rules-of-hooks
  if (typeof window !== "undefined") {
    // no-op, ensure window exists for localStorage inside functions below
  }

  const readDrafts = (): any[] => {
    try {
      const raw =
        typeof window !== "undefined"
          ? window.localStorage.getItem("campaignDrafts")
          : null;
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const writeDrafts = (drafts: any[]) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("campaignDrafts", JSON.stringify(drafts));
    }
  };

  const removeDraftById = (id?: string) => {
    if (!id) return;
    const existing = readDrafts();
    writeDrafts(existing.filter((d: any) => d.id !== id));
  };

  const upsertDraft = (draft: any) => {
    const existing = readDrafts();
    const idx = existing.findIndex((d: any) => d.id === draft.id);
    if (idx >= 0) {
      existing[idx] = draft;
      writeDrafts(existing);
      return existing;
    } else {
      const next = [draft, ...existing];
      writeDrafts(next);
      return next;
    }
  };

  // Sync state when opening with initialValues
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (open && initialValues) {
      setJobCode(initialValues.jobCode ?? "");
      setJobInfo(initialValues.jobInfo ?? "");
    }
  }, [open, initialValues]);

  const saveDraft = () => {
    try {
      const draft = {
        id:
          initialValues?.id ??
          (typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : String(Date.now())),
        jobCode,
        jobInfo,
        savedAt: new Date().toISOString(),
      };
      const nextDrafts = upsertDraft(draft);
      onDraftSaved?.(nextDrafts);
      onOpenChange(false);
    } catch (err) {
      console.error("Failed to save draft", err);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Handle form submission here
    const payload = { id: initialValues?.id, jobCode, jobInfo };
    console.log("Campaign created:", payload);

    // If this was from a draft, remove it
    removeDraftById(initialValues?.id);

    // Notify parent if needed
    onCreated?.(payload);

    // Reset form
    setJobCode("");
    setJobInfo("");

    // Close modal
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create Campaign</DialogTitle>
            <DialogDescription>
              Fill in the details below to create a new campaign.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            <div className="space-y-2">
              <Label htmlFor="jobCode">Job Code</Label>
              <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                <PopoverTrigger asChild>
                  <Button
                    id="jobCode"
                    variant="outline"
                    role="combobox"
                    aria-expanded={openCombobox}
                    className="w-full justify-between"
                  >
                    {jobCode
                      ? jobCodes.find((code) => code.value === jobCode)?.label
                      : "Select job code..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[450px] p-0">
                  <Command>
                    <CommandInput placeholder="Search job code..." />
                    <CommandList>
                      <CommandEmpty>No job code found.</CommandEmpty>
                      <CommandGroup>
                        {jobCodes.map((code) => (
                          <CommandItem
                            key={code.value}
                            value={code.value}
                            onSelect={(currentValue) => {
                              setJobCode(
                                currentValue === jobCode ? "" : currentValue
                              );
                              setOpenCombobox(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                jobCode === code.value
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {code.label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="jobInfo">Job Info</Label>
              <Input
                id="jobInfo"
                type="text"
                placeholder="Enter job information..."
                value={jobInfo}
                onChange={(e) => setJobInfo(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="default"
                  className="flex-1 justify-center bg-primary-600 text-white hover:bg-primary-700"
                  onClick={() => setShowAddDialog(true)}
                >
                  Add candidates
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 justify-center border-amber-300 text-amber-700 hover:bg-amber-50"
                  onClick={() => setShowMigrateDialog(true)}
                >
                  Migrate
                </Button>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={saveDraft}
                disabled={!jobCode && !jobInfo}
              >
                Save as Draft
              </Button>
              <Button type="submit" disabled={!jobCode || !jobInfo}>
                Create Campaign
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add candidates</DialogTitle>
          </DialogHeader>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 border-primary-200 text-primary-700 hover:bg-primary-50"
            >
              Excel import
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1 border-primary-200 text-primary-700 hover:bg-primary-50"
            >
              Import manually
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showMigrateDialog} onOpenChange={setShowMigrateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Migrate candidates</DialogTitle>
          </DialogHeader>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 border-amber-300 text-amber-800 hover:bg-amber-50"
            >
              From existing DB
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1 border-amber-300 text-amber-800 hover:bg-amber-50"
            >
              From Excel sheet
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
