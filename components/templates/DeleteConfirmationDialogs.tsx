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

interface DeleteConfirmationDialogsProps {
  templateDialog: {
    open: boolean;
    templateName: string;
    onConfirm: () => void;
    onCancel: () => void;
  };
  questionDialog: {
    open: boolean;
    onConfirm: () => void;
    onCancel: () => void;
  };
  followUpDialog: {
    open: boolean;
    onConfirm: () => void;
    onCancel: () => void;
  };
}

export default function DeleteConfirmationDialogs({
  templateDialog,
  questionDialog,
  followUpDialog,
}: DeleteConfirmationDialogsProps) {
  return (
    <>
      {/* Delete Template Confirmation */}
      <AlertDialog
        open={templateDialog.open}
        onOpenChange={(open) => !open && templateDialog.onCancel()}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the template "
              {templateDialog.templateName}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={templateDialog.onCancel}>
              No, Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={templateDialog.onConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Yes, Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Question Confirmation */}
      <AlertDialog
        open={questionDialog.open}
        onOpenChange={(open) => !open && questionDialog.onCancel()}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Question?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this question? All follow-up
              questions will also be removed. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={questionDialog.onCancel}>
              No, Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={questionDialog.onConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Yes, Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Follow-up Confirmation */}
      <AlertDialog
        open={followUpDialog.open}
        onOpenChange={(open) => !open && followUpDialog.onCancel()}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Follow-up Question?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this follow-up question? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={followUpDialog.onCancel}>
              No, Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={followUpDialog.onConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Yes, Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
