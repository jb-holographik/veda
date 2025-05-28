// Désactiver l'autoplay des Lottie dans les marquee-animation
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

// Fonction pour gérer la lecture/pause des médias d'un slide
function handleSlideMedia(slide, shouldPlay) {
  // Gérer la vidéo si présente
  const video = slide.querySelector('video')
  if (video) {
    if (shouldPlay) {
      video.play().catch((e) => console.log('Erreur lecture vidéo:', e))
    } else {
      video.pause()
      video.currentTime = 0
    }
  }

  // Gérer l'animation Lottie si présente
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

// Créer et ajouter les marqueurs
function createMarkers() {
  // Supprimer les marqueurs existants
  const existingMarkers = document.querySelectorAll('.viewport-marker')
  existingMarkers.forEach((marker) => marker.remove())

  // Créer les marqueurs
  const startMarker = document.createElement('div')
  const endMarker = document.createElement('div')

  // Style commun
  const markerStyle = `
    position: fixed;
    left: 0;
    width: 100%;
    height: 2px;
    background-color: red;
    z-index: 9999;
    pointer-events: none;
  `

  // Configurer le marqueur de début (40%)
  startMarker.className = 'viewport-marker start-marker'
  startMarker.style.cssText = markerStyle
  startMarker.style.top = '40vh'
  startMarker.innerHTML =
    '<span style="position: absolute; left: 10px; top: -10px; background: red; color: white; padding: 2px 5px;">40%</span>'

  // Configurer le marqueur de fin (75%)
  endMarker.className = 'viewport-marker end-marker'
  endMarker.style.cssText = markerStyle
  endMarker.style.top = '75vh'
  endMarker.innerHTML =
    '<span style="position: absolute; left: 10px; top: -10px; background: red; color: white; padding: 2px 5px;">75%</span>'

  // Ajouter les marqueurs au body
  document.body.appendChild(startMarker)
  document.body.appendChild(endMarker)
}

// Fonction pour vérifier la position des slides
function checkSlidesPosition() {
  const container = document.querySelector('.marquee-animation.is-animated')
  if (!container) return

  const slides = container.querySelectorAll(
    '.marquee-animation-row > .is-marquee-slide'
  )
  const viewportHeight = window.innerHeight

  // Trouver le slide le plus récent dans la zone d'activation
  let activeSlide = null
  let bestPosition = -Infinity

  slides.forEach((slide) => {
    const slideRect = slide.getBoundingClientRect()
    const slideBottomPosition =
      ((slideRect.top + slideRect.height) / viewportHeight) * 100

    if (
      slideBottomPosition >= 40 &&
      slideBottomPosition < 75 &&
      slideRect.top > bestPosition
    ) {
      bestPosition = slideRect.top
      activeSlide = slide
    }
  })

  // Mettre à jour les classes et gérer les médias
  slides.forEach((slide) => {
    if (slide === activeSlide) {
      if (!slide.classList.contains('is-active')) {
        slide.classList.add('is-active')
        handleSlideMedia(slide, true)
      }
    } else {
      if (slide.classList.contains('is-active')) {
        slide.classList.remove('is-active')
        handleSlideMedia(slide, false)
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
  createMarkers()
  checkSlidesPosition()
}

// Attendre que Webflow soit chargé pour initialiser
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

// Réinitialiser en cas de redimensionnement
window.addEventListener('resize', () => {
  createMarkers()
  initPositionChecker()
})
