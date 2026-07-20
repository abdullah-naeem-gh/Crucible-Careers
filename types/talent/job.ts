export interface ScrapedJob {
  _id: string
  employerId?: string
  title: string
  company: string
  location: string | null
  type: 'full-time' | 'part-time' | 'contract' | 'internship' | 'remote' | null
  locationType?: 'remote' | 'hybrid' | 'on-site' | null
  salary: string | null
  url: string
  source: string
  description: string | null
  tags: string[]
  posted_at: string | null
}

export interface SavedJob {
  id: string
  title: string
  company: string
  location: string
  type: string
  salary?: string
  tags: string[]
  postedAt: string
  description: string
  matchScore: number
  savedAt: string
}

export interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface PaginatedJobsResponse {
  data: ScrapedJob[]
  meta: PaginationMeta
}
