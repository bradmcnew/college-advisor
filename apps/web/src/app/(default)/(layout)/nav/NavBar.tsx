import { cache } from 'react'
import { NavBarBase } from '~/app/(default)/(layout)/nav/NavigationClient'
import { requireAuth } from '~/lib/auth/auth-utils'
import { getProfileWithImage } from '~/server/queries'

// Cache the profile data fetch to avoid repeated DB calls
const getProfileDataCached = cache(async (userId: string) => {
  try {
    const profile = await getProfileWithImage(userId)
    return {
      profilePic: profile?.user.image ?? '',
      isMentor: profile?.isEduVerified ?? false,
    }
  } catch (error) {
    console.error('Error fetching profile data:', error)
    return {
      profilePic: '',
      isMentor: false,
    }
  }
})

export const NavBar = async () => {
  const { id } = await requireAuth()
  const { profilePic, isMentor } = await getProfileDataCached(id)

  return <NavBarBase profilePic={profilePic} isMentor={isMentor} />
}
