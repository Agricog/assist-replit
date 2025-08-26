import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, Cloud, Sun, CloudRain } from "lucide-react";

interface WeatherWidgetProps {
  postcode: string;
}

interface WeatherData {
  list: Array<{
    dt: number;
    main: {
      temp: number;
      temp_min: number;
      temp_max: number;
      humidity: number;
    };
    weather: Array<{
      main: string;
      description: string;
      icon: string;
    }>;
    pop: number;
    dt_txt: string;
  }>;
  city: {
    name: string;
  };
}

export default function WeatherWidget({ postcode }: WeatherWidgetProps) {
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  const { data: weatherData, isLoading, error } = useQuery<WeatherData>({
    queryKey: ["/api/weather", postcode],
    enabled: !!postcode,
    retry: false,
    refetchInterval: 60000, // Refresh every minute
  });

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <div className="p-4">
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-muted rounded w-1/2"></div>
              <div className="h-8 bg-muted rounded"></div>
              <div className="h-8 bg-muted rounded"></div>
              <div className="h-8 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !weatherData) {
    return (
      <div className="p-4">
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <div className="p-4 text-center">
            <svg className="w-8 h-8 text-muted-foreground mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="text-sm text-muted-foreground">Unable to load weather data</p>
          </div>
        </div>
      </div>
    );
  }

  // Group forecast by day
  const dailyForecasts = weatherData.list.reduce((acc, item) => {
    const date = new Date(item.dt * 1000).toDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(item);
    return acc;
  }, {} as Record<string, typeof weatherData.list>);

  const getWeatherIcon = (weatherMain: string) => {
    switch (weatherMain.toLowerCase()) {
      case 'clear':
        return <Sun className="w-8 h-8 text-accent" />;
      case 'rain':
        return <CloudRain className="w-8 h-8 text-blue-500" />;
      case 'clouds':
      default:
        return <Cloud className="w-8 h-8 text-muted-foreground" />;
    }
  };

  const getDayName = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    } else {
      return date.toLocaleDateString('en-GB', { weekday: 'long' });
    }
  };

  return (
    <div className="p-4">
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <div className="flex items-center space-x-3">
            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
            </svg>
            <div>
              <h3 className="font-semibold text-foreground">5-Day Forecast</h3>
              <p className="text-sm text-muted-foreground" data-testid="text-weather-location">
                {weatherData.city.name}, {postcode}
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-2">
          {Object.entries(dailyForecasts).slice(0, 5).map(([date, forecasts]) => {
            const dayForecasts = forecasts.slice(0, 8); // Show up to 8 3-hourly forecasts per day
            const mainForecast = dayForecasts[0];
            const dayTemp = Math.round(Math.max(...dayForecasts.map(f => f.main.temp)));
            const nightTemp = Math.round(Math.min(...dayForecasts.map(f => f.main.temp)));
            const rainChance = Math.round(Math.max(...dayForecasts.map(f => f.pop)) * 100);
            const isExpanded = expandedDay === date;

            return (
              <Collapsible key={date} open={isExpanded} onOpenChange={() => setExpandedDay(isExpanded ? null : date)}>
                <CollapsibleTrigger asChild>
                  <div 
                    className="weather-card bg-background rounded-lg p-3 border border-border hover:shadow-md transition-all cursor-pointer w-full"
                    data-testid={`weather-card-${getDayName(date).toLowerCase()}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getWeatherIcon(mainForecast.weather[0].main)}
                        <div>
                          <p className="font-medium text-foreground">{getDayName(date)}</p>
                          <p className="text-sm text-muted-foreground capitalize">
                            {mainForecast.weather[0].description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="text-right">
                          <p className="font-semibold text-foreground">{dayTemp}°C / {nightTemp}°C</p>
                          <p className="text-sm text-muted-foreground">{rainChance}% rain</p>
                        </div>
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </div>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <div className="mt-2 bg-muted/30 rounded-lg p-3 space-y-2">
                    <h4 className="text-sm font-medium text-foreground mb-2">3-Hourly Forecast</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {dayForecasts.map((forecast, index) => (
                        <div key={index} className="bg-background rounded p-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">
                              {new Date(forecast.dt * 1000).toLocaleTimeString('en-GB', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                            <span className="font-medium text-foreground">
                              {Math.round(forecast.main.temp)}°C
                            </span>
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-muted-foreground capitalize">
                              {forecast.weather[0].description}
                            </span>
                            <span className="text-blue-600">
                              {Math.round(forecast.pop * 100)}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>
      </div>
    </div>
  );
}
