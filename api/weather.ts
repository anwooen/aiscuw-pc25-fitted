import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { lat, lon } = req.query;

    // Validate input
    if (!lat || !lon) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: lat and lon'
      });
    }

    const latitude = parseFloat(lat as string);
    const longitude = parseFloat(lon as string);

    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid latitude or longitude values'
      });
    }

    // Validate coordinate ranges
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return res.status(400).json({
        success: false,
        error: 'Latitude must be between -90 and 90, longitude between -180 and 180'
      });
    }

    // Call Open-Meteo API (free, no API key required!)
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weathercode,windspeed_10m&temperature_unit=fahrenheit&windspeed_unit=mph&precipitation_unit=inch&timezone=auto`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Open-Meteo API error: ${response.status}`);
    }

    const data = await response.json();

    // Map weather codes to readable conditions
    // https://open-meteo.com/en/docs
    const weatherCodeMap: Record<number, string> = {
      0: 'Clear',
      1: 'Mostly Clear',
      2: 'Partly Cloudy',
      3: 'Overcast',
      45: 'Foggy',
      48: 'Foggy',
      51: 'Light Drizzle',
      53: 'Drizzle',
      55: 'Heavy Drizzle',
      56: 'Freezing Drizzle',
      57: 'Freezing Drizzle',
      61: 'Light Rain',
      63: 'Rainy',
      65: 'Heavy Rain',
      66: 'Freezing Rain',
      67: 'Freezing Rain',
      71: 'Light Snow',
      73: 'Snowy',
      75: 'Heavy Snow',
      77: 'Snow Grains',
      80: 'Light Rain Showers',
      81: 'Rain Showers',
      82: 'Heavy Rain Showers',
      85: 'Snow Showers',
      86: 'Heavy Snow Showers',
      95: 'Thunderstorm',
      96: 'Thunderstorm with Hail',
      99: 'Thunderstorm with Hail',
    };

    const current = data.current;
    const weatherCode = current.weathercode || 0;

    // Calculate precipitation probability (Open-Meteo provides precipitation amount, not probability)
    // We'll estimate: if there's any precipitation, it's happening (100%), otherwise 0%
    const precipitationProbability = current.precipitation > 0 ? 100 : 0;

    // Build weather response
    const weather = {
      temperature: Math.round(current.temperature_2m),
      condition: weatherCodeMap[weatherCode] || 'Unknown',
      precipitation: precipitationProbability,
      windSpeed: Math.round(current.windspeed_10m),
      humidity: Math.round(current.relative_humidity_2m),
      feelsLike: Math.round(current.apparent_temperature),
    };

    return res.status(200).json({
      success: true,
      weather,
    });

  } catch (error: any) {
    console.error('Error fetching weather:', error);

    return res.status(500).json({
      success: false,
      error: error?.message || 'Failed to fetch weather data',
    });
  }
}
