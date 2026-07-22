export interface CompanySuggestion {
  name: string
  logo: string | null
}

let cachedCompanies: CompanySuggestion[] | null = null

export async function fetchCompanyNames(): Promise<CompanySuggestion[]> {
  if (cachedCompanies) return cachedCompanies
  const res = await fetch('/api/talent/companies/names')
  const data = await res.json()
  cachedCompanies = Array.isArray(data.companies) ? data.companies : []
  return cachedCompanies as CompanySuggestion[]
}
