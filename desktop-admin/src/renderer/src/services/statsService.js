// services/statsService.js — Estatísticas do Sistema (Online + Offline via localStorage)
import { getAdminToken } from './authService'

const API_BASE = 'http://127.0.0.1:8000/admin'
const CACHE_KEY = '@EduAcess:dashboard_stats'

/**
 * Estrutura de dados zerada usada como fallback quando offline e sem cache.
 */
const STATS_VAZIAS = {
  usuarios: { total: 0, novos_ultimos_7_dias: 0 },
  engajamento: { tarefas_ativas: 0, disciplinas_ativas: 0, flashcards_criados: 0, simulados_realizados: 0 }
}

/**
 * Busca as estatísticas do sistema.
 *
 * Modo Online  → Faz GET em /admin/estatisticas. Se bem-sucedido, salva no
 *                localStorage como cache simples e retorna os dados frescos.
 *                Se o fetch falhar, cai no cache local.
 * Modo Offline → Retorna os dados do localStorage (ou zeros, se vazio).
 *
 * @param {boolean} isOnline — Resultado do hook useOnlineStatus()
 * @returns {Promise<Object>} Objeto com estrutura { usuarios, engajamento }
 */
export async function fetchEstatisticas(isOnline) {
  if (isOnline) {
    try {
      const token = getAdminToken()
      const response = await fetch(`${API_BASE}/estatisticas`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(8000)
      })

      if (!response.ok) {
        console.warn(`[statsService] API retornou HTTP ${response.status}. Usando cache local.`)
        return _lerCache()
      }

      const stats = await response.json()

      // Persiste no localStorage como cache para uso offline
      localStorage.setItem(CACHE_KEY, JSON.stringify({ ...stats, _cached_at: Date.now() }))

      return stats
    } catch (err) {
      console.warn('[statsService] Falha de rede ao buscar estatísticas. Usando cache local.', err?.message || err)
      return _lerCache()
    }
  }

  // Modo offline explícito
  return _lerCache()
}

/**
 * Lê o cache de estatísticas do localStorage.
 * Retorna STATS_VAZIAS se não houver cache.
 */
function _lerCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return STATS_VAZIAS
    const { _cached_at, ...stats } = JSON.parse(raw)
    return stats
  } catch {
    return STATS_VAZIAS
  }
}
