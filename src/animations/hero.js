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
    return
  }

  // Calculer le padding du hero basé sur la hauteur de la nav
  setHeroPaddingFromNav()

  // Gérer l'affichage du hero right sur mobile
  handleHeroRightOnMobile()

  const videos = Array.from(document.querySelectorAll('video.swiper-video'))
  const MAX_CONCURRENT_LOADS = 3
  let concurrentLoads = 0

  function loadVideoWithDelay(video, delay) {
    setTimeout(() => {
      if (concurrentLoads < MAX_CONCURRENT_LOADS) {
        concurrentLoads++
        video.setAttribute('preload', 'auto')
        video.load()

        video.addEventListener(
          'canplaythrough',
          () => {
            concurrentLoads--
          },
          { once: true }
        )
      } else {
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
    } else {
      const delay = 500 + index * 100
      loadVideoWithDelay(video, delay)
    }
  })
})

function handleMedia(slide, shouldPlay) {
  const video = slide.querySelector('video')

  if (video) {
    video.setAttribute('muted', '')
    video.setAttribute('playsinline', '')
    video.setAttribute('webkit-playsinline', '')
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
      const tryPlay = () => {
        video.currentTime = 0
        video.play()
      }

      if (video.readyState >= 3) {
        tryPlay()
      } else {
        const onCanPlay = () => {
          video.removeEventListener('canplaythrough', onCanPlay)
          tryPlay()
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
        // Silently handle error
      }
    }
  }

  const lottie = slide.querySelector('[data-animation-type="lottie"]')
  if (lottie && window.Webflow?.require) {
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

// function recalculateMarqueeAnimations() {
//   const marquees = document.querySelectorAll('.marquee-animation')

//   marquees.forEach((marquee) => {
//     const isMobile = window.innerWidth <= 991
//     const container = marquee.querySelector('.marquee-animation-row')
//     if (!container) return

//     container.style.width = ''
//     container.style.height = ''

//     void container.offsetHeight

//     const slides = container.querySelectorAll('.is-marquee-slide')

//     if (isMobile) {
//       let totalWidth = 0

//       slides.forEach((slide) => {
//         const slideStyle = window.getComputedStyle(slide)
//         const marginRight = parseFloat(slideStyle.marginRight) || 0
//         totalWidth += slide.offsetWidth + marginRight
//       })

//       container.style.width = `${totalWidth}px`
//       container.style.height = '100%'
//     } else {
//       let totalHeight = 0

//       slides.forEach((slide) => {
//         const slideStyle = window.getComputedStyle(slide)
//         const marginBottom = parseFloat(slideStyle.marginBottom) || 0
//         totalHeight += slide.offsetHeight + marginBottom
//       })

//       container.style.height = `${totalHeight}px`
//       container.style.width = '100%'
//     }
//   })
// }

window.addEventListener('orientationchange', () => {
  setTimeout(() => {
    window.location.reload()
  }, 50)
})

let resizeTimeout
let wasDesktop = window.innerWidth > 991

window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout)
  resizeTimeout = setTimeout(() => {
    const currentWidth = window.innerWidth
    const isNowDesktop = currentWidth > 991

    if (wasDesktop !== isNowDesktop) {
      window.location.reload()
      return
    }

    // Recalculer le padding du hero lors des redimensionnements
    setHeroPaddingFromNav()

    // Gérer l'affichage du hero right lors des redimensionnements
    handleHeroRightOnMobile()

    wasDesktop = isNowDesktop
  }, 300)
})

window.Webflow = window.Webflow || []
window.Webflow.push(() => {
  disableAllLottieAutoplay()

  // Calculer le padding du hero une fois Webflow initialisé
  setHeroPaddingFromNav()

  // Gérer l'affichage du hero right une fois Webflow initialisé
  handleHeroRightOnMobile()

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initPositionChecker()
      // recalculateMarqueeAnimations()
    })
  } else {
    initPositionChecker()
    // recalculateMarqueeAnimations()
  }
})

function checkSlidesPosition() {
  const container = document.querySelector('.marquee-animation.is-animated')
  if (!container) return

  const slides = container.querySelectorAll(
    '.marquee-animation-row > .is-marquee-slide'
  )

  const isMobile = window.innerWidth <= 991
  const viewportDimension = isMobile ? window.innerWidth : window.innerHeight

  let activeSlide = null
  let bestPosition = isMobile ? -Infinity : -Infinity

  slides.forEach((slide) => {
    const slideRect = slide.getBoundingClientRect()

    const slidePosition = isMobile
      ? ((slideRect.left + slideRect.width) / viewportDimension) * 100
      : ((slideRect.top + slideRect.height) / viewportDimension) * 100

    const comparePosition = isMobile ? slideRect.left : slideRect.top

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

  requestAnimationFrame(checkSlidesPosition)
}

function initPositionChecker() {
  disableAllLottieAutoplay()
  checkSlidesPosition()
}

function setHeroPaddingFromNav() {
  const nav = document.querySelector('.nav')
  const heroSection = document.querySelector('.section_hero')

  if (!nav || !heroSection) return

  // Obtenir la hauteur de la nav en pixels
  const navHeight = nav.offsetHeight

  // Convertir en rem (en assumant que 1rem = 16px par défaut)
  const rootFontSize =
    parseFloat(getComputedStyle(document.documentElement).fontSize) || 16
  const navHeightInRem = navHeight / rootFontSize

  // Appliquer le padding-top à la section hero
  heroSection.style.paddingTop = `${navHeightInRem}rem`
}

function handleHeroRightOnMobile() {
  const heroRight = document.querySelector('.hero-content_right')
  if (!heroRight) return

  // Détecter uniquement mobile en mode portrait (largeur <= 767px)
  const isMobilePortrait = window.innerWidth <= 767

  if (isMobilePortrait) {
    // Cacher l'élément sur mobile portrait uniquement
    heroRight.style.display = 'none'

    // Désactiver toutes les animations dans hero-content_right
    const videos = heroRight.querySelectorAll('video')
    videos.forEach((video) => {
      video.pause()
      video.currentTime = 0
    })

    const lotties = heroRight.querySelectorAll('[data-animation-type="lottie"]')
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
  } else {
    // Réafficher l'élément sur tablette et desktop
    heroRight.style.display = ''
  }
}
