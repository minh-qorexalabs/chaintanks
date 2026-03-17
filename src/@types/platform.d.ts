interface NotificationObject {
  user: string
  title: string
  description?: string
  status?: string
  created?: number
}

interface ReferralRewardObject {
  user: string
  amount: number
  action: string
  status: string
  tx?: string
  log?: string
}

interface NftTankObject {
  id: string
  owner: string
  level?: string
  role?: string

  classType: number
  energy?: number
  maxEnergy?: number
  energyPool?: number
  maxEnergyPool?: number
  experience?: number
  tankLevel?: number
  name?: string
  image?: string
  description?: string
  health?: number
  fireRate?: number
  firePower?: number
  speed?: number
  borrower?: string
  followers?: [string]

  updatedAt?: Date
}

interface ClassesObject {
  id: number
  name?: string
  image?: string
  description?: string
  health?: number
  fireRate?: number
  firePower?: number
  speed?: number
  healthAdd?: number
  fireRateAdd?: number

  firePowerAdd?: number
  speedAdd?: number
  price?: number
}

interface AdminSettingObject {
  type: String,
  value: String
}