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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { insertAssessmentSchema, Interview, Application } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import StarRating from "@/components/star-rating";

const formSchema = insertAssessmentSchema.omit({ userId: true });

interface AddAssessmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddAssessmentDialog({ open, onOpenChange }: AddAssessmentDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: interviews } = useQuery<(Interview & { application: Application })[]>({
    queryKey: ["/api/interviews"],
  });

  const completedInterviews = interviews?.filter(i => i.status === "Completed") || [];

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      interviewId: 0,
      score: 1,
      difficultyLevel: "",
      whatWentWell: "",
      whatFellShort: "",
      questionsAsked: "",
      yourQuestions: "",
      followUpNeeded: false,
      timeToNextRound: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      await apiRequest("POST", "/api/assessments", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assessments"] });
      toast({ title: "Assessment added successfully" });
      onOpenChange(false);
      form.reset();
    },
    onError: () => {
      toast({ title: "Failed to add assessment", variant: "destructive" });
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    createMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Post-Interview Self-Assessment</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Interview *</Label>
              <Select
                value={form.watch("interviewId")?.toString() || ""}
                onValueChange={(value) => form.setValue("interviewId", parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select interview" />
                </SelectTrigger>
                <SelectContent>
                  {completedInterviews.map((interview) => (
                    <SelectItem key={interview.id} value={interview.id.toString()}>
                      {interview.application.companyName} - {interview.interviewStage}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="difficultyLevel">Difficulty Level</Label>
              <Select
                value={form.watch("difficultyLevel") || ""}
                onValueChange={(value) => form.setValue("difficultyLevel", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Easy">Easy</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Hard">Hard</SelectItem>
                  <SelectItem value="Very Hard">Very Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Overall Performance Score</Label>
            <div className="mt-2">
              <StarRating
                value={form.watch("score") || 1}
                onChange={(value) => form.setValue("score", value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="whatWentWell">What Went Well</Label>
              <Textarea
                id="whatWentWell"
                {...form.register("whatWentWell")}
                placeholder="Describe what you did well in this interview..."
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="whatFellShort">What Fell Short</Label>
              <Textarea
                id="whatFellShort"
                {...form.register("whatFellShort")}
                placeholder="Areas where you could have done better..."
                rows={3}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="questionsAsked">Questions They Asked</Label>
              <Textarea
                id="questionsAsked"
                {...form.register("questionsAsked")}
                placeholder="List the main questions you were asked..."
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="yourQuestions">Your Questions</Label>
              <Textarea
                id="yourQuestions"
                {...form.register("yourQuestions")}
                placeholder="Questions you asked the interviewer..."
                rows={3}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="followUpNeeded"
              checked={form.watch("followUpNeeded")}
              onCheckedChange={(checked) => form.setValue("followUpNeeded", checked)}
            />
            <Label htmlFor="followUpNeeded">Follow-up needed?</Label>
          </div>

          {form.watch("followUpNeeded") && (
            <div>
              <Label htmlFor="timeToNextRound">Time to Next Round</Label>
              <Textarea
                id="timeToNextRound"
                {...form.register("timeToNextRound")}
                placeholder="Expected timeline for next steps..."
                rows={2}
              />
            </div>
          )}

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
              {createMutation.isPending ? "Saving..." : "Save Assessment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
