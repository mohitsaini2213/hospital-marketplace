import { useEffect, useRef, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FaLocationCrosshairs, FaMagnifyingGlass, FaLocationDot } from 'react-icons/fa6';
import { DEFAULT_CENTER } from '@/utils/constants';

// Custom pin (avoids Leaflet's default marker asset path issues in bundlers)
const pinIcon = L.divIcon({
  className: '',
  html: `<div style="width:30px;height:30px;transform:translate(-50%,-100%)">
    <svg viewBox="0 0 24 24" width="30" height="30"><path fill="#0f7a63" stroke="white" stroke-width="1.2" d="M12 0C6.5 0 2 4.5 2 10c0 7.5 10 22 10 22s10-14.5 10-22c0-5.5-4.5-10-10-10z"/><circle cx="12" cy="10" r="4" fill="white"/></svg>
  </div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 30],
});

const ClickHandler = ({ onPick }) => {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

const RecenterOnChange = ({ lat, lng }) => {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom(), { animate: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat, lng]);
  return null;
};

export const LocationPicker = ({ latitude, longitude, address, onChange }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const [locating, setLocating] = useState(false);
  const debounceRef = useRef(null);

  const lat = latitude ?? DEFAULT_CENTER.lat;
  const lng = longitude ?? DEFAULT_CENTER.lng;

  const reverseGeocode = useCallback(async (la, lo) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${la}&lon=${lo}&zoom=18&addressdetails=1`
      );
      const data = await res.json();
      return data?.display_name || '';
    } catch {
      return '';
    }
  }, []);

  const handlePick = useCallback(
    async (la, lo) => {
      onChange({ latitude: la, longitude: lo });
      const label = await reverseGeocode(la, lo);
      if (label) onChange({ latitude: la, longitude: lo, resolvedAddress: label });
    },
    [onChange, reverseGeocode]
  );

  useEffect(() => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in&limit=5&addressdetails=1`
        );
        const data = await res.json();
        setSuggestions(data || []);
      } catch {
        setSuggestions([]);
      } finally {
        setSearching(false);
      }
    }, 450);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const useCurrentLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        await handlePick(pos.coords.latitude, pos.coords.longitude);
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="flex items-center gap-2 rounded-lg border border-[var(--color-line)] bg-white px-3.5 py-2.5">
          <FaMagnifyingGlass size={14} className="shrink-0 text-[var(--color-ink-soft)]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for your facility's location…"
            className="w-full bg-transparent text-sm outline-none"
          />
          <button
            type="button"
            onClick={useCurrentLocation}
            className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-[var(--color-teal-050)] px-2.5 py-1 text-xs font-medium text-[var(--color-teal-700)] hover:bg-[var(--color-teal-100)]"
          >
            <FaLocationCrosshairs size={11} /> {locating ? 'Locating…' : 'Use current location'}
          </button>
        </div>
        {(suggestions.length > 0 || searching) && (
          <div className="absolute z-[1000] mt-1 w-full overflow-hidden rounded-lg border border-[var(--color-line)] bg-white shadow-lg">
            {searching && <div className="px-3.5 py-2.5 text-xs text-[var(--color-ink-soft)]">Searching…</div>}
            {suggestions.map((s) => (
              <button
                key={s.place_id}
                type="button"
                onClick={() => {
                  handlePick(parseFloat(s.lat), parseFloat(s.lon));
                  onChange({ latitude: parseFloat(s.lat), longitude: parseFloat(s.lon), resolvedAddress: s.display_name });
                  setQuery('');
                  setSuggestions([]);
                }}
                className="flex w-full items-start gap-2 px-3.5 py-2.5 text-left text-xs text-[var(--color-ink)] hover:bg-[var(--color-paper-dim)]"
              >
                <FaLocationDot size={12} className="mt-0.5 shrink-0 text-[var(--color-teal-600)]" />
                {s.display_name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="h-72 w-full overflow-hidden rounded-xl border border-[var(--color-line)]">
        <MapContainer center={[lat, lng]} zoom={13} scrollWheelZoom style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker
            position={[lat, lng]}
            icon={pinIcon}
            draggable
            eventHandlers={{
              dragend: (e) => {
                const { lat: la, lng: lo } = e.target.getLatLng();
                handlePick(la, lo);
              },
            }}
          />
          <ClickHandler onPick={handlePick} />
          <RecenterOnChange lat={lat} lng={lng} />
        </MapContainer>
      </div>

      <p className="flex items-start gap-1.5 text-xs text-[var(--color-ink-soft)]">
        <FaLocationDot size={12} className="mt-0.5 shrink-0" />
        {address || 'Click on the map, drag the pin, or search above to set your exact location.'}
      </p>
      <p className="font-mono text-xs text-[var(--color-ink-soft)]">
        Lat: {lat.toFixed(6)} · Lng: {lng.toFixed(6)}
      </p>
    </div>
  );
};
