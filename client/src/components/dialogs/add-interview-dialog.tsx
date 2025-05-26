import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { insertInterviewSchema, Application } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { INTERVIEW_STAGES, INTERVIEW_STATUSES } from "@/lib/constants";

const formSchema = insertInterviewSchema.omit({ userId: true });

interface AddInterviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddInterviewDialog({ open, onOpenChange }: AddInterviewDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: applications } = useQuery<Application[]>({
    queryKey: ["/api/applications"],
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      applicationId: 0,
      interviewStage: "",
      interviewDate: "",
      status: "Scheduled",
      prepResources: "",
      assignedTasks: "",
      feedbackNotes: "",
      interviewScore: undefined,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const payload = {
        ...data,
        interviewDate: data.interviewDate ? new Date(data.interviewDate).toISOString() : null,
      };
      await apiRequest("POST", "/api/interviews", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/interviews"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({ title: "Interview scheduled successfully" });
      onOpenChange(false);
      form.reset();
    },
    onError: () => {
      toast({ title: "Failed to schedule interview", variant: "destructive" });
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    createMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Schedule Interview</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Application *</Label>
              <Select
                value={form.watch("applicationId")?.toString() || ""}
                onValueChange={(value) => form.setValue("applicationId", parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select application" />
                </SelectTrigger>
                <SelectContent>
                  {applications?.map((app) => (
                    <SelectItem key={app.id} value={app.id.toString()}>
                      {app.companyName} - {app.roleTitle}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Interview Stage *</Label>
              <Select
                value={form.watch("interviewStage")}
                onValueChange={(value) => form.setValue("interviewStage", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select stage" />
                </SelectTrigger>
                <SelectContent>
                  {INTERVIEW_STAGES.map((stage) => (
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
              <Label htmlFor="interviewDate">Interview Date & Time</Label>
              <Input
                id="interviewDate"
                type="datetime-local"
                {...form.register("interviewDate")}
              />
            </div>
            <div>
              <Label>Status</Label>
              <Select
                value={form.watch("status")}
                onValueChange={(value) => form.setValue("status", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INTERVIEW_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="prepResources">Prep Resources</Label>
            <Textarea
              id="prepResources"
              {...form.register("prepResources")}
              placeholder="Links to job description, company research, STAR stories, etc."
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="assignedTasks">Assigned Tasks</Label>
            <Textarea
              id="assignedTasks"
              {...form.register("assignedTasks")}
              placeholder="Tasks or assignments given for this interview"
              rows={2}
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
              {createMutation.isPending ? "Scheduling..." : "Schedule Interview"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
