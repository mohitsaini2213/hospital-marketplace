import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Link } from 'react-router-dom';
import { DEFAULT_CENTER } from '@/utils/constants';

const buildIcon = (color) =>
  L.divIcon({
    className: '',
    html: `<div style="width:26px;height:26px;transform:translate(-50%,-100%)">
      <svg viewBox="0 0 24 24" width="26" height="26"><path fill="${color}" stroke="white" stroke-width="1.2" d="M12 0C6.5 0 2 4.5 2 10c0 7.5 10 22 10 22s10-14.5 10-22c0-5.5-4.5-10-10-10z"/><circle cx="12" cy="10" r="3.6" fill="white"/></svg>
    </div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 26],
  });

const TYPE_COLOR = {
  Hospital: '#0f7a63',
  Clinic: '#b9803d',
  'Medical Store / Pharmacy': '#17916f',
  'Diagnostic Center': '#0b4f44',
  'Nursing Home': '#93601f',
};
const defaultIcon = buildIcon('#0f7a63');
const iconCache = {};
const iconFor = (type) => {
  const color = TYPE_COLOR[type] || '#0f7a63';
  if (!iconCache[color]) iconCache[color] = buildIcon(color);
  return iconCache[color];
};

export const FacilityMap = ({ facilities = [], center, zoom = 13, height = '480px', singleMarker }) => {
  const mapCenter = center || (singleMarker ? [singleMarker.latitude, singleMarker.longitude] : [DEFAULT_CENTER.lat, DEFAULT_CENTER.lng]);

  return (
    <div style={{ height }} className="w-full overflow-hidden rounded-xl border border-[var(--color-line)]">
      <MapContainer center={mapCenter} zoom={zoom} scrollWheelZoom style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {singleMarker && (
          <Marker position={[singleMarker.latitude, singleMarker.longitude]} icon={defaultIcon}>
            <Popup>{singleMarker.name}</Popup>
          </Marker>
        )}
        {facilities.map((f) => (
          <Marker key={f._id} position={[f.latitude, f.longitude]} icon={iconFor(f.facilityType)}>
            <Popup>
              <div className="min-w-[180px] text-sm">
                <p className="font-semibold text-[var(--color-ink)]">{f.name}</p>
                <p className="text-xs text-[var(--color-ink-soft)]">{f.facilityType}</p>
                <p className="mt-1 text-xs text-[var(--color-ink-soft)]">{f.address}</p>
                {f.mobile1 && <p className="text-xs text-[var(--color-ink-soft)]">{f.mobile1}</p>}
                <Link to={`/facility/${f.slug || f._id}`} className="mt-2 inline-block text-xs font-semibold text-[var(--color-teal-700)]">
                  View Details →
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};
