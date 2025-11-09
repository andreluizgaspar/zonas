import 'dotenv/config';
import { Client } from '@googlemaps/google-maps-services-js';

class GoogleMapsAPI {
  constructor() {
    this.client = new Client({});
  }

  async geocode(address) {
    try {
      const response = await this.client.geocode({
        params: {
          address: address,
          key: process.env.GOOGLE_MAPS_API_KEY,
        },
        timeout: 1000,
      });

      if (response.data.results.length > 0) {
        const coords = response.data.results[0].geometry.location;
        return {
          latitude: coords.lat,
          longitude: coords.lng,
        };
      } else {
        throw new Error('No results found for the given address.');
      }
    } catch (error) {
      console.error('Error geocoding address:', error.message);
      if (error.response) {
        console.error('API Error:', error.response.data.error_message);
      }
      throw error;
    }
  }
}

export default GoogleMapsAPI;
