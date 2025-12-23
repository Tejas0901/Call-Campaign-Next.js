"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
}

export default function CreateCampaignModal({
  open,
  onOpenChange,
}: CreateCampaignModalProps) {
  const [jobCode, setJobCode] = useState("");
  const [jobInfo, setJobInfo] = useState("");
  const [candidateInfo, setCandidateInfo] = useState("");
  const [openCombobox, setOpenCombobox] = useState(false);
  const [showMigrateAlert, setShowMigrateAlert] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Handle form submission here
    console.log("Campaign created:", { jobCode, jobInfo, candidateInfo });

    // Reset form
    setJobCode("");
    setJobInfo("");
    setCandidateInfo("");

    // Close modal
    onOpenChange(false);
  };

  const handleMigrate = () => {
    // Handle migration logic here
    console.log("Migrating candidate info:", candidateInfo);
    setShowMigrateAlert(false);
  };

  return (
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
            <Label htmlFor="candidateInfo">Candidate Info</Label>
            <div className="flex gap-2">
              <Input
                id="candidateInfo"
                type="text"
                placeholder="Enter candidate information..."
                value={candidateInfo}
                onChange={(e) => setCandidateInfo(e.target.value)}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowMigrateAlert(true)}
                disabled={!candidateInfo}
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
            <Button type="submit" disabled={!jobCode || !jobInfo}>
              Create Campaign
            </Button>
          </div>
        </form>
      </DialogContent>

      <AlertDialog open={showMigrateAlert} onOpenChange={setShowMigrateAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              Do you want to migrate the candidate information?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No</AlertDialogCancel>
            <AlertDialogAction onClick={handleMigrate}>Yes</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
