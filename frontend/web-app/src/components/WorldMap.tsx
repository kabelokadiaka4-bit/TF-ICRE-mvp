"use client";

import { MapContainer, TileLayer, GeoJSON, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; // Don't forget Leaflet's CSS
import { FeatureCollection } from 'geojson';
import { motion } from 'framer-motion';

// Fix for default Leaflet icons in Webpack/React environments
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: markerIcon.src,
    iconRetinaUrl: markerIcon2x.src,
    shadowUrl: markerShadow.src,
});


export interface CountryRiskData {
    country: string;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

interface WorldMapProps {
    riskData: CountryRiskData[];
    className?: string;
}

// Mock GeoJSON data for African countries (simplified, real data is complex)
// In a real app, this would be fetched from an API or a static file
const africaGeoJson: FeatureCollection = {
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "properties": { "name": "South Africa" },
            "geometry": { "type": "Polygon", "coordinates": [[[-1.25, -28.9], [32.8, -28.9], [32.8, -34.8], [-1.25, -34.8], [-1.25, -28.9]]] } // Simplified box
        },
        {
            "type": "Feature",
            "properties": { "name": "Nigeria" },
            "geometry": { "type": "Polygon", "coordinates": [[[2.69, 4.25], [14.68, 4.25], [14.68, 13.88], [2.69, 13.88], [2.69, 4.25]]] } // Simplified box
        },
        {
            "type": "Feature",
            "properties": { "name": "Kenya" },
            "geometry": { "type": "Polygon", "coordinates": [[[33.9, -4.6], [41.9, -4.6], [41.9, 5.0], [33.9, 5.0], [33.9, -4.6]]] } // Simplified box
        },
        {
            "type": "Feature",
            "properties": { "name": "Egypt" },
            "geometry": { "type": "Polygon", "coordinates": [[[24.9, 22.0], [36.9, 22.0], [36.9, 31.5], [24.9, 31.5], [24.9, 22.0]]] } // Simplified box
        },
         {
            "type": "Feature",
            "properties": { "name": "Ghana" },
            "geometry": { "type": "Polygon", "coordinates": [[[-3.22, 4.74], [1.19, 4.74], [1.19, 11.17], [-3.22, 11.17], [-3.22, 4.74]]] } // Simplified box
        }
        // Add more African countries as needed for a realistic map
    ]
};

const riskColorMap = {
    low: { fill: '#4ade80', border: '#16a34a' },     // green-400 / green-600
    medium: { fill: '#facc15', border: '#eab308' },  // yellow-400 / yellow-600
    high: { fill: '#fb7185', border: '#e11d48' },    // rose-400 / rose-600
    critical: { fill: '#ef4444', border: '#dc2626' }, // red-500 / red-700
    default: { fill: '#49454F', border: '#332D41' }   // on-surface-variant / secondary
};

export const WorldMap = ({ riskData, className }: WorldMapProps) => {
    const defaultCenter: L.LatLngExpression = [0, 20]; // Center of Africa
    const defaultZoom = 3;

    const onEachFeature = (feature: GeoJSON.Feature, layer: L.Layer) => {
        if (feature.properties && feature.properties.name) {
            const countryName = feature.properties.name;
            const countryRisk = riskData.find(d => d.country === countryName);
            const riskLevel = countryRisk ? countryRisk.riskLevel : 'default';
            const colors = riskColorMap[riskLevel];

            (layer as L.Path).setStyle({
                fillColor: colors.fill,
                color: colors.border,
                weight: 1,
                opacity: 1,
                fillOpacity: 0.7
            });

            layer.on({
                mouseover: (e) => {
                    (e.target as L.Path).setStyle({
                        weight: 3,
                        color: '#FFF',
                        fillOpacity: 0.9
                    });
                },
                mouseout: (e) => {
                    (e.target as L.Path).setStyle({
                        weight: 1,
                        color: colors.border,
                        fillOpacity: 0.7
                    });
                },
            });

            // Bind tooltip
            if (countryRisk) {
                layer.bindTooltip(
                    `<div style="font-size: 14px; font-weight: bold;">${countryName}</div>
                    <div style="font-size: 12px;">Risk: ${riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)}</div>`,
                    { sticky: true }
                );
            } else {
                layer.bindTooltip(`<div style="font-size: 14px; font-weight: bold;">${countryName}</div><div style="font-size: 12px;">No Data</div>`);
            }
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className={`w-full h-full rounded-2xl overflow-hidden ${className}`}
        >
            <MapContainer 
                center={defaultCenter} 
                zoom={defaultZoom} 
                minZoom={2} 
                maxZoom={6}
                scrollWheelZoom={false} 
                className="h-full w-full"
                style={{ backgroundColor: 'transparent', zIndex: 0 }}
            >
                {/* Custom dark tile layer */}
                <TileLayer
                    url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
                    maxZoom={20}
                    subdomains={['a','b','c','d']}
                />
                <GeoJSON 
                    data={africaGeoJson} 
                    onEachFeature={onEachFeature} 
                    style={{ stroke: true, weight: 1 }}
                />
            </MapContainer>
        </motion.div>
    );
};
