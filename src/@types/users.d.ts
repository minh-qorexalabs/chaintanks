interface LinksObject {
  type: string
  href: string
}

interface UserDataObject {
  user_id?: any
  name: string
  email: string
  address: string
  description?: string
  password: string
  referralCode: string

  image?: string
  coverImage?: string
  links?: LinksObject[]

  role?: string
  merit?: number
  referrer?: string
  referrallers?: [string]
  referralReward?: number
  followers?: string[]

  // borrow data
  borrowCount?: number
  borrowTime?: number

  lasttime?: number
  created?: number
}