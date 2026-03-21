import React, { useEffect, useRef, useState } from 'react';
import '../styles/MapaZona.css';

const MapaZona = ({ coordenadas, endereco }) => {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const [leafletLoaded, setLeafletLoaded] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Carregar Leaflet CSS se não estiver carregado
        if (!document.getElementById('leaflet-css')) {
            const link = document.createElement('link');
            link.id = 'leaflet-css';
            link.rel = 'stylesheet';
            link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
            document.head.appendChild(link);
        }

        // Carregar Leaflet JS se não estiver carregado
        if (!window.L) {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
            script.onload = () => {
                setLeafletLoaded(true);
            };
            script.onerror = () => {
                setError('Erro ao carregar o mapa. Tente recarregar a página.');
            };
            document.head.appendChild(script);
        } else {
            setLeafletLoaded(true);
        }
    }, []);

    useEffect(() => {
        if (!leafletLoaded || !coordenadas || !mapContainer.current) return;

        const L = window.L;

        try {
            // Criar mapa
            if (!map.current) {
                map.current = L.map(mapContainer.current).setView(
                    [coordenadas.latitude, coordenadas.longitude],
                    15
                );

                // Adicionar tile layer (OpenStreetMap)
                L.tileLayer(
                    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                    {
                        attribution: '© OpenStreetMap contributors',
                        maxZoom: 19,
                    }
                ).addTo(map.current);

                // Adicionar marcador
                L.marker([coordenadas.latitude, coordenadas.longitude])
                    .addTo(map.current)
                    .bindPopup(`
                        <div class="popup-content">
                            <strong>${endereco}</strong><br/>
                            ${coordenadas.latitude.toFixed(6)}, ${coordenadas.longitude.toFixed(6)}
                        </div>
                    `)
                    .openPopup();
            } else {
                // Atualizar mapa existente
                map.current.setView([coordenadas.latitude, coordenadas.longitude], 15);
                // Remover marcadores antigos
                map.current.eachLayer((layer) => {
                    if (layer instanceof L.Marker) {
                        map.current.removeLayer(layer);
                    }
                });
                // Adicionar novo marcador
                L.marker([coordenadas.latitude, coordenadas.longitude])
                    .addTo(map.current)
                    .bindPopup(`
                        <div class="popup-content">
                            <strong>${endereco}</strong><br/>
                            ${coordenadas.latitude.toFixed(6)}, ${coordenadas.longitude.toFixed(6)}
                        </div>
                    `)
                    .openPopup();
            }
        } catch (err) {
            console.error('Erro ao renderizar mapa:', err);
            setError('Erro ao renderizar o mapa.');
        }
    }, [leafletLoaded, coordenadas, endereco]);

    return (
        <div className="mapa-container">
            <div className="mapa-header">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '20px', height: '20px', marginRight: '8px' }}>
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                </svg>
                Localização
            </div>
            {error ? (
                <div className="mapa-error">{error}</div>
            ) : !leafletLoaded ? (
                <div className="mapa-loading">
                    <div className="spinner"></div>
                    <span>Carregando mapa...</span>
                </div>
            ) : (
                <div ref={mapContainer} className="mapa-content" />
            )}
        </div>
    );
};

export default MapaZona;
