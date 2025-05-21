import './styles/style.css'
import './animations/slider.js'
import './animations/animations.js'
import './animations/widgets.js'
import './animations/cards.js'
import './animations/testimonials.js'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger)

import { fetchAndDisplayTVL } from './utils/data.js'
fetchAndDisplayTVL()

const lenis = new Lenis({
  duration: 0.5,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // alternative à 'ease-in-out'
  lerp: 0.05,
  smoothWheel: true,
  touchMultiplier: 2,
})

lenis.on('scroll', ScrollTrigger.update)

gsap.ticker.add((time) => {
  lenis.raf(time * 1000)
})

gsap.ticker.lagSmoothing(0)

// Optionnel : scroll to top
// lenis.scrollTo(0)

export default lenis
