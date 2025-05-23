import Swiper from 'swiper'
import { Thumbs } from 'swiper/modules'
import 'swiper/css'

// Activer les modules nécessaires
Swiper.use([Thumbs])

let mainSwiper, controlsSwiper

function initTestimonialSliders(mainSlider, controlsSlider) {
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
        setTimeout(setEqualTestimonialsHeights, 100)
      },
      slideChange: function () {
        setTimeout(setEqualTestimonialsHeights, 100)

        const index = this.realIndex % 3
        const controlSlides = controlsSlider.querySelectorAll('.swiper-slide')
        controlSlides.forEach((slide, i) => {
          slide.classList.toggle('is-active', i === index)
        })
      },
      resize: () => {
        setTimeout(setEqualTestimonialsHeights, 100)
      },
    },
  })

  controlsSwiper.slides.forEach((slide, index) => {
    slide.addEventListener('click', () => {
      mainSwiper.slideToLoop(index)
    })
  })
}

function setEqualTestimonialsHeights() {
  const cards = document.querySelectorAll('.swiper-slide.testimonial')
  if (!cards.length) return

  cards.forEach((card) => {
    card.style.height = 'auto'
  })

  let maxHeight = 0
  cards.forEach((card) => {
    maxHeight = Math.max(maxHeight, card.offsetHeight)
  })

  if (maxHeight > 0) {
    cards.forEach((card) => {
      card.style.height = `${maxHeight}px`
    })
  }

  if (mainSwiper) mainSwiper.update()
}

// ⚠️ Initialisation différée : attendre que les sliders soient visibles
function waitForSlidersToBeVisible() {
  const mainSlider = document.querySelector('.testimonials-slider')
  const controlsSlider = document.querySelector('.testimonials-control')

  if (
    mainSlider &&
    controlsSlider &&
    mainSlider.offsetParent !== null &&
    controlsSlider.offsetParent !== null
  ) {
    initTestimonialSliders(mainSlider, controlsSlider)
  } else {
    setTimeout(waitForSlidersToBeVisible, 300)
  }
}

window.addEventListener('load', waitForSlidersToBeVisible)

// Redimensionnement optimisé
let resizeTimeout
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout)
  resizeTimeout = setTimeout(() => {
    setEqualTestimonialsHeights()
    if (mainSwiper) mainSwiper.update()
    if (controlsSwiper) controlsSwiper.update()
  }, 200)
})
