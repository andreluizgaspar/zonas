import { MongoClient } from 'mongodb';

const getZoneInfo = async (zone) => {
    const url = process.env.MONGO_URI;
    const dbName = 'admin';

    try {
        const client = new MongoClient(url);
        await client.connect();

        const db = client.db(dbName);
        const collection = db.collection('zones_info');

        const zoneInfo = await collection.findOne({ zone: zone });

        await client.close();

        return zoneInfo;
    } catch (error) {
        console.error('Error fetching zone info from db: ', error);
        throw new Error('An error occurred while fetching zone info from the database.');
    }
};

export { getZoneInfo };
