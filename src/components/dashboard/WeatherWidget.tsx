import React, { useEffect, useState } from 'react';
import { Cloud, CloudRain, Sun, Wind, Droplets, Thermometer } from 'lucide-react';

interface WeatherData {
  temp: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  icon: string;
}

const WeatherWidget = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  // Simulated weather data (in a real app, you'd fetch from a weather API)
  useEffect(() => {
    setTimeout(() => {
      setWeather({
        temp: 72,
        condition: 'Partly Cloudy',
        humidity: 45,
        windSpeed: 8,
        icon: 'partly-cloudy'
      });
      setLoading(false);
    }, 1000);
  }, []);

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'rain':
        return CloudRain;
      case 'sunny':
        return Sun;
      default:
        return Cloud;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const WeatherIcon = getWeatherIcon(weather?.icon || 'partly-cloudy');

  return (
    <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl shadow-sm p-6 text-white">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Thermometer className="w-5 h-5" />
        Today's Weather
      </h3>
      
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-4xl font-bold">{weather?.temp}°F</div>
          <p className="text-sm opacity-90">{weather?.condition}</p>
        </div>
        <WeatherIcon className="w-16 h-16 opacity-80" />
      </div>

      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/20">
        <div className="flex items-center gap-2">
          <Droplets className="w-4 h-4" />
          <div>
            <p className="text-xs opacity-75">Humidity</p>
            <p className="font-semibold">{weather?.humidity}%</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Wind className="w-4 h-4" />
          <div>
            <p className="text-xs opacity-75">Wind</p>
            <p className="font-semibold">{weather?.windSpeed} mph</p>
          </div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-white/10 rounded-lg backdrop-blur-sm">
        <p className="text-sm">
          <strong>Great day for cleaning!</strong> Perfect weather conditions for outdoor work.
        </p>
      </div>
    </div>
  );
};

export default WeatherWidget; 