import 'dotenv/config';
import { Client } from "@googlemaps/google-maps-services-js";

const client = new Client({});

const geocodeAddress = async (address) => {
    try {
        const response = await client.geocode({
            params: {
                address: address,
                key: 'AIzaSyBHJw3J8SYbBj7b7vVAg0RpUYxXezO4bUQ',
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
};

export { geocodeAddress };
