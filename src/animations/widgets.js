import Swiper from 'swiper'
import 'swiper/css'
import 'swiper/css/effect-fade'
import { Autoplay, EffectFade } from 'swiper/modules'

let widgetsSwiper = null
let widgetsTextSwiper = null

function initWidgetsSwiper() {
  const container = document.querySelector('.visuals')
  console.log('Container widgets-visuals:', container)
  if (!container) return null

  // Détruire l'instance Swiper existante si elle existe
  if (widgetsSwiper) {
    widgetsSwiper.destroy(true, true)
  }

  widgetsSwiper = new Swiper('.visuals', {
    modules: [Autoplay, EffectFade],
    slidesPerView: 1,
    loop: true,
    speed: 800,
    effect: 'fade',
    fadeEffect: {
      crossFade: true,
    },
    autoplay: {
      delay: 2000,
      disableOnInteraction: false,
    },
    allowTouchMove: false,
  })
  return widgetsSwiper
}

function initWidgetsTextSwiper() {
  const container = document.querySelector('.widgets-text-wrapper')
  console.log('Container widgets-text-wrapper:', container)
  if (!container) return null

  // Détruire l'instance Swiper existante si elle existe
  if (widgetsTextSwiper) {
    widgetsTextSwiper.destroy(true, true)
  }

  widgetsTextSwiper = new Swiper('.widgets-text-wrapper', {
    modules: [Autoplay],
    slidesPerView: 3,
    loop: true,
    speed: 800,
    direction: 'vertical',
    autoHeight: false,
    spaceBetween: 0,
    updateOnWindowResize: true,
    observer: true,
    observeParents: true,
    watchSlidesProgress: true,
    autoplay: {
      delay: 2000,
      disableOnInteraction: false,
    },
    allowTouchMove: false,
    on: {
      init: updateOpacity,
      slideChange: updateOpacity,
    },
  })
  return widgetsTextSwiper
}

function updateOpacity(swiper) {
  // Reset all slides opacity first
  swiper.slides.forEach((slide) => {
    slide.style.opacity = '0'
  })

  // Get the active slide and calculate others based on it
  const activeIndex = swiper.activeIndex
  const totalSlides = swiper.slides.length

  // Apply opacities
  for (let i = 0; i < 3; i++) {
    const slideIndex = (activeIndex + i) % totalSlides
    const slide = swiper.slides[slideIndex]

    if (slide) {
      switch (i) {
        case 0:
          slide.style.opacity = '1'
          break
        case 1:
          slide.style.opacity = '0.4'
          break
        case 2:
          slide.style.opacity = '0.2'
          break
      }
    }
  }
}

// Fonction pour réinitialiser les deux sliders
function reinitializeSliders() {
  initWidgetsSwiper()
  initWidgetsTextSwiper()
}

// Initialiser les sliders quand le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
  reinitializeSliders()
})

// Ajouter un gestionnaire de redimensionnement avec debounce
let resizeTimeout
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout)
  resizeTimeout = setTimeout(reinitializeSliders, 250)
})
