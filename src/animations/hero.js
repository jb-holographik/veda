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

function isSafariDesktop() {
  const ua = navigator.userAgent
  const isSafari = /^((?!chrome|android).)*safari/i.test(ua)
  const isMobile = /iPhone|iPad|iPod|Android/i.test(ua)
  return isSafari && !isMobile
}

window.addEventListener('DOMContentLoaded', () => {
  if (isSafariDesktop()) {
    console.log(
      '[MediaLoader] Safari desktop détecté → pas de gestion du preload'
    )
    return
  }

  const videos = Array.from(document.querySelectorAll('video.swiper-video'))
  console.log(`[MediaLoader] ${videos.length} vidéos trouvées`)

  const MAX_CONCURRENT_LOADS = 3
  let concurrentLoads = 0

  function loadVideoWithDelay(video, delay) {
    setTimeout(() => {
      if (concurrentLoads < MAX_CONCURRENT_LOADS) {
        concurrentLoads++
        video.setAttribute('preload', 'auto')
        video.load()
        console.log(
          `[MediaLoader] Vidéo ordre ${video.dataset.loadOrder} → preload lancé`
        )

        video.addEventListener(
          'canplaythrough',
          () => {
            concurrentLoads--
            console.log(
              `[MediaLoader] Vidéo ordre ${video.dataset.loadOrder} → preload terminé`
            )
          },
          { once: true }
        )
      } else {
        console.log(
          `[MediaLoader] Vidéo ordre ${video.dataset.loadOrder} en attente (trop de chargements)`
        )
        loadVideoWithDelay(video, delay + 300)
      }
    }, delay)
  }

  const sortedVideos = videos
    .filter((v) => v.dataset.loadOrder)
    .sort((a, b) => Number(a.dataset.loadOrder) - Number(b.dataset.loadOrder))

  sortedVideos.forEach((video, index) => {
    const loadOrder = Number(video.dataset.loadOrder || 0)
    if (loadOrder === 1 || loadOrder === 2) {
      video.setAttribute('preload', 'auto')
      video.load()
      console.log(
        `[MediaLoader] Vidéo ordre ${loadOrder} → preload immédiat (prioritaire)`
      )
    } else {
      const delay = 500 + index * 100
      loadVideoWithDelay(video, delay)
    }
  })
})

function handleMedia(slide, shouldPlay) {
  const video = slide.querySelector('video')

  if (video) {
    video.setAttribute('playsinline', '')
    video.setAttribute('webkit-playsinline', '')
    video.setAttribute('muted', '')
    video.muted = true
    video.defaultMuted = true
    video.volume = 0

    if (!video.dataset.listenerAdded) {
      video.addEventListener(
        'canplay',
        () => {
          video.classList.add('ready')
        },
        { once: true }
      )
      video.dataset.listenerAdded = 'true'
    }

    if (shouldPlay) {
      if (video.readyState >= 3) {
        video.currentTime = 0
        video.play().catch((e) => console.warn('Erreur lecture (ready):', e))
      } else {
        const onCanPlay = () => {
          video.removeEventListener('canplaythrough', onCanPlay)
          video.currentTime = 0
          video
            .play()
            .catch((e) => console.warn('Erreur lecture (canplaythrough):', e))
        }
        video.addEventListener('canplaythrough', onCanPlay, { once: true })
        video.load()
      }
    } else {
      try {
        video.pause()
        video.currentTime = 0
        video.classList.remove('ready')
      } catch (e) {
        console.warn('Erreur arrêt vidéo:', e)
      }
    }
  }

  const lottie = slide.querySelector('[data-animation-type="lottie"]')
  if (lottie && window.Webflow?.require) {
    const lottieInstance = window.Webflow.require('lottie')
      .lottie.getRegisteredAnimations()
      .find((animation) => animation.wrapper === lottie)

    if (lottieInstance) {
      shouldPlay
        ? lottieInstance.goToAndPlay(0)
        : (lottieInstance.pause(), lottieInstance.goToAndStop(0))
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

    // Réinitialiser les styles
    container.style.width = ''
    container.style.height = ''

    // Force un reflow pour fiabiliser les dimensions
    void container.offsetHeight

    const slides = container.querySelectorAll('.is-marquee-slide')

    if (isMobile) {
      // Mode mobile (horizontal)
      let totalWidth = 0

      slides.forEach((slide) => {
        const slideStyle = window.getComputedStyle(slide)
        const marginRight = parseFloat(slideStyle.marginRight) || 0
        totalWidth += slide.offsetWidth + marginRight
      })

      container.style.width = `${totalWidth}px`
      container.style.height = '100%'
      console.log(`[Marquee] Mobile: largeur recalculée → ${totalWidth}px`)
    } else {
      // Mode desktop (vertical)
      let totalHeight = 0

      slides.forEach((slide) => {
        const slideStyle = window.getComputedStyle(slide)
        const marginBottom = parseFloat(slideStyle.marginBottom) || 0
        totalHeight += slide.offsetHeight + marginBottom
      })

      container.style.height = `${totalHeight}px`
      container.style.width = '100%'
      console.log(`[Marquee] Desktop: hauteur recalculée → ${totalHeight}px`)
    }
  })
}

// Recharger la page lors d'un changement d'orientation
window.addEventListener('orientationchange', () => {
  // Attendre que le changement d'orientation soit terminé
  setTimeout(() => {
    console.log('[Marquee] Rechargement après changement orientation')
    window.location.reload()
  }, 50)
})

// Gestionnaire de redimensionnement avec debounce
let resizeTimeout
let wasDesktop = window.innerWidth > 991

window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout)
  resizeTimeout = setTimeout(() => {
    const currentWidth = window.innerWidth
    const isNowDesktop = currentWidth > 991

    // Détecter le changement de breakpoint desktop/tablette
    if (wasDesktop !== isNowDesktop) {
      console.log(
        '[Marquee] Changement desktop/tablette détecté, rechargement...'
      )
      window.location.reload()
      return
    }

    // Mise à jour pour la prochaine vérification
    wasDesktop = isNowDesktop
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
