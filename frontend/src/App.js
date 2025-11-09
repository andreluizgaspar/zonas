import React, { useState } from 'react';
import axios from 'axios';

function App() {
    const [address, setAddress] = useState('');
    const [zoneInfo, setZoneInfo] = useState(null);
    const [error, setError] = useState(null);

    const handleQuery = async () => {
        try {
            const response = await axios.post('http://localhost:5000/api/query', {
                query: address,
            });
            setZoneInfo(response.data);
            setError(null);
        } catch (error) {
            setError(error.response.data.error);
            setZoneInfo(null);
        }
    };

    return (
        <div className="App">
            <header className="App-header">
                <h1>Zone Finder</h1>
                <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter an address"
                />
                <button onClick={handleQuery}>Find Zone</button>
                {zoneInfo && (
                    <div>
                        <h2>Zone Information</h2>
                        <pre>{JSON.stringify(zoneInfo, null, 2)}</pre>
                    </div>
                )}
                {error && (
                    <div>
                        <h2>Error</h2>
                        <p>{error}</p>
                    </div>
                )}
            </header>
        </div>
    );
}

export default App;