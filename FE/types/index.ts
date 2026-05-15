export interface Story {
  id: string
  slug: string
  title: string
  type: string
  target: string
  status: string
  rating: number
  ratingCount: number
  commentCount: number
  nominations: number
  author: string
  postedBy: string
  genres: string[]
  tags: string[]
  description: string
  poster: string | null
  gradient: number
  vip: boolean
  price: number
  hasVipChapters?: boolean
  totalChapters: number
  isUserStory?: boolean
  views?: number
  followers?: number
  createdAt?: string
}

export interface User {
  email: string
  name: string
  gender: string
  password: string
  candy: number
  chaptersRead: number
  followers?: number
}

export interface PublicUser {
  email: string
  name: string
  gender: string
  candy: number
  chaptersRead: number
  followers: number
}

export interface Chapter {
  number: number
  id: string
  title: string
  candyPrice?: number
}

export interface ChapterFull extends Chapter {
  content: string
  storyId: string
  publishedAt?: string
}

export interface Transaction {
  id: number
  type: 'topup' | 'purchase' | 'gift'
  description: string
  candyChange: number
  candyAfter: number
  date: string
}

export interface RankEntry {
  key: string
  name: string
  score: number
  rank: number
  nominations?: number
}

export interface Review {
  id: number
  user: string
  avatar: null
  rating: number
  date: string
  content: string
}

export interface Comment {
  id: number
  user: string
  avatar: null
  date: string
  content: string
}

export interface MyStory {
  id: string
  title: string
  author: string
  genre: string
  description: string
  cover: string | null
  fromZip: string | null
  status: string
  chaptersCount: number
  views: number
  followers: number
  candyEarned: number
  createdAt: string
  vip?: boolean
  price?: number
}
