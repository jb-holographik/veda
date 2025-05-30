import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import Swiper from 'swiper'
import { Autoplay } from 'swiper/modules'
import 'swiper/css'

gsap.registerPlugin(ScrollTrigger)

// Créer les références aux sliders
let leftSlider, rightSlider

function disableAllLottieAutoplay() {
  const marqueeAnimations = document.querySelectorAll(
    '.marquee-animation.is-animated'
  )
  marqueeAnimations.forEach((container) => {
    const lotties = container.querySelectorAll('[data-animation-type="lottie"]')
    lotties.forEach((lottie) => {
      // Désactiver tous les attributs d'autoplay
      lottie.setAttribute('data-autoplay', '0')
      lottie.setAttribute('data-is-ix2-target', '0')
      lottie.setAttribute('data-autoplay-on-scroll', '0')

      if (window.Webflow && window.Webflow.require) {
        const lottieInstance = window.Webflow.require('lottie')
          .lottie.getRegisteredAnimations()
          .find((animation) => animation.wrapper === lottie)

        if (lottieInstance) {
          lottieInstance.pause()
          lottieInstance.goToAndStop(0)
        }
      }
    })
  })
}

window.addEventListener('DOMContentLoaded', () => {
  const videos = Array.from(document.querySelectorAll('video.swiper-video'))
  console.log(`[MediaLoader] ${videos.length} vidéos trouvées`)

  // Trier les vidéos par ordre croissant selon data-load-order
  const sortedVideos = videos
    .filter((v) => v.dataset.loadOrder)
    .sort((a, b) => Number(a.dataset.loadOrder) - Number(b.dataset.loadOrder))

  sortedVideos.forEach((video, index) => {
    const loadOrder = video.dataset.loadOrder || '??'

    if (index < 2) {
      video.setAttribute('preload', 'auto')
      video.load()
      console.log(
        `[MediaLoader] Vidéo ordre ${loadOrder} → preload immédiat (auto)`
      )
    } else {
      // Délai progressif pour étaler les chargements
      const delay = 500 + index * 100

      setTimeout(() => {
        video.setAttribute('preload', 'auto')
        video.load()
        console.log(
          `[MediaLoader] Vidéo ordre ${loadOrder} → preload différé après ${delay}ms`
        )
      }, delay)
    }
  })
})

// Fonction pour gérer la lecture/pause des médias d'un slide
function handleMedia(slide, shouldPlay) {
  const video = slide.querySelector('video')

  if (video) {
    // Ajouter listener canplay une seule fois
    if (!video.dataset.listenerAdded) {
      video.addEventListener(
        'canplay',
        () => {
          video.classList.add('ready') // déclenche le fade-in
        },
        { once: true }
      )

      video.dataset.listenerAdded = 'true'
    }

    if (shouldPlay) {
      video.play().catch((e) => console.log('Erreur lecture vidéo:', e))
    } else {
      video.pause()
      video.currentTime = 0
      video.classList.remove('ready') // remet dans l'état initial
    }
  }

  // Gérer Lottie
  const lottie = slide.querySelector('[data-animation-type="lottie"]')
  if (lottie && window.Webflow && window.Webflow.require) {
    const lottieInstance = window.Webflow.require('lottie')
      .lottie.getRegisteredAnimations()
      .find((animation) => animation.wrapper === lottie)

    if (lottieInstance) {
      if (shouldPlay) {
        lottieInstance.goToAndPlay(0)
      } else {
        lottieInstance.pause()
        lottieInstance.goToAndStop(0)
      }
    }
  }
}

function updateSlideOpacity(swiper) {
  const slides = swiper.slides
  const activeIndex = swiper.realIndex
  const nextIndex = (activeIndex + 1) % swiper.slides.length

  slides.forEach((slide) => {
    const realSlideIndex = Number(slide.dataset.swiperSlideIndex)
    const content = slide.querySelector('.coin-block')

    if (!content) return // sécurité

    if (realSlideIndex === nextIndex) {
      content.style.opacity = '0'
    } else {
      content.style.opacity = '1'
    }
  })
}

function updatePrevSlideOpacity(swiper) {
  const slides = swiper.slides
  const activeIndex = swiper.realIndex
  const prevIndex =
    (activeIndex - 1 + swiper.slides.length) % swiper.slides.length

  slides.forEach((slide) => {
    const realSlideIndex = Number(slide.dataset.swiperSlideIndex)
    const content = slide.querySelector('.coin-block')

    if (!content) return

    if (realSlideIndex === prevIndex) {
      content.style.opacity = '0'
    } else {
      content.style.opacity = '1'
    }
  })
}

// Fonction pour initialiser un slider
function initializeSlider(selector, options) {
  return new Swiper(selector, {
    modules: [Autoplay],
    slidesPerView: 3,
    loop: true,
    centeredSlides: true,
    spaceBetween: 32,
    speed: 800,
    ...options,
    breakpoints: {
      320: {
        direction: 'horizontal',
        slidesPerView: 2.5,
        spaceBetween: 16,
      },
      768: {
        direction: 'horizontal',
        slidesPerView: 3.5,
      },
      992: {
        direction: 'vertical',
        slidesPerView: 3,
      },
    },
  })
}

// Gestionnaire de redimensionnement avec debounce
let resizeTimeout
let lastWindowWidth = window.innerWidth

function reinitializeSliders() {
  if (leftSlider) {
    const leftCurrentIndex = leftSlider.activeIndex
    leftSlider.destroy(true, true)

    leftSlider = initializeSlider('.hero-animation', {
      autoplay: {
        delay: 1600,
        reverseDirection: true,
        disableOnInteraction: false,
      },
      initialSlide: leftCurrentIndex,
      on: {
        init(swiper) {
          updateSlideOpacity(swiper)
          // S'assurer que tous les médias sont en pause
          swiper.slides.forEach((slide) => {
            handleMedia(slide, false)
          })
          // Activer uniquement le média du slide actif
          const activeSlide = swiper.slides[swiper.activeIndex]
          handleMedia(activeSlide, true)
        },
        slideChangeTransitionStart(swiper) {
          updateSlideOpacity(swiper)
          if (rightSlider && !rightSlider.animating) {
            rightSlider.slideNext()
          }
        },
        slideChangeTransitionEnd(swiper) {
          swiper.slides.forEach((slide) => {
            const isActive = slide.classList.contains('swiper-slide-active')
            handleMedia(slide, isActive)
          })
        },
      },
    })
  }

  if (rightSlider) {
    const rightCurrentIndex = rightSlider.activeIndex
    rightSlider.destroy(true, true)

    rightSlider = initializeSlider('.hero-animation-2', {
      autoplay: false,
      initialSlide: rightCurrentIndex,
      on: {
        init(swiper) {
          updatePrevSlideOpacity(swiper)
          // S'assurer que tous les médias sont en pause
          swiper.slides.forEach((slide) => {
            handleMedia(slide, false, false, false)
          })
        },
        slideChangeTransitionStart(swiper) {
          updatePrevSlideOpacity(swiper)
        },
        slideChangeTransitionEnd(swiper) {
          swiper.slides.forEach((slide) => {
            const isActive = slide.classList.contains('swiper-slide-active')
            handleMedia(slide, isActive, false, false)
          })
        },
      },
    })
  }
}

// Attendre que Webflow soit chargé
window.Webflow = window.Webflow || []
window.Webflow.push(() => {
  // Désactiver l'autoplay de tous les Lottie immédiatement
  disableAllLottieAutoplay()

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPositionChecker)
  } else {
    initPositionChecker()
  }
})

// Remplacer l'ancien gestionnaire de redimensionnement
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout)
  resizeTimeout = setTimeout(() => {
    const currentWidth = window.innerWidth
    // Ne réinitialiser que si la largeur a changé
    if (lastWindowWidth !== currentWidth) {
      lastWindowWidth = currentWidth
      reinitializeSliders()
    }
  }, 300)
})

// Fonction pour vérifier la position des slides
function checkSlidesPosition() {
  const container = document.querySelector('.marquee-animation.is-animated')
  if (!container) return

  const slides = container.querySelectorAll(
    '.marquee-animation-row > .is-marquee-slide'
  )

  // Détecter si on est en mode mobile/tablette
  const isMobile = window.innerWidth <= 991
  const viewportDimension = isMobile ? window.innerWidth : window.innerHeight

  // Trouver le slide le plus récent dans la zone d'activation
  let activeSlide = null
  let bestPosition = isMobile ? -Infinity : -Infinity

  slides.forEach((slide) => {
    const slideRect = slide.getBoundingClientRect()

    // Calculer la position relative selon l'orientation
    const slidePosition = isMobile
      ? ((slideRect.left + slideRect.width) / viewportDimension) * 100 // Position horizontale
      : ((slideRect.top + slideRect.height) / viewportDimension) * 100 // Position verticale

    const comparePosition = isMobile ? slideRect.left : slideRect.top

    // Ajuster les seuils selon l'orientation
    const minThreshold = 40
    const maxThreshold = isMobile ? 80 : 75

    if (
      slidePosition >= minThreshold &&
      slidePosition < maxThreshold &&
      comparePosition > bestPosition
    ) {
      bestPosition = comparePosition
      activeSlide = slide
    }
  })

  // Mettre à jour les classes et gérer les médias
  slides.forEach((slide) => {
    if (slide === activeSlide) {
      if (!slide.classList.contains('is-active')) {
        slide.classList.add('is-active')
        handleMedia(slide, true)
      }
    } else {
      if (slide.classList.contains('is-active')) {
        slide.classList.remove('is-active')
        handleMedia(slide, false)
      }
    }
  })

  // Continuer la boucle d'animation
  requestAnimationFrame(checkSlidesPosition)
}

// Démarrer la vérification des positions
function initPositionChecker() {
  // Désactiver l'autoplay de tous les Lottie au démarrage
  disableAllLottieAutoplay()
  // createMarkers()
  checkSlidesPosition()
}
