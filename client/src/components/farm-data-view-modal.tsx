import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type { FarmField } from "@shared/schema";

interface FarmDataViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  field: FarmField | null;
}

export default function FarmDataViewModal({ isOpen, onClose, field }: FarmDataViewModalProps) {
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

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button
            onClick={onClose}
            variant="outline"
            data-testid="button-close-field-view"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}