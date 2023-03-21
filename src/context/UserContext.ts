import { createContext, useContext } from 'solid-js'

export const UserContext = createContext<{
  onFrame: (callback: (args: { clock: number }) => void) => void
}>()

export const useUserContext = () => useContext(UserContext)
