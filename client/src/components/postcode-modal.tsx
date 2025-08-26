import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";

interface PostcodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPostcode?: string;
}

export default function PostcodeModal({ isOpen, onClose, currentPostcode }: PostcodeModalProps) {
  const [postcode, setPostcode] = useState(currentPostcode || "");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updatePostcodeMutation = useMutation({
    mutationFn: async (newPostcode: string) => {
      const response = await apiRequest("PUT", "/api/user/profile", { 
        postcode: newPostcode.toUpperCase().trim() 
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Postcode updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      onClose();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update postcode. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!postcode.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid UK postcode",
        variant: "destructive",
      });
      return;
    }

    // Basic UK postcode validation
    const ukPostcodeRegex = /^[A-Z]{1,2}[0-9][A-Z0-9]?\s?[0-9][A-Z]{2}$/i;
    if (!ukPostcodeRegex.test(postcode.trim())) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid UK postcode (e.g., SW1A 1AA)",
        variant: "destructive",
      });
      return;
    }

    updatePostcodeMutation.mutate(postcode);
  };

  const handleClose = () => {
    if (!updatePostcodeMutation.isPending) {
      setPostcode(currentPostcode || "");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Update Location
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleClose}
              disabled={updatePostcodeMutation.isPending}
              data-testid="button-close-postcode-modal"
            >
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="postcode">UK Postcode</Label>
            <Input
              id="postcode"
              value={postcode}
              onChange={(e) => setPostcode(e.target.value.toUpperCase())}
              placeholder="e.g. SW1A 1AA"
              disabled={updatePostcodeMutation.isPending}
              data-testid="input-postcode"
              className="uppercase"
              maxLength={8}
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              Used for weather forecasts and location-specific advice
            </p>
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={updatePostcodeMutation.isPending}
              data-testid="button-cancel-postcode"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updatePostcodeMutation.isPending}
              data-testid="button-save-postcode"
            >
              {updatePostcodeMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2"></div>
                  Saving...
                </>
              ) : (
                "Save Postcode"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}