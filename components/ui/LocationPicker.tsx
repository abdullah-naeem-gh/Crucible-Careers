"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { IconMap, IconMapPin, IconX, IconCheck, IconChevronDown, IconCurrentLocation } from "@tabler/icons-react"
import dynamic from "next/dynamic"

interface City {
  name: string
  lat: number
  lng: number
}

const PAKISTAN_CITIES: City[] = [
  { name: "Karachi", lat: 24.8607, lng: 67.0011 },
  { name: "Lahore", lat: 31.5204, lng: 74.3587 },
  { name: "Islamabad", lat: 33.6844, lng: 73.0479 },
  { name: "Rawalpindi", lat: 33.5651, lng: 73.0169 },
  { name: "Faisalabad", lat: 31.4504, lng: 73.1350 },
  { name: "Multan", lat: 30.1575, lng: 71.5249 },
  { name: "Peshawar", lat: 34.0151, lng: 71.5249 },
  { name: "Quetta", lat: 30.1798, lng: 66.9750 },
  { name: "Gujranwala", lat: 32.1877, lng: 74.1945 },
  { name: "Sialkot", lat: 32.4972, lng: 74.5361 },
  { name: "Sargodha", lat: 32.0836, lng: 72.6711 },
  { name: "Bahawalpur", lat: 29.3544, lng: 71.6911 },
  { name: "Sukkur", lat: 27.7244, lng: 68.8228 },
  { name: "Hyderabad", lat: 25.3960, lng: 68.3578 },
]

interface Company {
  id: string
  name: string
  city: string
  lat: number
  lng: number
  industry: string
}

interface LocationPickerProps {
  value: string
  onChange: (value: string) => void
}

// Dynamically load the Leaflet Map component with SSR disabled
const LocationMap = dynamic(() => import("./LocationMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[320px] w-full items-center justify-center bg-gray-50 text-sm text-gray-400 dark:bg-[#141414] dark:text-white/20">
      <div className="flex flex-col items-center gap-2">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
        <span>Loading interactive map...</span>
      </div>
    </div>
  ),
})

export default function LocationPicker({ value, onChange }: LocationPickerProps) {
  const [selectedCity, setSelectedCity] = useState<City>(PAKISTAN_CITIES[0])
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isMapOpen, setIsMapOpen] = useState(false)
  const [companies, setCompanies] = useState<Company[]>([])
  
  // Coords picked by user on map
  const [tempUserLocation, setTempUserLocation] = useState<[number, number] | null>(null)
  // Map center coords
  const [mapCenter, setMapCenter] = useState<[number, number]>([PAKISTAN_CITIES[0].lat, PAKISTAN_CITIES[0].lng])
  
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Fetch companies on mount
  useEffect(() => {
    fetch("/api/companies")
      .then((res) => res.json())
      .then((data) => {
        if (data.companies) setCompanies(data.companies)
      })
      .catch((err) => console.error("Error loading companies:", err))
  }, [])

  // Parse location value on load or external change
  useEffect(() => {
    if (!value) return

    // Check if it's a map coordinate value like "Lahore (Lat: 31.5204, Lng: 74.3587)"
    const match = value.match(/(.+)\s\(Lat:\s([-\d.]+),\sLng:\s([-\d.]+)\)/)
    if (match) {
      const cityName = match[1]
      const lat = parseFloat(match[2])
      const lng = parseFloat(match[3])
      const cityObj = PAKISTAN_CITIES.find(c => c.name.toLowerCase() === cityName.toLowerCase())
      if (cityObj) {
        setSelectedCity(cityObj)
      } else {
        setSelectedCity({ name: cityName, lat, lng })
      }
      setTempUserLocation([lat, lng])
      setMapCenter([lat, lng])
    } else {
      // Just a plain city name
      const cityObj = PAKISTAN_CITIES.find(c => c.name.toLowerCase() === value.toLowerCase())
      if (cityObj) {
        setSelectedCity(cityObj)
        setMapCenter([cityObj.lat, cityObj.lng])
        setTempUserLocation([cityObj.lat, cityObj.lng])
      }
    }
  }, [value])

  // Handle click outside to exit city dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleCitySelect = (city: City) => {
    setSelectedCity(city)
    setMapCenter([city.lat, city.lng])
    setTempUserLocation([city.lat, city.lng])
    
    // Selecting a city in dropdown selects that city on the map immediately
    const val = `${city.name} (Lat: ${city.lat.toFixed(4)}, Lng: ${city.lng.toFixed(4)})`
    onChange(val)
    
    setIsDropdownOpen(false)
  }

  const handleMapClickSelect = (lat: number, lng: number) => {
    setTempUserLocation([lat, lng])
    // Sync the value immediately on click or when confirmed
    const val = `${selectedCity.name} (Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)})`
    onChange(val)
  }

  const handleConfirmLocation = () => {
    if (tempUserLocation) {
      const val = `${selectedCity.name} (Lat: ${tempUserLocation[0].toFixed(4)}, Lng: ${tempUserLocation[1].toFixed(4)})`
      onChange(val)
    } else {
      onChange(selectedCity.name)
    }
    setIsMapOpen(false)
  }

  // Geolocation API helper
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser")
      return
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setTempUserLocation([latitude, longitude])
        setMapCenter([latitude, longitude])
        
        // Find nearest city from hardcoded list
        let nearestCity = PAKISTAN_CITIES[0]
        let minDist = Infinity
        PAKISTAN_CITIES.forEach(c => {
          const dist = Math.sqrt(Math.pow(c.lat - latitude, 2) + Math.pow(c.lng - longitude, 2))
          if (dist < minDist) {
            minDist = dist
            nearestCity = c
          }
        })
        
        setSelectedCity(nearestCity)
        const val = `${nearestCity.name} (Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)})`
        onChange(val)
        // Automatically slide open the map so they see their pin
        setIsMapOpen(true)
      },
      (error) => {
        alert("Unable to retrieve location: " + error.message)
      }
    )
  }

  return (
    <div className="w-full space-y-3">
      {/* Top Row: Dropdown, Locate Me, View Map */}
      <div className="flex gap-2 items-center">
        {/* City selection dropdown */}
        <div ref={dropdownRef} className="relative flex-1 min-w-[150px]">
          <button
            type="button"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            className="flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-medium profile-select-trigger shadow-sm transition focus:border-orange-400 focus:ring-2 focus:ring-orange-500/10"
          >
            <span>{value ? value.split(" (")[0] : selectedCity.name}</span>
            <IconChevronDown
              size={16}
              className={`text-gray-400 dark:text-white/40 transition-transform ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -4, scale: 0.98 }}
                animate={{ opacity: 1, y: 6, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.98 }}
                transition={{ duration: 0.16, ease: "easeOut" }}
                className="absolute left-0 right-0 top-full z-40 max-h-60 overflow-y-auto rounded-xl profile-select-menu shadow-[0_12px_30px_rgba(0,0,0,0.08)] ring-1 ring-black/[0.03] [&::-webkit-scrollbar]:w-[5px] [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full dark:[&::-webkit-scrollbar-thumb]:bg-white/15 hover:[&::-webkit-scrollbar-thumb]:bg-gray-400 dark:hover:[&::-webkit-scrollbar-thumb]:bg-white/25 [&::-webkit-scrollbar-track]:bg-transparent"
              >
                {PAKISTAN_CITIES.map((city) => (
                  <button
                    key={city.name}
                    type="button"
                    onClick={() => handleCitySelect(city)}
                    className={`flex w-full cursor-pointer items-center justify-between px-3 py-2.5 text-left text-sm profile-select-option ${
                      selectedCity.name === city.name ? "profile-select-option-active font-semibold" : ""
                    }`}
                  >
                    <span>{city.name}</span>
                    {selectedCity.name === city.name && <IconCheck size={15} />}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Locate Me Button */}
        <button
          type="button"
          onClick={handleLocateMe}
          title="Locate me using GPS"
          className="inline-flex h-[38px] w-[38px] cursor-pointer items-center justify-center rounded-xl border border-gray-300 bg-gray-50 text-gray-700 hover:bg-gray-100 hover:border-gray-400 transition shadow-sm dark:border-white/10 dark:bg-white/[0.035] dark:text-white/75 dark:hover:bg-white/[0.05]"
        >
          <IconCurrentLocation size={16} />
        </button>

        {/* Map Toggle Slide Button */}
        <button
          type="button"
          onClick={() => {
            setIsMapOpen((prev) => !prev)
            if (tempUserLocation) {
              setMapCenter(tempUserLocation)
            } else {
              setMapCenter([selectedCity.lat, selectedCity.lng])
            }
          }}
          className={`inline-flex h-[38px] cursor-pointer items-center justify-center gap-1.5 rounded-xl border px-3.5 text-xs font-semibold shadow-sm transition ${
            isMapOpen
              ? "bg-[#FF6B00] border-[#FF6B00] text-white hover:bg-[#E05E00]"
              : "border-gray-300 bg-gray-50 text-gray-700 hover:bg-gray-100 hover:border-gray-400 dark:border-white/10 dark:bg-white/[0.035] dark:text-white/75 dark:hover:bg-white/[0.05]"
          }`}
        >
          <IconMap size={16} />
          <span>{isMapOpen ? "Hide Map" : "View Map"}</span>
        </button>
      </div>

      {/* Inline Slide-Down Map Panel */}
      <AnimatePresence initial={false}>
        {isMapOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0, marginTop: 0 }}
            animate={{ height: "auto", opacity: 1, marginTop: 8 }}
            exit={{ height: 0, opacity: 0, marginTop: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="border border-gray-200 dark:border-white/10 rounded-2xl bg-gray-50/50 dark:bg-[#141414]/30 p-3 space-y-3">
              {/* Map Panel Wrapper */}
              <div className="h-[320px] w-full rounded-xl overflow-hidden relative">
                <LocationMap
                  center={mapCenter}
                  userLocation={tempUserLocation}
                  onLocationSelect={handleMapClickSelect}
                  companies={companies}
                />
              </div>

              {/* Map Actions / Status footer */}
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
                <div className="text-gray-500 dark:text-white/40">
                  {tempUserLocation ? (
                    <span className="flex items-center gap-1.5">
                      <IconMapPin size={14} className="text-[#FF6B00] dark:text-[#FF914D]" />
                      Pinned: <strong className="text-gray-800 dark:text-white font-semibold">{tempUserLocation[0].toFixed(4)}, {tempUserLocation[1].toFixed(4)}</strong>
                    </span>
                  ) : (
                    <span>Click anywhere on the map to pin a custom location</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setTempUserLocation([selectedCity.lat, selectedCity.lng])
                      onChange(selectedCity.name)
                    }}
                    className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-white/10 dark:bg-white/[0.035] dark:text-white/60 dark:hover:bg-white/[0.05] cursor-pointer"
                  >
                    Reset Center
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmLocation}
                    className="px-3 py-1.5 rounded-lg bg-[#FF6B00] text-white hover:bg-[#E05E00] shadow-sm font-semibold cursor-pointer"
                  >
                    Confirm Location
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
