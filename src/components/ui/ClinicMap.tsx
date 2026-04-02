import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { cn } from '../../lib/utils'

interface ClinicMarker {
  id: string
  name: string
  lat: number
  lng: number
  rating?: number
  address?: string
}

interface ClinicMapProps {
  clinics: ClinicMarker[]
  center?: [number, number]
  zoom?: number
  onMarkerClick?: (id: string) => void
  className?: string
}

const clinicIcon = L.divIcon({
  className: 'clinic-marker',
  html: '<div style="width:24px;height:24px;background:#1A1A1A;display:flex;align-items:center;justify-content:center"><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v10M1 6h10" stroke="#FDFBF7" stroke-width="2"/></svg></div>',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
})

function RatingStars({ rating }: { rating: number }) {
  const full = Math.floor(rating)
  const half = rating - full >= 0.5
  const empty = 5 - full - (half ? 1 : 0)

  return (
    <span className="inline-flex gap-px text-warm" aria-label={`${rating} su 5`}>
      {Array.from({ length: full }).map((_, i) => (
        <svg key={`f${i}`} width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
          <polygon points="5,0.5 6.4,3.5 9.7,3.9 7.3,6.1 7.9,9.4 5,7.8 2.1,9.4 2.7,6.1 0.3,3.9 3.6,3.5" />
        </svg>
      ))}
      {half && (
        <svg width="10" height="10" viewBox="0 0 10 10">
          <defs>
            <clipPath id="half-star">
              <rect x="0" y="0" width="5" height="10" />
            </clipPath>
          </defs>
          <polygon
            points="5,0.5 6.4,3.5 9.7,3.9 7.3,6.1 7.9,9.4 5,7.8 2.1,9.4 2.7,6.1 0.3,3.9 3.6,3.5"
            fill="currentColor"
            clipPath="url(#half-star)"
          />
          <polygon
            points="5,0.5 6.4,3.5 9.7,3.9 7.3,6.1 7.9,9.4 5,7.8 2.1,9.4 2.7,6.1 0.3,3.9 3.6,3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
          />
        </svg>
      )}
      {Array.from({ length: empty }).map((_, i) => (
        <svg key={`e${i}`} width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="0.5">
          <polygon points="5,0.5 6.4,3.5 9.7,3.9 7.3,6.1 7.9,9.4 5,7.8 2.1,9.4 2.7,6.1 0.3,3.9 3.6,3.5" />
        </svg>
      ))}
    </span>
  )
}

export function ClinicMap({
  clinics,
  center = [45.4642, 9.19],
  zoom = 12,
  onMarkerClick,
  className,
}: ClinicMapProps) {
  return (
    <div className={cn('relative w-full', className)} style={{ minHeight: 400 }}>
      <style>{`
        .leaflet-popup-content-wrapper { border-radius: 0 !important; box-shadow: 0 4px 20px rgba(26,26,26,0.1); }
        .leaflet-popup-tip { display: none; }
        .clinic-marker { background: none !important; border: none !important; }
      `}</style>

      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={false}
        className="w-full h-full"
        style={{ minHeight: 400 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />

        {clinics.map((clinic) => (
          <Marker
            key={clinic.id}
            position={[clinic.lat, clinic.lng]}
            icon={clinicIcon}
            eventHandlers={{
              click: () => onMarkerClick?.(clinic.id),
            }}
          >
            <Popup>
              <div className="p-1 min-w-[160px]">
                <p className="font-display font-medium text-sm text-graphite leading-tight">
                  {clinic.name}
                </p>
                {clinic.rating !== undefined && (
                  <div className="flex items-center gap-1.5 mt-1">
                    <RatingStars rating={clinic.rating} />
                    <span className="text-xs text-silver">{clinic.rating.toFixed(1)}</span>
                  </div>
                )}
                {clinic.address && (
                  <p className="text-xs text-silver mt-1 leading-snug">
                    {clinic.address}
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => onMarkerClick?.(clinic.id)}
                  className="mt-2 text-xs font-medium text-warm hover:text-graphite transition-colors duration-200"
                >
                  Vedi disponibilit&agrave; &rarr;
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
