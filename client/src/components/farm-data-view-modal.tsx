import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Edit, Trash2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { FarmField } from "@shared/schema";

interface FarmDataViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  field: FarmField | null;
  onEdit?: (field: FarmField) => void;
}

export default function FarmDataViewModal({ isOpen, onClose, field, onEdit }: FarmDataViewModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async (fieldId: string) => {
      const response = await apiRequest("DELETE", `/api/farm/fields/${fieldId}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Field deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/farm/fields"] });
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
        description: "Failed to delete field. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDelete = () => {
    if (field && window.confirm(`Are you sure you want to delete the field "${field.fieldName}"? This action cannot be undone.`)) {
      deleteMutation.mutate(field.id);
    }
  };

  const handleEdit = () => {
    if (field && onEdit) {
      onEdit(field);
      onClose();
    }
  };

  if (!field) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">
              Field Details: {field.fieldName}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              data-testid="button-close-view-modal"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Field Overview */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-primary/10 rounded-lg p-4">
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Size</h4>
              <p className="text-2xl font-bold text-primary" data-testid="text-field-size">
                {field.size} acres
              </p>
            </div>
            <div className="bg-accent/10 rounded-lg p-4">
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Expected Yield</h4>
              <p className="text-2xl font-bold text-accent" data-testid="text-field-yield">
                {field.expectedYield ? `${field.expectedYield} tons` : "Not set"}
              </p>
            </div>
          </div>

          {/* Field Information */}
          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Crop Type</h4>
              <p className="text-foreground" data-testid="text-field-crop">
                {field.cropType}
              </p>
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Soil Type</h4>
              <p className="text-foreground" data-testid="text-field-soil">
                {field.soilType}
              </p>
            </div>

            {field.notes && (
              <div className="border rounded-lg p-4">
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Notes</h4>
                <p className="text-foreground whitespace-pre-wrap" data-testid="text-field-notes">
                  {field.notes}
                </p>
              </div>
            )}
          </div>

          {/* Dates */}
          <div className="border-t pt-4">
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Created: {field.createdAt ? new Date(field.createdAt).toLocaleDateString() : 'Unknown'}</p>
              {field.updatedAt && field.updatedAt !== field.createdAt && (
                <p>Updated: {new Date(field.updatedAt).toLocaleDateString()}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-between pt-4 border-t">
          <div className="flex space-x-2">
            {onEdit && (
              <Button
                onClick={handleEdit}
                variant="outline"
                data-testid="button-edit-field"
                disabled={deleteMutation.isPending}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
            <Button
              onClick={handleDelete}
              variant="destructive"
              data-testid="button-delete-field"
              disabled={deleteMutation.isPending}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
          <Button
            onClick={onClose}
            variant="outline"
            data-testid="button-close-field-view"
            disabled={deleteMutation.isPending}
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}