import React, { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { updateApplication } from "@/api/applications/updateApplication";
import { api } from "@/utils/api";
import { z } from "zod";

// Validation schema
const applicationSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  roleTitle: z.string().min(1, "Role title is required"),
  jobStatus: z.string().min(1, "Job status is required"),
  applicationStage: z.string().optional(),
  resumeVersion: z.string().optional(),
  modeOfApplication: z.string().optional(),
  dateApplied: z.string().optional(),
});

interface Application {
  id: number;
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
  onSuccess?: (updatedApp: Application) => void;
}

export const EditApplicationDialog: React.FC<EditApplicationDialogProps> = ({
  open,
  onClose,
  application,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<Application | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  useEffect(() => {
    if (application) {
      setFormData(application);
      setErrors({});
    }
  }, [application]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => (prev ? { ...prev, [name]: value } : null));
    // Clear error when field is modified
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = (): boolean => {
    if (!formData) return false;
    try {
      applicationSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async () => {
    if (!formData) return;
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        children: "Please fix the errors in the form",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await updateApplication(formData);
      if (error) {
        throw new Error(error);
      }
      
      toast({
        title: "Success",
        children: "Application updated successfully",
      });
      onSuccess?.(formData);
      onClose();
    } catch (err) {
      toast({
        title: "Error",
        children: err instanceof Error ? err.message : "Failed to update application",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

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
                className={errors.companyName ? "border-red-500" : ""}
              />
              {errors.companyName && (
                <p className="text-sm text-red-500 mt-1">{errors.companyName}</p>
              )}
            </div>
            <div>
              <Label htmlFor="roleTitle">Role</Label>
              <Input
                id="roleTitle"
                name="roleTitle"
                value={formData.roleTitle}
                onChange={handleChange}
                className={errors.roleTitle ? "border-red-500" : ""}
              />
              {errors.roleTitle && (
                <p className="text-sm text-red-500 mt-1">{errors.roleTitle}</p>
              )}
            </div>
            <div>
              <Label htmlFor="jobStatus">Status</Label>
              <Input
                id="jobStatus"
                name="jobStatus"
                value={formData.jobStatus}
                onChange={handleChange}
                className={errors.jobStatus ? "border-red-500" : ""}
              />
              {errors.jobStatus && (
                <p className="text-sm text-red-500 mt-1">{errors.jobStatus}</p>
              )}
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
            <Button 
              onClick={handleSubmit} 
              disabled={isSaving || Object.keys(errors).length > 0}
            >
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
