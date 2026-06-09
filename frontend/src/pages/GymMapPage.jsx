import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, Marker, Popup, TileLayer, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import '../styles/GymMap.css';

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

// Known gym chains for detection (lower-case keywords → display name)
const CHAIN_KEYWORDS = [
  { key: 'megatlon',   label: 'Megatlon' },
  { key: 'sportclub',  label: 'SportClub' },
  { key: 'sport club', label: 'SportClub' },
];

function detectChain(tags) {
  // Prefer explicit OSM brand/operator tags
  const brand = (tags?.brand || tags?.operator || '').toLowerCase();
  if (brand) {
    for (const { key, label } of CHAIN_KEYWORDS) {
      if (brand.includes(key)) return label;
    }
  }
  // Fall back to name matching
  const name = (tags?.name || '').toLowerCase();
  for (const { key, label } of CHAIN_KEYWORDS) {
    if (name.includes(key)) return label;
  }
  return null;
}

function RecenterMap({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, 12);
  }, [center, map]);
  return null;
}

function InvalidateSize({ trigger }) {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 150);
    return () => clearTimeout(t);
  }, [trigger, map]);
  return null;
}

export default function GymMapPage() {
  const navigate = useNavigate();

  const [userPos, setUserPos]     = useState(null);
  const [mapCenter, setMapCenter] = useState(CABA_CENTER);
  const [coordsReady, setCoordsReady] = useState(false);

  const [radiusKm, setRadiusKm]   = useState(15);
  const [gyms, setGyms]           = useState([]);
  const [selectedChain, setSelectedChain] = useState('all');
  const [status, setStatus]       = useState('Obteniendo tu ubicacion...');
  const [loading, setLoading]     = useState(false);

  // Unique chain names present in current results
  const chains = useMemo(() => {
    const set = new Set();
    gyms.forEach((g) => { if (g.chain) set.add(g.chain); });
    return Array.from(set).sort();
  }, [gyms]);

  // Gyms visible on map / list after chain filter
  const visibleGyms = useMemo(() => {
    if (selectedChain === 'all') return gyms;
    return gyms.filter((g) => g.chain === selectedChain);
  }, [gyms, selectedChain]);

  const fetchGyms = useCallback(async (lat, lng, radiusM) => {
    setLoading(true);
    setStatus('Cargando gimnasios...');
    try {
      const query =
        `[out:json][timeout:30];` +
        `(node["leisure"="fitness_centre"](around:${radiusM},${lat},${lng});` +
        `way["leisure"="fitness_centre"](around:${radiusM},${lat},${lng});` +
        `node["sport"="fitness"](around:${radiusM},${lat},${lng});` +
        `way["sport"="fitness"](around:${radiusM},${lat},${lng}););` +
        `out center tags;`;

      const res = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `data=${encodeURIComponent(query)}`,
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      const list = (data.elements || [])
        .filter((e) => e.type === 'node' || (e.type === 'way' && e.center))
        .map((e) => ({
          id: `osm-${e.id}`,
          name: e.tags?.name || 'Gimnasio sin nombre',
          lat: e.type === 'node' ? e.lat : e.center.lat,
          lng: e.type === 'node' ? e.lon : e.center.lon,
          address: [e.tags?.['addr:street'], e.tags?.['addr:housenumber']]
            .filter(Boolean)
            .join(' '),
          chain: detectChain(e.tags),
        }));

      setGyms(list);
      setSelectedChain('all');
      setStatus(list.length === 0 ? 'No se encontraron gimnasios en el area.' : '');
    } catch {
      setStatus('No se pudieron cargar los gimnasios de OpenStreetMap.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Get geolocation once on mount
  useEffect(() => {
    if (!navigator.geolocation) {
      setStatus('Geolocalización no disponible. Mostrando Buenos Aires.');
      setMapCenter(CABA_CENTER);
      setCoordsReady(true);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserPos([latitude, longitude]);
        setMapCenter([latitude, longitude]);
        setCoordsReady(true);
      },
      () => {
        setStatus('No se pudo obtener la ubicacion. Mostrando Buenos Aires.');
        setMapCenter(CABA_CENTER);
        setCoordsReady(true);
      },
      { timeout: 10000, maximumAge: 60000 },
    );
  }, []);

  // Trigger first search once coordinates are ready
  useEffect(() => {
    if (coordsReady) {
      const [lat, lng] = mapCenter;
      fetchGyms(lat, lng, radiusKm * 1000);
    }
    // Only on mount / coords ready — user controls subsequent searches
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coordsReady]);

  const handleSearch = () => {
    const [lat, lng] = mapCenter;
    fetchGyms(lat, lng, radiusKm * 1000);
  };

  const statusText = status || `${visibleGyms.length} gimnasio${visibleGyms.length !== 1 ? 's' : ''}${selectedChain !== 'all' ? ` · ${selectedChain}` : ''} en ${radiusKm} km`;

  return (
    <div className="gymmap-page">
      <div className="gymmap-header">
        <h1>Mapa de gimnasios</h1>
        <button className="gymmap-back" onClick={() => navigate('/dashboard')}>
          Volver
        </button>
      </div>

      {/* Controls */}
      <div className="gymmap-controls">
        <div className="gymmap-control-group">
          <label className="gymmap-control-label">
            Radio: <strong>{radiusKm} km</strong>
          </label>
          <input
            type="range"
            min={2}
            max={50}
            step={1}
            value={radiusKm}
            onChange={(e) => setRadiusKm(Number(e.target.value))}
            className="gymmap-slider"
          />
        </div>

        {chains.length > 0 && (
          <div className="gymmap-control-group">
            <label className="gymmap-control-label">Cadena</label>
            <select
              value={selectedChain}
              onChange={(e) => setSelectedChain(e.target.value)}
              className="gymmap-select"
            >
              <option value="all">Todas</option>
              {chains.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        )}

        <button
          className="gymmap-search-btn"
          onClick={handleSearch}
          disabled={loading || !coordsReady}
        >
          {loading ? 'Buscando...' : 'Buscar'}
        </button>
      </div>

      <p className="gymmap-subtitle">{statusText}</p>

      <div className="gymmap-card">
        <MapContainer
          center={mapCenter}
          zoom={11}
          scrollWheelZoom={true}
          className="gymmap-canvas"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <RecenterMap center={mapCenter} />
          <InvalidateSize trigger={visibleGyms.length} />

          <Circle
            center={mapCenter}
            radius={radiusKm * 1000}
            pathOptions={{ color: '#3d8bef', fillColor: '#3d8bef', fillOpacity: 0.04, weight: 1 }}
          />

          {userPos && (
            <Circle
              center={userPos}
              radius={300}
              pathOptions={{ color: '#3defa6', fillColor: '#3defa6', fillOpacity: 0.6, weight: 2 }}
            />
          )}

          {visibleGyms.map((gym) => (
            <Marker key={gym.id} position={[gym.lat, gym.lng]} icon={defaultIcon}>
              <Popup>
                <strong>{gym.name}</strong>
                {gym.chain && <><br /><em>{gym.chain}</em></>}
                {gym.address && <><br />{gym.address}</>}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {visibleGyms.length > 0 && (
        <div className="gymmap-list">
          {visibleGyms.map((gym) => (
            <div key={gym.id} className="gymmap-list-item">
              <strong>{gym.name}</strong>
              {gym.chain && <span className="gymmap-chain-badge">{gym.chain}</span>}
              {gym.address && <div className="gymmap-list-addr">{gym.address}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
