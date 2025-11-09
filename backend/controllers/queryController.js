import asyncHandler from 'express-async-handler';
import { geocodeAddress } from '../services/googleMapsService.js';
import { getZoneFromCoordinates } from '../services/arcgisService.js';
import { getZoneInfo } from '../db/zoneService.js';

const query = asyncHandler(async (req, res) => {
    const { query } = req.body;

    if (!query) {
        res.status(400).json({ error: 'Address query is required.' });
        return;
    }

    try {
        const location = await geocodeAddress(query);

        console.log('location')
        console.log(location)

        const zone = await getZoneFromCoordinates(location.latitude, location.longitude);

        console.log('zone')
        console.log(zone)

        if (!zone) {
            res.status(404).json({ error: 'Could not find zone for the given address.' });
            return;
        }

        const zoneInfo = await getZoneInfo(zone);

        if (!zoneInfo) {
            res.status(404).json({ error: 'Zone information not found in the database.' });
            return;
        }

        res.status(200).json(zoneInfo);
    } catch (error) {
        console.error('Error processing query:', error);
        res.status(500).json({ error: 'An internal server error occurred.' });
    }
});

export { query };
