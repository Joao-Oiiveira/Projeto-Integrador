// hooks/useOnlineStatus.js — Hook React para detectar conectividade em tempo real
// Verifica DOIS níveis: (1) internet do SO via navigator.onLine, (2) API Python respondendo
import { useState, useEffect, useCallback } from 'react'

const API_HEALTH_URL = 'http://127.0.0.1:8000/health'
const API_CHECK_INTERVAL_MS = 20_000 // verifica a cada 20 segundos

/**
 * Hook customizado que retorna `true` se a API Python está acessível
 * e `false` se estiver offline OU se a API estiver fora do ar.
 *
 * Dois níveis de verificação:
 *   1. `navigator.onLine` — detecta ausência total de rede (SO sem internet)
 *   2. Ping periódico ao endpoint /health da API — detecta quando a API caiu
 *      mas o SO ainda tem internet (ex: servidor reiniciando).
 *
 * Ao montar o componente, realiza uma verificação imediata.
 * Depois, repete a cada API_CHECK_INTERVAL_MS milissegundos.
 *
 * Exemplo de uso:
 *   const isOnline = useOnlineStatus()
 *   {isOnline ? '🟢 Online' : '🔴 Offline (API indisponível)'}
 */
export default function useOnlineStatus() {
  // Começa como false e verifica imediatamente — evita "falso online"
  const [isOnline, setIsOnline] = useState(false)

  /**
   * Verifica se a API Python está respondendo fazendo um GET /health.
   * Usa AbortSignal.timeout para não bloquear mais de 4 segundos.
   * Retorna true se a resposta for OK (2xx), false em qualquer erro.
   */
  const checkApiHealth = useCallback(async () => {
    // Se o SO já reporta offline, não há sentido em tentar o fetch
    if (!navigator.onLine) {
      setIsOnline(false)
      return
    }

    try {
      const response = await fetch(API_HEALTH_URL, {
        method: 'GET',
        signal: AbortSignal.timeout(4000) // timeout de 4 segundos
      })
      setIsOnline(response.ok)
    } catch {
      // Fetch lançou exceção: API fora do ar, recusou conexão ou timeout
      setIsOnline(false)
    }
  }, [])

  useEffect(() => {
    // Verificação imediata ao montar o componente
    checkApiHealth()

    // Verificação periódica a cada intervalo definido
    const intervalId = setInterval(checkApiHealth, API_CHECK_INTERVAL_MS)

    // Listeners de rede do SO:
    // - quando o SO fica online, dispara verificação da API imediatamente
    // - quando o SO fica offline, marca como offline sem tentar o fetch
    const handleOnline = () => checkApiHealth()
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Cleanup: remove listeners e interval ao desmontar
    return () => {
      clearInterval(intervalId)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [checkApiHealth])

  return isOnline
}
