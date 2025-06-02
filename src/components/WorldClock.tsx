
import React from 'react';
import { Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface WorldClockProps {
  selectedTimezones: string[];
  onTimezoneChange: (timezones: string[], primary: string) => void;
  primaryTimezone: string;
}

const WORLD_CITIES = [
  { name: 'New York', timezone: 'America/New_York' },
  { name: 'Los Angeles', timezone: 'America/Los_Angeles' },
  { name: 'Chicago', timezone: 'America/Chicago' },
  { name: 'Denver', timezone: 'America/Denver' },
  { name: 'Toronto', timezone: 'America/Toronto' },
  { name: 'Vancouver', timezone: 'America/Vancouver' },
  { name: 'Mexico City', timezone: 'America/Mexico_City' },
  { name: 'São Paulo', timezone: 'America/Sao_Paulo' },
  { name: 'Buenos Aires', timezone: 'America/Argentina/Buenos_Aires' },
  { name: 'London', timezone: 'Europe/London' },
  { name: 'Paris', timezone: 'Europe/Paris' },
  { name: 'Berlin', timezone: 'Europe/Berlin' },
  { name: 'Rome', timezone: 'Europe/Rome' },
  { name: 'Madrid', timezone: 'Europe/Madrid' },
  { name: 'Amsterdam', timezone: 'Europe/Amsterdam' },
  { name: 'Stockholm', timezone: 'Europe/Stockholm' },
  { name: 'Moscow', timezone: 'Europe/Moscow' },
  { name: 'Istanbul', timezone: 'Europe/Istanbul' },
  { name: 'Cairo', timezone: 'Africa/Cairo' },
  { name: 'Johannesburg', timezone: 'Africa/Johannesburg' },
  { name: 'Lagos', timezone: 'Africa/Lagos' },
  { name: 'Nairobi', timezone: 'Africa/Nairobi' },
  { name: 'Dubai', timezone: 'Asia/Dubai' },
  { name: 'Riyadh', timezone: 'Asia/Riyadh' },
  { name: 'Mumbai', timezone: 'Asia/Kolkata' },
  { name: 'Delhi', timezone: 'Asia/Kolkata' },
  { name: 'Bangkok', timezone: 'Asia/Bangkok' },
  { name: 'Jakarta', timezone: 'Asia/Jakarta' },
  { name: 'Singapore', timezone: 'Asia/Singapore' },
  { name: 'Kuala Lumpur', timezone: 'Asia/Kuala_Lumpur' },
  { name: 'Manila', timezone: 'Asia/Manila' },
  { name: 'Hong Kong', timezone: 'Asia/Hong_Kong' },
  { name: 'Shanghai', timezone: 'Asia/Shanghai' },
  { name: 'Beijing', timezone: 'Asia/Shanghai' },
  { name: 'Seoul', timezone: 'Asia/Seoul' },
  { name: 'Tokyo', timezone: 'Asia/Tokyo' },
  { name: 'Sydney', timezone: 'Australia/Sydney' },
  { name: 'Melbourne', timezone: 'Australia/Melbourne' },
  { name: 'Brisbane', timezone: 'Australia/Brisbane' },
  { name: 'Perth', timezone: 'Australia/Perth' },
  { name: 'Auckland', timezone: 'Pacific/Auckland' },
  { name: 'Fiji', timezone: 'Pacific/Fiji' },
  { name: 'Honolulu', timezone: 'Pacific/Honolulu' },
];

const WorldClock: React.FC<WorldClockProps> = ({ 
  selectedTimezones, 
  onTimezoneChange, 
  primaryTimezone 
}) => {
  const [currentTimes, setCurrentTimes] = React.useState<{ [key: string]: string }>({});

  React.useEffect(() => {
    const updateTimes = () => {
      const times: { [key: string]: string } = {};
      selectedTimezones.forEach(timezone => {
        const now = new Date();
        times[timezone] = now.toLocaleTimeString('en-US', {
          timeZone: timezone,
          hour12: true,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
      });
      setCurrentTimes(times);
    };

    updateTimes();
    const interval = setInterval(updateTimes, 1000);
    return () => clearInterval(interval);
  }, [selectedTimezones]);

  const handleAddTimezone = (timezone: string) => {
    if (selectedTimezones.length < 3 && !selectedTimezones.includes(timezone)) {
      const newTimezones = [...selectedTimezones, timezone];
      onTimezoneChange(newTimezones, primaryTimezone);
    }
  };

  const handleRemoveTimezone = (timezone: string) => {
    if (selectedTimezones.length > 1) {
      const newTimezones = selectedTimezones.filter(tz => tz !== timezone);
      const newPrimary = timezone === primaryTimezone ? newTimezones[0] : primaryTimezone;
      onTimezoneChange(newTimezones, newPrimary);
    }
  };

  const handleSetPrimary = (timezone: string) => {
    onTimezoneChange(selectedTimezones, timezone);
  };

  const getCityName = (timezone: string) => {
    return WORLD_CITIES.find(city => city.timezone === timezone)?.name || timezone;
  };

  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle className="flex items-center text-gray-900">
          <Clock className="mr-2 h-5 w-5 text-blue-600" />
          World Clock
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {selectedTimezones.map(timezone => (
            <div
              key={timezone}
              className={`p-4 rounded-lg border-2 ${
                timezone === primaryTimezone 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {getCityName(timezone)}
                    {timezone === primaryTimezone && (
                      <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-1 rounded">
                        Primary
                      </span>
                    )}
                  </h3>
                  <p className="text-2xl font-mono text-gray-900 mt-1">
                    {currentTimes[timezone] || '00:00:00'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {new Date().toLocaleDateString('en-US', {
                      timeZone: timezone,
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div className="flex flex-col gap-1">
                  {timezone !== primaryTimezone && (
                    <Button
                      onClick={() => handleSetPrimary(timezone)}
                      size="sm"
                      variant="outline"
                      className="text-xs"
                    >
                      Set Primary
                    </Button>
                  )}
                  {selectedTimezones.length > 1 && (
                    <Button
                      onClick={() => handleRemoveTimezone(timezone)}
                      size="sm"
                      variant="destructive"
                      className="text-xs"
                    >
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {selectedTimezones.length < 3 && (
          <div className="flex items-center space-x-2">
            <Select onValueChange={handleAddTimezone}>
              <SelectTrigger className="w-full bg-white text-gray-900">
                <SelectValue placeholder="Add another timezone (max 3)" />
              </SelectTrigger>
              <SelectContent className="bg-white max-h-60">
                {WORLD_CITIES
                  .filter(city => !selectedTimezones.includes(city.timezone))
                  .map(city => (
                    <SelectItem 
                      key={city.timezone} 
                      value={city.timezone}
                      className="text-gray-900 hover:bg-gray-100"
                    >
                      {city.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </SelectContent>
    </Card>
  );
};

export default WorldClock;
