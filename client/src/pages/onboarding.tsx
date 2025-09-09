import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import agricogLogo from "@assets/Agricog_1756233506512.png";

interface OnboardingForm {
  firstName: string;
  lastName: string;
  email: string;
  farmName: string;
  location: string;
}

export default function Onboarding() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<OnboardingForm>({
    firstName: "",
    lastName: "",
    email: "",
    farmName: "",
    location: ""
  });

  const onboardingMutation = useMutation({
    mutationFn: async (data: OnboardingForm) => {
      const response = await apiRequest("PUT", "/api/user/onboarding", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Welcome to Agricog Assist!",
        description: "Your profile has been set up successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      // Redirect to dashboard
      window.location.href = "/";
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
        description: "Failed to save your information. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim() || !formData.farmName.trim() || !formData.location.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.email.includes("@")) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    onboardingMutation.mutate(formData);
  };

  const handleInputChange = (field: keyof OnboardingForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen hero-pattern">
      {/* Header */}
      <header className="relative z-10 px-4 py-6">
        <div className="max-w-4xl mx-auto flex items-center justify-center">
          <div className="flex items-center space-x-3">
            <img 
              src={agricogLogo} 
              alt="Agricog Logo" 
              className="h-10 w-auto object-contain"
              data-testid="img-header-logo"
            />
            <h1 className="text-xl font-bold text-foreground">Agricog Assist</h1>
          </div>
        </div>
      </header>

      {/* Onboarding Form */}
      <main className="px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-3">
              Welcome to <span className="text-primary">Agricog Assist</span>
            </h1>
            <p className="text-muted-foreground">
              Let's get your farm profile set up so we can provide you with personalized AI assistance.
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-card rounded-xl shadow-xl p-8 border border-border">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-foreground font-medium">
                    First Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleInputChange('firstName')}
                    placeholder="Enter your first name"
                    data-testid="input-first-name"
                    className="w-full"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-foreground font-medium">
                    Last Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={handleInputChange('lastName')}
                    placeholder="Enter your last name"
                    data-testid="input-last-name"
                    className="w-full"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground font-medium">
                  Email Address <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  placeholder="Enter your email address"
                  data-testid="input-email"
                  className="w-full"
                  required
                />
              </div>

              {/* Farm Name */}
              <div className="space-y-2">
                <Label htmlFor="farmName" className="text-foreground font-medium">
                  Farm Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="farmName"
                  type="text"
                  value={formData.farmName}
                  onChange={handleInputChange('farmName')}
                  placeholder="Enter your farm name"
                  data-testid="input-farm-name"
                  className="w-full"
                  required
                />
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location" className="text-foreground font-medium">
                  Location <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="location"
                  type="text"
                  value={formData.location}
                  onChange={handleInputChange('location')}
                  placeholder="Enter your town or village (e.g., Manchester, Cornwall)"
                  data-testid="input-location"
                  className="w-full"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  This will be used to provide accurate weather forecasts for your area.
                </p>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={onboardingMutation.isPending}
                  data-testid="button-complete-onboarding"
                  className="w-full py-3 text-lg font-semibold"
                >
                  {onboardingMutation.isPending ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                      <span>Setting up your profile...</span>
                    </div>
                  ) : (
                    "Complete Setup & Continue"
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="text-center mt-6 text-sm text-muted-foreground">
            <p>Your information is secure and will only be used to personalize your farming experience.</p>
          </div>
        </div>
      </main>
    </div>
  );
}