import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Wrench, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import type { Machinery } from "@shared/schema";

export default function MachineryServiceWidget() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: machinery = [], isLoading, error, refetch } = useQuery({
    queryKey: ["/api/machinery"],
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
    retry: 3,
  });

  const refreshMutation = useMutation({
    mutationFn: async () => {
      await refetch();
    },
    onSuccess: () => {
      toast({
        title: "Refreshed",
        description: "Machinery data updated successfully",
      });
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
        description: "Failed to refresh machinery data",
        variant: "destructive",
      });
    },
  });

  const handleRefresh = () => {
    refreshMutation.mutate();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'bg-green-500 text-white';
      case 'service_due_soon':
        return 'bg-yellow-500 text-black';
      case 'overdue':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <CheckCircle className="h-4 w-4" />;
      case 'service_due_soon':
        return <Clock className="h-4 w-4" />;
      case 'overdue':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Wrench className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'good':
        return 'Service Up to Date';
      case 'service_due_soon':
        return 'Service Due Soon';
      case 'overdue':
        return 'Service Overdue';
      default:
        return 'Unknown Status';
    }
  };

  const calculateNextServiceInfo = (machine: Machinery) => {
    if (!machine.lastServiceDate) {
      return { text: "Service date not recorded", daysInfo: "" };
    }

    const lastService = new Date(machine.lastServiceDate);
    const nextService = new Date(lastService);
    nextService.setDate(lastService.getDate() + machine.serviceInterval);
    
    const today = new Date();
    const daysDiff = Math.ceil((nextService.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff > 0) {
      return { 
        text: `Next service in ${daysDiff} days`, 
        daysInfo: nextService.toLocaleDateString() 
      };
    } else if (daysDiff === 0) {
      return { 
        text: "Service due today", 
        daysInfo: nextService.toLocaleDateString() 
      };
    } else {
      return { 
        text: `${Math.abs(daysDiff)} days overdue`, 
        daysInfo: `Due: ${nextService.toLocaleDateString()}` 
      };
    }
  };

  if (error && !isLoading) {
    return (
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Wrench className="h-5 w-5 text-muted-foreground" />
            Machinery Service Status
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshMutation.isPending}
            data-testid="button-refresh-machinery"
          >
            <RefreshCw className={`h-4 w-4 ${refreshMutation.isPending ? 'animate-spin' : ''}`} />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <p>Failed to load machinery data</p>
            <Button 
              variant="outline" 
              className="mt-2" 
              onClick={handleRefresh}
              disabled={refreshMutation.isPending}
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Wrench className="h-5 w-5 text-muted-foreground" />
          Machinery Service Status
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isLoading || refreshMutation.isPending}
          data-testid="button-refresh-machinery"
        >
          <RefreshCw className={`h-4 w-4 ${(isLoading || refreshMutation.isPending) ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading && machinery.length === 0 ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-100 rounded mb-1"></div>
                <div className="h-3 bg-gray-100 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : machinery.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Wrench className="h-12 w-12 mx-auto mb-4" />
            <p className="mb-2">No machinery data available</p>
            <p className="text-sm">
              Connect your SmartSuite account via Make.com to see your machinery service status.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {(machinery as Machinery[]).map((machine: Machinery) => {
              const serviceInfo = calculateNextServiceInfo(machine);
              return (
                <div
                  key={machine.id}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                  data-testid={`machinery-card-${machine.id}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm" data-testid={`text-machine-name-${machine.id}`}>
                        {machine.name}
                      </h3>
                      <Badge variant="secondary" className="text-xs">
                        {machine.type}
                      </Badge>
                    </div>
                    <Badge 
                      className={`${getStatusColor(machine.status)} text-xs`}
                      data-testid={`status-badge-${machine.id}`}
                    >
                      {getStatusIcon(machine.status)}
                      <span className="ml-1">{getStatusText(machine.status)}</span>
                    </Badge>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    <p data-testid={`text-service-info-${machine.id}`}>
                      {serviceInfo.text}
                    </p>
                    {serviceInfo.daysInfo && (
                      <p className="text-xs mt-1" data-testid={`text-service-date-${machine.id}`}>
                        {serviceInfo.daysInfo}
                      </p>
                    )}
                    {machine.lastServiceDate && (
                      <p className="text-xs mt-1">
                        Last serviced: {new Date(machine.lastServiceDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}