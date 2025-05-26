import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { insertApplicationSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { JOB_STATUSES, APPLICATION_STAGES, MODES_OF_APPLICATION } from "@/lib/constants";

const formSchema = insertApplicationSchema.omit({ userId: true });

interface AddApplicationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddApplicationDialog({ open, onOpenChange }: AddApplicationDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dateApplied: new Date().toISOString().split('T')[0],
      companyName: "",
      roleTitle: "",
      roleUrl: "",
      jobStatus: "Applied",
      applicationStage: "In Review",
      resumeVersion: "",
      modeOfApplication: "",
      followUpDate: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      await apiRequest("POST", "/api/applications", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({ title: "Application added successfully" });
      onOpenChange(false);
      form.reset();
    },
    onError: () => {
      toast({ title: "Failed to add application", variant: "destructive" });
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    createMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Application</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dateApplied">Date Applied</Label>
              <Input
                id="dateApplied"
                type="date"
                {...form.register("dateApplied")}
              />
            </div>
            <div>
              <Label htmlFor="companyName">Company Name *</Label>
              <Input
                id="companyName"
                {...form.register("companyName")}
                placeholder="e.g., Google"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="roleTitle">Role Title *</Label>
              <Input
                id="roleTitle"
                {...form.register("roleTitle")}
                placeholder="e.g., Product Manager"
              />
            </div>
            <div>
              <Label htmlFor="roleUrl">Job URL</Label>
              <Input
                id="roleUrl"
                {...form.register("roleUrl")}
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Job Status</Label>
              <Select
                value={form.watch("jobStatus")}
                onValueChange={(value) => form.setValue("jobStatus", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {JOB_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Application Stage</Label>
              <Select
                value={form.watch("applicationStage")}
                onValueChange={(value) => form.setValue("applicationStage", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {APPLICATION_STAGES.map((stage) => (
                    <SelectItem key={stage} value={stage}>
                      {stage}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="resumeVersion">Resume Version</Label>
              <Input
                id="resumeVersion"
                {...form.register("resumeVersion")}
                placeholder="e.g., Resume v3 - PM"
              />
            </div>
            <div>
              <Label>Mode of Application</Label>
              <Select
                value={form.watch("modeOfApplication") || ""}
                onValueChange={(value) => form.setValue("modeOfApplication", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select mode" />
                </SelectTrigger>
                <SelectContent>
                  {MODES_OF_APPLICATION.map((mode) => (
                    <SelectItem key={mode} value={mode}>
                      {mode}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="followUpDate">Follow-up Date</Label>
            <Input
              id="followUpDate"
              type="date"
              {...form.register("followUpDate")}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="bg-primary hover:bg-blue-700"
            >
              {createMutation.isPending ? "Adding..." : "Add Application"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
