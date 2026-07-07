"use client"

import { useEffect, useState } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

/** Safe theme hook — works inside OR outside DashboardThemeProvider */
function useMapTheme(): "light" | "dark" {
  const [theme, setTheme] = useState<"light" | "dark">("light")
  useEffect(() => {
    const read = () =>
      setTheme(document.documentElement.classList.contains("dark") ? "dark" : "light")
    read()
    const observer = new MutationObserver(read)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })
    return () => observer.disconnect()
  }, [])
  return theme
}

interface Company {
  id: string
  name: string
  city: string
  lat: number
  lng: number
  industry: string
}

interface LocationMapProps {
  center: [number, number]
  userLocation: [number, number] | null
  onLocationSelect: (lat: number, lng: number) => void
  companies: Company[]
}

// Custom Leaflet Icons styled with Tailwind CSS
const createCompanyIcon = (name: string, industry: string) => {
  // Get initials, e.g. "TechKarachi Solutions" -> "TK"
  const initials = name
    .split(" ")
    .map(w => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // Set color based on industry for visual categorization
  const bgClass = 
    industry.toLowerCase().includes("software") || industry.toLowerCase().includes("dev")
      ? "bg-blue-600 dark:bg-blue-500"
      : industry.toLowerCase().includes("fintech")
      ? "bg-emerald-600 dark:bg-emerald-500"
      : industry.toLowerCase().includes("ai") || industry.toLowerCase().includes("learning")
      ? "bg-violet-600 dark:bg-violet-500"
      : "bg-amber-600 dark:bg-amber-500";

  return L.divIcon({
    html: `<div class="relative flex flex-col items-center group">
             <!-- Avatar bubble -->
             <div class="flex h-8 w-8 items-center justify-center rounded-full ${bgClass} text-white font-bold text-[10px] border-2 border-white dark:border-[#1c1c1c] shadow-[0_3px_8px_rgba(0,0,0,0.25)] transition-all duration-200 transform hover:scale-115">
               ${initials}
             </div>
             <!-- Small map pin bottom pointer -->
             <div class="w-1.5 h-1.5 ${bgClass} rounded-full border border-white dark:border-[#1c1c1c] -mt-0.5 shadow-sm"></div>
           </div>`,
    className: "custom-company-icon",
    iconSize: [40, 40],
    iconAnchor: [20, 36],
  })
}

const userIcon = L.divIcon({
  html: `<div class="relative flex flex-col items-center">
           <span class="absolute inline-flex h-9 w-9 animate-ping rounded-full bg-orange-500/30 opacity-50"></span>
           <div class="flex h-9 w-9 items-center justify-center rounded-full bg-[#FF6B00] text-white border-2 border-white dark:border-[#1c1c1c] shadow-[0_3px_10px_rgba(255,107,0,0.4)]">
             <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
               <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
               <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
             </svg>
           </div>
           <div class="w-1.5 h-1.5 bg-[#FF6B00] rounded-full border border-white dark:border-[#1c1c1c] -mt-0.5 shadow-sm"></div>
         </div>`,
  className: "custom-user-icon",
  iconSize: [40, 40],
  iconAnchor: [20, 36],
})

// Map controller to change center dynamically
function ChangeView({ center }: { center: [number, number] }) {
  const map = useMapEvents({})
  useEffect(() => {
    map.setView(center, map.getZoom())
  }, [center, map])
  return null
}

// Click listener to select custom spot
function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

export default function LocationMap({
  center,
  userLocation,
  onLocationSelect,
  companies,
}: LocationMapProps) {
  const theme = useMapTheme()

  // Dynamically use premium dark-mode or light-mode map tiles from CartoDB
  const tileUrl =
    theme === "dark"
      ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"

  return (
    <div className="h-full w-full overflow-hidden rounded-xl relative border border-gray-200 dark:border-white/10">
      {/* Dynamic Scoped Leaflet Theme Styles */}
      <style jsx global>{`
        /* Light mode overrides for clean Leaflet controls */
        .leaflet-container {
          background-color: #f9fafb !important;
        }
        .leaflet-bar {
          border: 1px solid rgba(0, 0, 0, 0.15) !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08) !important;
          border-radius: 8px !important;
          overflow: hidden !important;
        }
        .leaflet-bar a {
          background-color: #ffffff !important;
          color: #374151 !important;
          border: none !important;
          transition: background-color 0.15s !important;
        }
        .leaflet-bar a:hover {
          background-color: #f3f4f6 !important;
          color: #111827 !important;
        }

        /* Dark Mode adjustments for Leaflet container and items */
        .dark .leaflet-container {
          background-color: #141414 !important;
        }
        .dark .leaflet-bar {
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4) !important;
        }
        .dark .leaflet-bar a {
          background-color: #1c1c1c !important;
          color: rgba(255, 255, 255, 0.8) !important;
        }
        .dark .leaflet-bar a:hover {
          background-color: rgba(255, 255, 255, 0.08) !important;
          color: #ffffff !important;
        }
        
        /* Popup wrappers styled for both themes */
        .leaflet-popup-content-wrapper {
          border-radius: 12px !important;
          padding: 2px !important;
          background-color: #ffffff !important;
          color: #1f2937 !important;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1) !important;
          border: 1px solid rgba(0, 0, 0, 0.08) !important;
        }
        
        .dark .leaflet-popup-content-wrapper {
          background-color: #1c1c1c !important;
          color: #ffffff !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5) !important;
        }
        
        .leaflet-popup-tip {
          background-color: #ffffff !important;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1) !important;
          border: 1px solid rgba(0, 0, 0, 0.08) !important;
        }
        
        .dark .leaflet-popup-tip {
          background-color: #1c1c1c !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
        }
        
        .leaflet-popup-content {
          margin: 12px 14px !important;
          line-height: 1.45 !important;
          font-family: inherit !important;
        }
        
        .leaflet-container a.leaflet-popup-close-button {
          color: #9ca3af !important;
          padding: 8px 8px 0 0 !important;
          font-size: 16px !important;
        }
        .leaflet-container a.leaflet-popup-close-button:hover {
          color: #4b5563 !important;
        }
        .dark .leaflet-container a.leaflet-popup-close-button:hover {
          color: #fff !important;
        }
      `}</style>

      <MapContainer
        center={center}
        zoom={12}
        scrollWheelZoom={true}
        className="h-full w-full z-10"
      >
        <ChangeView center={center} />
        <TileLayer
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
          url={tileUrl}
        />

        <MapClickHandler onMapClick={onLocationSelect} />

        {/* User Picked Pin */}
        {userLocation && (
          <Marker position={userLocation} icon={userIcon}>
            <Popup>
              <div className="text-xs font-semibold text-gray-950 dark:text-white">
                Your Picked Location
                <div className="mt-1 text-[10px] text-gray-500 dark:text-white/40 font-normal">
                  Lat: {userLocation[0].toFixed(4)}, Lng: {userLocation[1].toFixed(4)}
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Company Pins */}
        {companies.map((company) => (
          <Marker
            key={company.id}
            position={[company.lat, company.lng]}
            icon={createCompanyIcon(company.name, company.industry)}
          >
            <Popup>
              <div className="p-0.5">
                <span className="text-[9px] uppercase tracking-wider font-semibold text-[#FF6B00] dark:text-[#FF914D]">
                  {company.industry}
                </span>
                <h4 className="text-xs font-bold text-gray-900 dark:text-white mt-0.5">
                  {company.name}
                </h4>
                <p className="text-[10px] text-gray-500 dark:text-white/40 mt-0.5">
                  Location: {company.city}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
