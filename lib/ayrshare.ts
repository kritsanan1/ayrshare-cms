
interface CreatePostData {
  post: string
  platforms: string[]
  mediaUrls?: string[]
  scheduleDate?: string
  profileKeys?: string[]
}

interface AyrshareResponse {
  status: string
  id?: string
  postIds?: Array<{
    platform: string
    postId: string
    status: string
  }>
  errors?: string[]
}

interface AnalyticsData {
  likes?: number
  comments?: number
  shares?: number
  views?: number
  clicks?: number
  reach?: number
  impressions?: number
}

interface ProfileData {
  platform: string
  profileKey: string
  name: string
  isActive: boolean
  avatar?: string
}

export class AyrshareService {
  private apiKey: string
  private baseURL = 'https://app.ayrshare.com/api'

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  private async makeRequest(endpoint: string, method: string = 'GET', data?: any) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    })

    if (!response.ok) {
      throw new Error(`Ayrshare API error: ${response.statusText}`)
    }

    return response.json()
  }

  async createPost(data: CreatePostData): Promise<AyrshareResponse> {
    return this.makeRequest('/post', 'POST', data)
  }

  async getPost(postId: string): Promise<any> {
    return this.makeRequest(`/post/${postId}`)
  }

  async deletePost(postId: string): Promise<any> {
    return this.makeRequest(`/delete/${postId}`, 'DELETE')
  }

  async getAnalytics(postId: string): Promise<AnalyticsData> {
    return this.makeRequest(`/analytics/post/${postId}`)
  }

  async getProfiles(): Promise<ProfileData[]> {
    return this.makeRequest('/profiles')
  }

  async getHistory(platform?: string): Promise<any[]> {
    const params = platform ? `?platform=${platform}` : ''
    return this.makeRequest(`/history${params}`)
  }

  async uploadMedia(file: File): Promise<{ url: string }> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${this.baseURL}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`Media upload error: ${response.statusText}`)
    }

    return response.json()
  }
}

// Helper function to get Ayrshare instance
export function getAyrshareClient(apiKey?: string): AyrshareService {
  const key = apiKey || process.env.AYRSHARE_API_KEY
  if (!key) {
    throw new Error('Ayrshare API key is required')
  }
  return new AyrshareService(key)
}
