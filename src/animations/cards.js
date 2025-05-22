import Swiper from 'swiper'
import 'swiper/css'

window.addEventListener('load', () => {
  const container = document.querySelector('.cards-slider')

  const swiper = new Swiper(container, {
    slidesPerView: 3,
    spaceBetween: 32,
    navigation: {
      nextEl: container.querySelector('.swiper-button-next'),
      prevEl: container.querySelector('.swiper-button-prev'),
    },
    breakpoints: {
      320: {
        slidesPerView: 1,
        spaceBetween: 16,
      },
      768: {
        slidesPerView: 1,
      },
      992: {
        slidesPerView: 1,
      },
    },
    on: {
      slideChange: () => {
        setTimeout(setEqualCardHeights, 100)
      },
    },
  })
  document
    .querySelector('.swiper-button-next')
    .addEventListener('click', () => {
      swiper.slideNext()
    })

  document
    .querySelector('.swiper-button-prev')
    .addEventListener('click', () => {
      swiper.slidePrev()
    })
})

function setEqualCardHeights() {
  const cards = document.querySelectorAll('.swiper-slide.card')

  if (!cards.length) return

  let maxHeight = 0

  cards.forEach((card) => {
    card.style.height = 'auto'
  })

  cards.forEach((card) => {
    const height = card.offsetHeight
    if (height > maxHeight) maxHeight = height
  })

  cards.forEach((card) => {
    card.style.height = `${maxHeight}px`
  })
}

window.addEventListener('load', setEqualCardHeights)
window.addEventListener('resize', setEqualCardHeights)
