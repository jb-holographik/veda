import Swiper from 'swiper'
import 'swiper/css'

window.addEventListener('load', () => {
  const container = document.querySelector('.cards-slider')
  if (!container) return // ✅ Sécurité si l'élément n'existe pas

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
        slidesPerView: 3,
      },
    },
    on: {
      slideChange: () => {
        setTimeout(setEqualCardHeights, 100)
      },
    },
  })

  const nextBtn = container.querySelector('.swiper-button-next')
  const prevBtn = container.querySelector('.swiper-button-prev')

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      swiper.slideNext()
    })
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      swiper.slidePrev()
    })
  }

  setEqualCardHeights()
  window.addEventListener('resize', setEqualCardHeights)
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
