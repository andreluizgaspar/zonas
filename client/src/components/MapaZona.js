import React, { useEffect, useRef } from 'react';
import '../styles/MapaZona.css';

// Componente de mapa simples usando Leaflet
// Você pode instalar com: npm install leaflet
const MapaZona = ({ coordenadas, endereco }) => {
    const mapContainer = useRef(null);
    const map = useRef(null);

    useEffect(() => {
        if (!coordenadas || !mapContainer.current) return;

        // Verificar se Leaflet está disponível
        if (typeof window.L === 'undefined') {
            console.warn('Leaflet não está carregado. Instale com: npm install leaflet');
            // Fallback: exibir coordenadas em texto
            if (mapContainer.current) {
                mapContainer.current.innerHTML = `
          <div class="mapa-fallback">
            <p>📍 ${endereco}</p>
            <p>Latitude: ${coordenadas.latitude.toFixed(6)}</p>
            <p>Longitude: ${coordenadas.longitude.toFixed(6)}</p>
            <p style="font-size: 12px; color: #999; margin-top: 10px;">
              (Para ver o mapa no navegador, instale Leaflet: npm install leaflet)
            </p>
          </div>
        `;
            }
            return;
        }

        const L = window.L;

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
                    attribution:
                        '© OpenStreetMap contributors',
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
        }
    }, [coordenadas, endereco]);

    return (
        <div className="mapa-container">
            <div className="mapa-header">
                <h3>🗺️ Localização</h3>
            </div>
            <div ref={mapContainer} className="mapa-content" />
        </div>
    );
};

export default MapaZona;
