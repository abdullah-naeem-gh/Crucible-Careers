import { NextResponse } from 'next/server'

interface CompanyLocation {
  id: string
  name: string
  city: string
  lat: number
  lng: number
  industry: string
}

const MOCK_COMPANIES: CompanyLocation[] = [
  // Karachi
  { id: "c1", name: "TechKarachi Solutions", city: "Karachi", lat: 24.8607, lng: 67.0011, industry: "Software" },
  { id: "c2", name: "Folio3 Pvt Ltd", city: "Karachi", lat: 24.8722, lng: 67.0305, industry: "Mobile & Web Dev" },
  { id: "c3", name: "Systems Limited (Karachi)", city: "Karachi", lat: 24.8512, lng: 67.0191, industry: "Enterprise IT" },
  // Lahore
  { id: "c4", name: "Lahore Devs", city: "Lahore", lat: 31.5204, lng: 74.3587, industry: "AI & SaaS" },
  { id: "c5", name: "NetSol Technologies", city: "Lahore", lat: 31.4812, lng: 74.2115, industry: "Fintech" },
  { id: "c6", name: "Educative.io Lahore", city: "Lahore", lat: 31.5601, lng: 74.3122, industry: "EdTech" },
  // Islamabad
  { id: "c7", name: "Islamabad AI Labs", city: "Islamabad", lat: 33.6844, lng: 73.0479, industry: "Deep Learning" },
  { id: "c8", name: "KeepTruckin Pakistan", city: "Islamabad", lat: 33.7294, lng: 73.0931, industry: "Logistics IoT" },
  // Peshawar
  { id: "c9", name: "Peshawar Tech Solutions", city: "Peshawar", lat: 34.0151, lng: 71.5249, industry: "SaaS" },
  // Rawalpindi
  { id: "c10", name: "Rawalpindi Digital", city: "Rawalpindi", lat: 33.5651, lng: 73.0169, industry: "E-Commerce" },
  // Faisalabad
  { id: "c11", name: "Faisalabad Textiles IT", city: "Faisalabad", lat: 31.4504, lng: 73.1350, industry: "Logistics" },
  // Multan
  { id: "c12", name: "Multan Softwares", city: "Multan", lat: 30.1575, lng: 71.5249, industry: "Web Dev" }
]

export async function GET() {
  return NextResponse.json({ companies: MOCK_COMPANIES })
}
