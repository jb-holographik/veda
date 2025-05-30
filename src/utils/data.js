// Utilitaire : formatage des grands nombres
function formatAbbreviatedNumber(value) {
  const num = Number(value)
  if (isNaN(num)) return '$0'

  if (num >= 1e12) return `$${(num / 1e12).toFixed(1)}T`
  if (num >= 1e9) return `$${(num / 1e9).toFixed(1)}B`
  if (num >= 1e6) return `$${(num / 1e6).toFixed(1)}M`
  if (num >= 1e3) return `$${(num / 1e3).toFixed(1)}K`
  return `$${num}`
}

// TVL depuis DeFiLlama
export async function fetchAndDisplayTVL() {
  try {
    const res = await fetch('https://api.llama.fi/protocol/veda')
    const json = await res.json()

    // json.tvl est un tableau d'historique
    const tvlHistory = json.tvl
    if (!Array.isArray(tvlHistory) || tvlHistory.length === 0) {
      throw new Error('TVL historique vide ou invalide.')
    }

    const latestTvlEntry = tvlHistory[tvlHistory.length - 1]
    const totalTvl = latestTvlEntry.totalLiquidityUSD

    if (typeof totalTvl !== 'number') {
      throw new Error(`TVL is not a number – received: ${totalTvl}`)
    }

    const abbreviated = formatAbbreviatedNumber(totalTvl)

    const firstBlock = document.querySelector('.data_block')
    if (firstBlock) {
      const contentEl = firstBlock.querySelector('.data-content')
      if (contentEl) {
        contentEl.textContent = abbreviated
      }
    }
  } catch (error) {
    // En cas d'erreur, afficher une valeur par défaut
    const firstBlock = document.querySelector('.data_block')
    if (firstBlock) {
      const contentEl = firstBlock.querySelector('.data-content')
      if (contentEl) {
        contentEl.textContent = '$0'
      }
    }
  }
}

// Lancer au chargement
window.addEventListener('DOMContentLoaded', () => {
  fetchAndDisplayTVL()
})
