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

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocation?: string;
}

export default function LocationModal({ isOpen, onClose, currentLocation }: LocationModalProps) {
  const [location, setLocation] = useState(currentLocation || "");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateLocationMutation = useMutation({
    mutationFn: async (newLocation: string) => {
      const response = await apiRequest("PUT", "/api/user/profile", { 
        location: newLocation.trim() 
      });
      return response.json();
    },
    onSuccess: (updatedUser, newLocation) => {
      toast({
        title: "Success",
        description: "Location updated successfully",
      });
      
      // Immediately update the cache with the new location
      queryClient.setQueryData(["/api/user"], (oldData: any) => 
        oldData ? { ...oldData, location: newLocation.trim() } : oldData
      );
      
      // Also invalidate to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      // Force weather widget to refresh with new location
      queryClient.invalidateQueries({ queryKey: ["/api/weather"] });
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
          window.location.href = "/login";  // Traditional auth login page
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update location. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!location.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a town or village name",
        variant: "destructive",
      });
      return;
    }

    updateLocationMutation.mutate(location);
  };

  const handleClose = () => {
    if (!updateLocationMutation.isPending) {
      setLocation(currentLocation || "");
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
              disabled={updateLocationMutation.isPending}
              data-testid="button-close-location-modal"
            >
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="location">Town or Village</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Birmingham, London, Plymouth"
              disabled={updateLocationMutation.isPending}
              data-testid="input-location"
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
              disabled={updateLocationMutation.isPending}
              data-testid="button-cancel-location"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateLocationMutation.isPending}
              data-testid="button-save-location"
            >
              {updateLocationMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2"></div>
                  Saving...
                </>
              ) : (
                "Save Location"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}