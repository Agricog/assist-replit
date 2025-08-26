import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";
import type { FarmField } from "@shared/schema";

interface FarmDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  editingField?: FarmField | null;
}

interface FarmFieldData {
  fieldName: string;
  size: string;
  cropType: string;
  soilType: string;
  expectedYield: string;
  notes: string;
}

const BASE_CROPS = [
  "Winter Wheat",
  "Spring Wheat", 
  "Barley",
  "Potatoes",
  "Rapeseed",
  "Maize",
  "Oats",
  "Sugar Beet",
  "Carrots",
  "Cabbage",
  "Onions"
];

const initialData: FarmFieldData = {
  fieldName: "",
  size: "",
  cropType: "",
  soilType: "",
  expectedYield: "",
  notes: "",
};

export default function FarmDataModal({ isOpen, onClose, onSave, editingField }: FarmDataModalProps) {
  const [formData, setFormData] = useState<FarmFieldData>(initialData);
  const [customCrop, setCustomCrop] = useState("");
  const [showCustomCrop, setShowCustomCrop] = useState(false);
  const [availableCrops, setAvailableCrops] = useState<string[]>(BASE_CROPS);
  const { toast } = useToast();

  const saveMutation = useMutation({
    mutationFn: async (data: FarmFieldData) => {
      const payload = {
        fieldName: data.fieldName,
        size: parseFloat(data.size),
        cropType: data.cropType,
        soilType: data.soilType,
        expectedYield: data.expectedYield ? parseFloat(data.expectedYield) : null,
        notes: data.notes || null,
      };
      
      if (editingField) {
        const response = await apiRequest("PUT", `/api/farm/fields/${editingField.id}`, payload);
        return response.json();
      } else {
        const response = await apiRequest("POST", "/api/farm/fields", payload);
        return response.json();
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: editingField ? "Field updated successfully" : "Field data saved successfully",
      });
      setFormData(initialData);
      setAvailableCrops(BASE_CROPS);
      onSave();
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
        description: "Failed to save field data. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.fieldName || !formData.size || !formData.cropType || !formData.soilType) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Validate numeric fields
    if (isNaN(parseFloat(formData.size)) || parseFloat(formData.size) <= 0) {
      toast({
        title: "Validation Error",
        description: "Size must be a valid positive number",
        variant: "destructive",
      });
      return;
    }

    if (formData.expectedYield && (isNaN(parseFloat(formData.expectedYield)) || parseFloat(formData.expectedYield) <= 0)) {
      toast({
        title: "Validation Error",
        description: "Expected yield must be a valid positive number",
        variant: "destructive",
      });
      return;
    }

    saveMutation.mutate(formData);
  };

  const handleClose = () => {
    if (!saveMutation.isPending) {
      setFormData(initialData);
      setAvailableCrops(BASE_CROPS);
      setShowCustomCrop(false);
      setCustomCrop("");
      onClose();
    }
  };

  // Pre-fill form data when editing
  useEffect(() => {
    if (editingField && isOpen) {
      setFormData({
        fieldName: editingField.fieldName || "",
        size: editingField.size?.toString() || "",
        cropType: editingField.cropType || "",
        soilType: editingField.soilType || "",
        expectedYield: editingField.expectedYield?.toString() || "",
        notes: editingField.notes || "",
      });
      
      // Add the current crop to available crops if it's not in the base list
      if (editingField.cropType && !BASE_CROPS.includes(editingField.cropType)) {
        setAvailableCrops(prev => [...prev, editingField.cropType]);
      }
    } else if (isOpen) {
      setFormData(initialData);
      setAvailableCrops(BASE_CROPS);
    }
  }, [editingField, isOpen]);

  const updateField = (field: keyof FarmFieldData, value: string) => {
    if (field === 'cropType' && value === 'custom') {
      setShowCustomCrop(true);
      return;
    }
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCustomCropSave = () => {
    if (customCrop.trim()) {
      const cropName = customCrop.trim();
      // Add the custom crop to the available crops list
      if (!availableCrops.includes(cropName)) {
        setAvailableCrops(prev => [...prev, cropName]);
      }
      setFormData(prev => ({ ...prev, cropType: cropName }));
      setShowCustomCrop(false);
      setCustomCrop("");
    }
  };

  const handleCustomCropCancel = () => {
    setShowCustomCrop(false);
    setCustomCrop("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            {editingField ? "Edit Field Data" : "Add Farm Data"}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleClose}
              disabled={saveMutation.isPending}
              data-testid="button-close-modal"
            >
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fieldName">Field Name *</Label>
              <Input
                id="fieldName"
                value={formData.fieldName}
                onChange={(e) => updateField('fieldName', e.target.value)}
                placeholder="e.g. North Field"
                disabled={saveMutation.isPending}
                data-testid="input-field-name"
                required
              />
            </div>
            <div>
              <Label htmlFor="size">Size (Acres) *</Label>
              <Input
                id="size"
                type="number"
                step="0.1"
                min="0"
                value={formData.size}
                onChange={(e) => updateField('size', e.target.value)}
                placeholder="e.g. 50"
                disabled={saveMutation.isPending}
                data-testid="input-field-size"
                required
              />
            </div>
            <div>
              <Label htmlFor="cropType">Crop Type *</Label>
              <Select 
                value={formData.cropType} 
                onValueChange={(value) => updateField('cropType', value)}
                disabled={saveMutation.isPending}
              >
                <SelectTrigger data-testid="select-crop-type">
                  <SelectValue placeholder="Select crop type" />
                </SelectTrigger>
                <SelectContent>
                  {availableCrops.map((crop) => (
                    <SelectItem key={crop} value={crop}>{crop}</SelectItem>
                  ))}
                  <SelectItem value="custom">+ Add Custom Crop</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Custom Crop Input */}
            {showCustomCrop && (
              <div className="col-span-2 p-4 border rounded-lg bg-muted/20">
                <Label htmlFor="customCrop">Enter Custom Crop Type *</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="customCrop"
                    value={customCrop}
                    onChange={(e) => setCustomCrop(e.target.value)}
                    placeholder="e.g. Spring Barley, Organic Wheat"
                    data-testid="input-custom-crop"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleCustomCropSave();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={handleCustomCropSave}
                    size="sm"
                    data-testid="button-save-custom-crop"
                    disabled={!customCrop.trim()}
                  >
                    Save
                  </Button>
                  <Button
                    type="button"
                    onClick={handleCustomCropCancel}
                    variant="outline"
                    size="sm"
                    data-testid="button-cancel-custom-crop"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
            
            <div>
              <Label htmlFor="soilType">Soil Type *</Label>
              <Select 
                value={formData.soilType} 
                onValueChange={(value) => updateField('soilType', value)}
                disabled={saveMutation.isPending}
              >
                <SelectTrigger data-testid="select-soil-type">
                  <SelectValue placeholder="Select soil type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="clay">Clay</SelectItem>
                  <SelectItem value="sandy">Sandy</SelectItem>
                  <SelectItem value="loam">Loam</SelectItem>
                  <SelectItem value="chalk">Chalk</SelectItem>
                  <SelectItem value="peat">Peat</SelectItem>
                  <SelectItem value="silt">Silt</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="expectedYield">Expected Yield (tonnes/acre)</Label>
            <Input
              id="expectedYield"
              type="number"
              step="0.1"
              min="0"
              value={formData.expectedYield}
              onChange={(e) => updateField('expectedYield', e.target.value)}
              placeholder="e.g. 3.5"
              disabled={saveMutation.isPending}
              data-testid="input-expected-yield"
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => updateField('notes', e.target.value)}
              placeholder="Additional field information..."
              rows={3}
              disabled={saveMutation.isPending}
              data-testid="textarea-notes"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={saveMutation.isPending}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saveMutation.isPending}
              data-testid="button-save-field"
            >
              {saveMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2"></div>
                  Saving...
                </>
              ) : (
                "Save Field Data"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
