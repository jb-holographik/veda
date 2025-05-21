import Swiper from 'swiper'
import { Thumbs } from 'swiper/modules'
import 'swiper/css'

// Activer les modules Swiper nécessaires
Swiper.use([Thumbs])

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

  const controlsSwiper = new Swiper(controlsSlider, {
    slidesPerView: 'auto',
    spaceBetween: 16,
    allowTouchMove: false,
    loop: false,
    slideToClickedSlide: false,
  })

  const mainSwiper = new Swiper(mainSlider, {
    slidesPerView: 1.5,
    centeredSlides: true,
    loop: true,
    spaceBetween: 32,
    lazyPreloadPrevNext: 2,
    observer: true,
    observeParents: true,
    on: {
      init: () => setEqualTestimonialsHeights(),
      slideChange: function () {
        setTimeout(setEqualTestimonialsHeights, 100)

        const index = this.realIndex % 3
        const controlSlides = controlsSlider.querySelectorAll('.swiper-slide')

        controlSlides.forEach((slide, i) => {
          slide.classList.toggle('is-active', i === index)
        })
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

function setEqualTestimonialsHeights() {
  const cards = document.querySelectorAll('.swiper-slide.testimonial')
  if (!cards.length) return

  let maxHeight = 0
  cards.forEach((card) => {
    card.style.height = 'auto'
    maxHeight = Math.max(maxHeight, card.offsetHeight)
  })

  cards.forEach((card) => {
    card.style.height = `${maxHeight}px`
  })
}

window.addEventListener('resize', setEqualTestimonialsHeights)
