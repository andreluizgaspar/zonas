import 'dotenv/config';
import { Client } from '@googlemaps/google-maps-services-js';

class GoogleMapsAPI {
    constructor() {
        this.client = new Client({});
    }

    async geocode(address) {
        try {
            // Adicionar contexto de localização se não tiver
            let searchAddress = address;
            if (!address.toLowerCase().includes('londrina')) {
                searchAddress = `${address}, Londrina, Paraná, Brasil`;
            }

            const response = await this.client.geocode({
                params: {
                    address: searchAddress,
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
                throw new Error(`Nenhum resultado encontrado para "${address}" em Londrina. Verifique o nome do endereço e tente novamente.`);
            }
        } catch (error) {
            console.error('Erro endereco geocode:', error.message);
            if (error.response) {
                console.error('API Error:', error.response.data.error_message);
            }
            throw error;
        }
    }
}

export default GoogleMapsAPI;
