import React, { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { updateApplication } from "@/api/applications/updateApplication";
import { api } from "@/utils/api";

interface Application {
  id: string;
  companyName: string;
  roleTitle: string;
  jobStatus: string;
  applicationStage?: string;
  resumeVersion?: string;
  modeOfApplication?: string;
  dateApplied?: string;
}

interface EditApplicationDialogProps {
  open: boolean;
  onClose: () => void;
  application: Application | null;
}

export const EditApplicationDialog: React.FC<EditApplicationDialogProps> = ({
  open,
  onClose,
  application,
}) => {
  const [formData, setFormData] = useState<Application | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (application) {
      setFormData(application);
    }
  }, [application]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => (prev ? { ...prev, [name]: value } : null));
  };

  const handleSubmit = async () => {
    if (!formData) return;
    setIsSaving(true);
    const { error } = await updateApplication(formData);
    if (error) {
      toast({
        title: `Update Failed: ${error}`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Application Saved ✅ Changes applied successfully.",
      });
      onClose();
    }
    setIsSaving(false);
  };

  const isInvalid =
    !formData?.companyName?.trim() || !formData?.roleTitle?.trim() || !formData?.jobStatus?.trim();

  if (!formData) return null;

  return (
    <Dialog.Root open={open} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content className="fixed top-1/2 left-1/2 max-h-[90vh] w-[95vw] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl bg-white p-6 shadow-lg">
          <Dialog.Title className="text-lg font-semibold mb-4">Edit Application</Dialog.Title>
          <div className="space-y-4">
            <div>
              <Label htmlFor="companyName">Company</Label>
              <Input
                id="companyName"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="roleTitle">Role</Label>
              <Input
                id="roleTitle"
                name="roleTitle"
                value={formData.roleTitle}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="jobStatus">Status</Label>
              <Input
                id="jobStatus"
                name="jobStatus"
                value={formData.jobStatus}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="applicationStage">Stage</Label>
              <Input
                id="applicationStage"
                name="applicationStage"
                value={formData.applicationStage || ''}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="resumeVersion">Resume</Label>
              <Input
                id="resumeVersion"
                name="resumeVersion"
                value={formData.resumeVersion || ''}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="modeOfApplication">Applied Via</Label>
              <Input
                id="modeOfApplication"
                name="modeOfApplication"
                value={formData.modeOfApplication || ''}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="dateApplied">Date</Label>
              <Input
                id="dateApplied"
                name="dateApplied"
                value={formData.dateApplied || ''}
                onChange={handleChange}
                type="date"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isInvalid || isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
