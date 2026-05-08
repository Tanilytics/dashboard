import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import type { UserResponse, SiteResponse } from '#/types/api'

export const userAtom = atom<UserResponse | null>(null)
export const sitesAtom = atom<SiteResponse[]>([])
export const currentSiteIdAtom = atom<string | null>(null)
export const isLoadingAtom = atom(false)

const logoutAtom = atom(null, (_get, set) => {
  set(userAtom, null)
  set(sitesAtom, [])
  set(currentSiteIdAtom, null)
  if (typeof window !== 'undefined') {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
  }
  window.location.href = '/login'
})

export function useAuth() {
  const [user, setUser] = useAtom(userAtom)
  const [sites, setSites] = useAtom(sitesAtom)
  const [currentSiteId, setCurrentSiteId] = useAtom(currentSiteIdAtom)
  const isLoading = useAtomValue(isLoadingAtom)
  const logout = useSetAtom(logoutAtom)

  return {
    user,
    sites,
    currentSiteId,
    isLoading,
    setUser,
    setSites,
    setCurrentSiteId,
    logout,
  }
}
