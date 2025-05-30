import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

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

// Fonction pour initialiser un slider

// Fonction pour recalculer les dimensions des marquee-animations
function recalculateMarqueeAnimations() {
  const marquees = document.querySelectorAll('.marquee-animation')

  marquees.forEach((marquee) => {
    const isMobile = window.innerWidth <= 991
    const container = marquee.querySelector('.marquee-animation-row')
    if (!container) return

    // Réinitialiser les styles pour un nouveau calcul
    container.style.width = ''
    container.style.height = ''

    if (isMobile) {
      // Mode mobile : largeur adaptée au contenu, hauteur 100%
      const slides = container.querySelectorAll('.is-marquee-slide')
      let totalWidth = 0

      slides.forEach((slide) => {
        totalWidth += slide.offsetWidth
        // Ajouter la marge si elle existe
        const margin = parseInt(window.getComputedStyle(slide).marginRight)
        if (!isNaN(margin)) totalWidth += margin
      })

      container.style.width = `${totalWidth}px`
      container.style.height = '100%'
    } else {
      // Mode desktop : largeur 100%, hauteur adaptée au contenu
      container.style.width = '100%'
      const slides = container.querySelectorAll('.is-marquee-slide')
      let totalHeight = 0

      slides.forEach((slide) => {
        totalHeight += slide.offsetHeight
        // Ajouter la marge si elle existe
        const margin = parseInt(window.getComputedStyle(slide).marginBottom)
        if (!isNaN(margin)) totalHeight += margin
      })

      container.style.height = `${totalHeight}px`
    }
  })
}

// Gestionnaire de redimensionnement avec debounce
let resizeTimeout
let lastWindowWidth = window.innerWidth

window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout)
  resizeTimeout = setTimeout(() => {
    const currentWidth = window.innerWidth
    if (lastWindowWidth !== currentWidth) {
      lastWindowWidth = currentWidth
      recalculateMarqueeAnimations()
    }
  }, 300)
})

// Attendre que Webflow soit chargé
window.Webflow = window.Webflow || []
window.Webflow.push(() => {
  // Désactiver l'autoplay de tous les Lottie immédiatement
  disableAllLottieAutoplay()

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initPositionChecker()
      recalculateMarqueeAnimations() // Calcul initial
    })
  } else {
    initPositionChecker()
    recalculateMarqueeAnimations() // Calcul initial
  }
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
