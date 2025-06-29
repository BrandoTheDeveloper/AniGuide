import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { AlertTriangle, Calendar } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const usernameSchema = z.object({
  newUsername: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be less than 30 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores, and hyphens")
    .regex(/^[a-zA-Z0-9]/, "Username must start with a letter or number")
    .regex(/[a-zA-Z0-9]$/, "Username must end with a letter or number"),
});

type UsernameFormData = z.infer<typeof usernameSchema>;

interface UsernameChangeFormProps {
  onSuccess: () => void;
}

export default function UsernameChangeForm({ onSuccess }: UsernameChangeFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  const form = useForm<UsernameFormData>({
    resolver: zodResolver(usernameSchema),
    defaultValues: {
      newUsername: "",
    },
  });

  // Check last username change date
  const { data: usernameHistory } = useQuery({
    queryKey: ["/api/auth/username-history"],
    retry: false,
  });

  const usernameChangeMutation = useMutation({
    mutationFn: async (data: UsernameFormData) => {
      return await apiRequest("/api/auth/username-change", "POST", {
        newUsername: data.newUsername,
      });
    },
    onSuccess: () => {
      toast({
        title: "Username Updated",
        description: "Your username has been successfully changed.",
      });
      form.reset();
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Username Change Failed",
        description: error.message || "Failed to update username. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: UsernameFormData) => {
    usernameChangeMutation.mutate(data);
  };

  // Calculate if user can change username (6 months restriction)
  const canChangeUsername = () => {
    if (!usernameHistory?.lastChanged) return true;
    const lastChanged = new Date(usernameHistory.lastChanged);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    return lastChanged <= sixMonthsAgo;
  };

  const getNextChangeDate = () => {
    if (!usernameHistory?.lastChanged) return null;
    const lastChanged = new Date(usernameHistory.lastChanged);
    const nextChange = new Date(lastChanged);
    nextChange.setMonth(nextChange.getMonth() + 6);
    return nextChange;
  };

  const isRestricted = !canChangeUsername();
  const nextChangeDate = getNextChangeDate();

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {isRestricted && nextChangeDate && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              You can only change your username once every 6 months. Your next change will be available on{" "}
              {nextChangeDate.toLocaleDateString()}.
            </AlertDescription>
          </Alert>
        )}

        <Alert>
          <Calendar className="h-4 w-4" />
          <AlertDescription>
            Username changes are limited to once every 6 months. Choose carefully as this restriction helps maintain account security.
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <label className="text-sm font-medium">Current Username</label>
          <div className="p-3 bg-muted rounded-md text-sm">
            {user?.email || "No username set"}
          </div>
        </div>

        <FormField
          control={form.control}
          name="newUsername"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Username</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Enter new username"
                  disabled={isRestricted}
                />
              </FormControl>
              <FormDescription>
                3-30 characters, letters, numbers, underscores, and hyphens only.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {usernameHistory?.lastChanged && (
          <div className="text-sm text-muted-foreground">
            Last changed: {new Date(usernameHistory.lastChanged).toLocaleDateString()}
          </div>
        )}

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onSuccess}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={usernameChangeMutation.isPending || isRestricted}
            className="bg-claret hover:bg-claret/90"
          >
            {usernameChangeMutation.isPending ? "Updating..." : "Update Username"}
          </Button>
        </div>
      </form>
    </Form>
  );
}