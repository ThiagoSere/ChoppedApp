import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, Marker, Popup, TileLayer, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import '../styles/GymMap.css';

// Fix iconos de Leaflet en CRA/Webpack
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const defaultIcon = L.icon({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const CABA_CENTER = [-34.6037, -58.3816];

const CABA_GYMS = [
  { id: 'gym-1', name: 'Megatlon Palermo', lat: -34.5774, lng: -58.4262 },
  { id: 'gym-2', name: 'SportClub Recoleta', lat: -34.5882, lng: -58.3931 },
  { id: 'gym-3', name: 'Fiter Belgrano', lat: -34.5621, lng: -58.4564 },
  { id: 'gym-4', name: 'Smart Fit Caballito', lat: -34.6187, lng: -58.4302 },
  { id: 'gym-5', name: 'SportClub Microcentro', lat: -34.6045, lng: -58.3776 },
  { id: 'gym-6', name: 'Megatlon Almagro', lat: -34.6108, lng: -58.4228 },
];

export default function GymMapPage() {
  const navigate = useNavigate();

  const gyms = useMemo(() => CABA_GYMS, []);

  return (
    <div className="gymmap-page">
      <div className="gymmap-header">
        <h1>Mapa de gimnasios</h1>
        <button className="gymmap-back" onClick={() => navigate('/dashboard')}>
          Volver
        </button>
      </div>

      <p className="gymmap-subtitle">
        Gimnasios destacados de Ciudad Autonoma de Buenos Aires.
      </p>

      <div className="gymmap-card">
        <MapContainer
          center={CABA_CENTER}
          zoom={12}
          scrollWheelZoom={true}
          className="gymmap-canvas"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <Circle
            center={CABA_CENTER}
            radius={5500}
            pathOptions={{ color: '#3d8bef', fillColor: '#3d8bef', fillOpacity: 0.08 }}
          />

          {gyms.map((gym) => (
            <Marker key={gym.id} position={[gym.lat, gym.lng]} icon={defaultIcon}>
              <Popup>
                <strong>{gym.name}</strong>
                <br />
                CABA, Buenos Aires
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <div className="gymmap-list">
        {gyms.map((gym) => (
          <div key={gym.id} className="gymmap-list-item">
            {gym.name}
          </div>
        ))}
      </div>
    </div>
  );
}
