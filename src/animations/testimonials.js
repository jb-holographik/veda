import Swiper from 'swiper'
import { Thumbs } from 'swiper/modules'
import 'swiper/css'

// Activer les modules Swiper nécessaires
Swiper.use([Thumbs])

// Variables globales pour accéder aux instances de Swiper
let mainSwiper, controlsSwiper

window.addEventListener('load', () => {
  initTestimonialSliders()
})

function initTestimonialSliders() {
  const mainSlider = document.querySelector('.testimonials-slider')
  const controlsSlider = document.querySelector('.testimonials-control')

  if (!mainSlider || !controlsSlider) {
    console.warn('Un ou plusieurs éléments du slider sont manquants')
    return
  }

  controlsSwiper = new Swiper(controlsSlider, {
    slidesPerView: 'auto',
    spaceBetween: 16,
    allowTouchMove: false,
    loop: false,
    slideToClickedSlide: false,
  })

  mainSwiper = new Swiper(mainSlider, {
    slidesPerView: 1.5,
    centeredSlides: true,
    loop: true,
    spaceBetween: 32,
    lazyPreloadPrevNext: 2,
    observer: true,
    observeParents: true,
    on: {
      init: () => {
        // S'assurer que les hauteurs sont égales dès l'initialisation
        setTimeout(setEqualTestimonialsHeights, 100)
      },
      slideChange: function () {
        // Mettre à jour les hauteurs après un changement de slide
        setTimeout(setEqualTestimonialsHeights, 100)

        const index = this.realIndex % 3
        const controlSlides = controlsSlider.querySelectorAll('.swiper-slide')

        controlSlides.forEach((slide, i) => {
          slide.classList.toggle('is-active', i === index)
        })
      },
      resize: function () {
        // S'assurer que la hauteur est mise à jour quand Swiper détecte un redimensionnement
        setTimeout(setEqualTestimonialsHeights, 100)
      },
    },
  })

  // Ajout : cliquer sur un contrôle déclenche le slide
  controlsSwiper.slides.forEach((slide, index) => {
    slide.addEventListener('click', () => {
      mainSwiper.slideToLoop(index)
    })
  })
}

// Fonction pour égaliser les hauteurs des cartes témoignages
function setEqualTestimonialsHeights() {
  const cards = document.querySelectorAll('.swiper-slide.testimonial')
  if (!cards.length) return

  // Réinitialiser d'abord toutes les hauteurs à auto
  cards.forEach((card) => {
    card.style.height = 'auto'
  })

  // Calculer la hauteur maximale
  let maxHeight = 0
  cards.forEach((card) => {
    maxHeight = Math.max(maxHeight, card.offsetHeight)
  })

  // Appliquer la hauteur maximale à toutes les cartes
  if (maxHeight > 0) {
    cards.forEach((card) => {
      card.style.height = `${maxHeight}px`
    })
  }

  // Mettre à jour Swiper si l'instance existe
  if (mainSwiper) {
    mainSwiper.update()
  }
}

// Gestionnaire de redimensionnement avec debounce pour optimiser les performances
let resizeTimeout
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout)
  resizeTimeout = setTimeout(() => {
    setEqualTestimonialsHeights()

    // Mettre à jour les instances Swiper si elles existent
    if (mainSwiper) mainSwiper.update()
    if (controlsSwiper) controlsSwiper.update()
  }, 200)
})
