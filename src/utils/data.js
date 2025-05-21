function formatAbbreviatedNumber(value) {
  const num = Number(value)
  if (isNaN(num)) return '$0'

  if (num >= 1e12) return `$${(num / 1e12).toFixed(1)}T`
  if (num >= 1e9) return `$${(num / 1e9).toFixed(1)}B`
  if (num >= 1e6) return `$${(num / 1e6).toFixed(1)}M`
  if (num >= 1e3) return `$${(num / 1e3).toFixed(1)}K`
  return `$${num}`
}

export async function fetchAndDisplayTVL() {
  try {
    const res = await fetch('https://api.sevenseas.capital/tvl')
    const json = await res.json()

    const totalTvlString = json.Response?.total_tvl
    if (!totalTvlString)
      throw new Error(`TVL is NaN – value received: ${totalTvlString}`)

    const abbreviated = formatAbbreviatedNumber(totalTvlString)

    const firstBlock = document.querySelector('.data_block')
    if (firstBlock) {
      const contentEl = firstBlock.querySelector('.data-content')
      if (contentEl) {
        contentEl.textContent = `${abbreviated}`
      }
    }
  } catch (error) {
    console.error('Erreur lors du chargement de la TVL:', error)
  }
}
