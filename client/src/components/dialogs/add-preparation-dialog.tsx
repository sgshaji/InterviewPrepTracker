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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { insertPreparationSessionSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import StarRating from "@/components/star-rating";
import { PREPARATION_TOPICS } from "@/lib/constants";

const formSchema = insertPreparationSessionSchema.omit({ userId: true });

interface AddPreparationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddPreparationDialog({ open, onOpenChange }: AddPreparationDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      topic: "",
      resourceLink: "",
      confidenceScore: 1,
      notes: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      await apiRequest("POST", "/api/preparation-sessions", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/preparation-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/confidence-trends"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/prep-time"] });
      toast({ title: "Preparation session added successfully" });
      onOpenChange(false);
      form.reset();
    },
    onError: () => {
      toast({ title: "Failed to add preparation session", variant: "destructive" });
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    createMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Preparation Session</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                {...form.register("date")}
              />
            </div>
            <div>
              <Label>Topic *</Label>
              <Select
                value={form.watch("topic")}
                onValueChange={(value) => form.setValue("topic", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select topic" />
                </SelectTrigger>
                <SelectContent>
                  {PREPARATION_TOPICS.map((topic) => (
                    <SelectItem key={topic} value={topic}>
                      {topic}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="resourceLink">Resource Link</Label>
            <Input
              id="resourceLink"
              {...form.register("resourceLink")}
              placeholder="e.g., Notion doc, YouTube video, etc."
            />
          </div>

          <div>
            <Label>Confidence Score</Label>
            <div className="mt-2">
              <StarRating
                value={form.watch("confidenceScore") || 1}
                onChange={(value) => form.setValue("confidenceScore", value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              {...form.register("notes")}
              placeholder="Any insights or reflections from this session..."
              rows={3}
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
              {createMutation.isPending ? "Adding..." : "Add Session"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
