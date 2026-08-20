// hooks/useOnlineStatus.js — Hook React para detectar conectividade em tempo real
import { useState, useEffect } from 'react'

/**
 * Hook customizado que retorna `true` se o computador está conectado
 * à internet e `false` se estiver offline.
 *
 * Usa `navigator.onLine` como valor inicial e escuta os eventos
 * nativos 'online' e 'offline' do navegador/Electron para
 * atualizar o estado em tempo real.
 *
 * Exemplo de uso:
 *   const isOnline = useOnlineStatus()
 *   {isOnline ? '🟢 Online' : '🔴 Offline'}
 */
export default function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Cleanup: remove os listeners quando o componente desmontar
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return isOnline
}
