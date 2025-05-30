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
function handleSlideMedia(slide, shouldPlay) {
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
      video.classList.remove('ready') // remet dans l’état initial
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

// Créer et ajouter les marqueurs
// function createMarkers() {
//   // Supprimer les marqueurs existants
//   const existingMarkers = document.querySelectorAll('.viewport-marker')
//   existingMarkers.forEach((marker) => marker.remove())

//   // Créer les marqueurs
//   const startMarker = document.createElement('div')
//   const endMarker = document.createElement('div')

//   // Style commun de base
//   const markerStyle = `
//     position: fixed;
//     background-color: red;
//     z-index: 9999;
//     pointer-events: none;
//   `

//   // Adapter les marqueurs selon la taille d'écran
//   if (window.innerWidth <= 991) {
//     // Version mobile/tablette (marqueurs verticaux)
//     startMarker.style.cssText = `
//       ${markerStyle}
//       top: 0;
//       left: 40vw;
//       width: 2px;
//       height: 100%;
//     `

//     endMarker.style.cssText = `
//       ${markerStyle}
//       top: 0;
//       left: 80vw;
//       width: 2px;
//       height: 100%;
//     `

//     startMarker.innerHTML =
//       '<span style="position: absolute; left: 10px; top: 10px; background: red; color: white; padding: 2px 5px;">40%</span>'
//     endMarker.innerHTML =
//       '<span style="position: absolute; left: 10px; top: 10px; background: red; color: white; padding: 2px 5px;">80%</span>'
//   } else {
//     // Version desktop (marqueurs horizontaux)
//     startMarker.style.cssText = `
//       ${markerStyle}
//       left: 0;
//       top: 40vh;
//       width: 100%;
//       height: 2px;
//     `

//     endMarker.style.cssText = `
//       ${markerStyle}
//       left: 0;
//       top: 75vh;
//       width: 100%;
//       height: 2px;
//     `

//     startMarker.innerHTML =
//       '<span style="position: absolute; left: 10px; top: -10px; background: red; color: white; padding: 2px 5px;">40%</span>'
//     endMarker.innerHTML =
//       '<span style="position: absolute; left: 10px; top: -10px; background: red; color: white; padding: 2px 5px;">75%</span>'
//   }

//   startMarker.className = 'viewport-marker start-marker'
//   endMarker.className = 'viewport-marker end-marker'

//   // Ajouter les marqueurs au body
//   document.body.appendChild(startMarker)
//   document.body.appendChild(endMarker)
// }

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
  // createMarkers()
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
  // createMarkers()
  initPositionChecker()
})
