import './styles/style.css'
import './animations/hero.js'
// import './animations/slider.js'
import './animations/marquee.js'
import './animations/animations.js'
import './animations/widgets.js'
import './animations/cards.js'
import './animations/testimonials.js'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger)

// Désactiver l'autoplay des Lottie dans les hero-animation avant l'initialisation de Webflow
document.addEventListener(
  'DOMContentLoaded',
  () => {
    // Sélectionner uniquement les Lottie dans les hero-animation
    const heroSliders = document.querySelectorAll(
      '.hero-animation, .hero-animation-2'
    )
    heroSliders.forEach((slider) => {
      const lotties = slider.querySelectorAll('[data-animation-type="lottie"]')
      lotties.forEach((lottie) => {
        lottie.setAttribute('data-autoplay', '0')
        lottie.setAttribute('data-is-ix2-target', '0')
        lottie.setAttribute('data-autoplay-on-scroll', '0')
      })
    })
  },
  { once: true }
)

import { fetchAndDisplayTVL } from './utils/data.js'
fetchAndDisplayTVL()

const lenis = new Lenis({
  duration: 0.5,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // alternative à 'ease-in-out'
  lerp: 0.05,
  smoothWheel: true,
  touchMultiplier: 0,
})

lenis.on('scroll', ScrollTrigger.update)

gsap.ticker.add((time) => {
  lenis.raf(time * 1000)
})

gsap.ticker.lagSmoothing(0)

// Gestionnaire de redimensionnement
window.addEventListener('resize', () => {
  lenis.resize()
  // ScrollTrigger.refresh() // ⚠️ TEMPORAIREMENT DÉSACTIVÉ POUR TEST
})

// Observer les changements de hauteur du contenu
const resizeObserver = new ResizeObserver(() => {
  lenis.resize()
  // ScrollTrigger.refresh() // ⚠️ TEMPORAIREMENT DÉSACTIVÉ POUR TEST
})

// Observer le body pour les changements de hauteur
resizeObserver.observe(document.body)

// Optionnel : scroll to top
// lenis.scrollTo(0)

export default lenis
