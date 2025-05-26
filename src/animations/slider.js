import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import Swiper from 'swiper'
import { Autoplay } from 'swiper/modules'
import 'swiper/css'

gsap.registerPlugin(ScrollTrigger)

// Créer les références aux sliders
let leftSlider, rightSlider

// Fonction pour gérer les médias (vidéos et Lottie)
function handleMedia(slide, isActive, allowVideoPlay = true) {
  // Gestion des vidéos
  const video = slide.querySelector('video')
  if (video) {
    if (isActive && allowVideoPlay) {
      video.play().catch((err) => console.warn('Erreur lecture vidéo :', err))
    } else {
      video.pause()
      video.currentTime = 0
      // S'assurer que la première frame est visible sur mobile
      video.load()
    }
  }

  // Gestion des Lottie
  const lottie = slide.querySelector('[data-animation-type="lottie"]')
  if (lottie) {
    // S'assurer que l'autoplay est désactivé
    lottie.setAttribute('data-autoplay', '0')
    lottie.setAttribute('data-is-ix2-target', '0')
    lottie.setAttribute('data-autoplay-on-scroll', '0')

    // Attendre que Webflow.require soit disponible
    if (window.Webflow && window.Webflow.require) {
      const lottieInstance = window.Webflow.require('lottie')
        .lottie.getRegisteredAnimations()
        .find((animation) => animation.wrapper === lottie)

      if (lottieInstance) {
        if (isActive) {
          // Pour les slides actifs, on joue l'animation
          lottieInstance.goToAndPlay(0)
        } else {
          // Pour les slides inactifs, on met en pause et on revient au début
          lottieInstance.pause()
          lottieInstance.goToAndStop(0)
        }
      }
    }
  }
}

// Fonction pour ajouter des sources MP4 alternatives aux vidéos WebM
function addFallbackVideoSources() {
  document
    .querySelectorAll('.hero-animation video, .hero-animation-2 video')
    .forEach((video) => {
      // Si la vidéo a déjà une source alternative, on ne fait rien
      if (video.querySelector('source')) return

      const originalSrc = video.getAttribute('src')
      if (!originalSrc) return

      // Ajouter des attributs pour améliorer l'affichage sur mobile
      video.setAttribute('preload', 'metadata')
      video.setAttribute('playsinline', 'true')
      video.setAttribute('muted', 'true')

      // Créer la structure source pour WebM et MP4
      video.removeAttribute('src')

      // Source WebM (originale)
      const sourceWebm = document.createElement('source')
      sourceWebm.setAttribute('src', originalSrc)
      sourceWebm.setAttribute('type', 'video/webm')

      // Source MP4 (alternative) - convertir l'URL de WebM à MP4
      const mp4Src = originalSrc.replace('.webm', '.mp4')
      const sourceMp4 = document.createElement('source')
      sourceMp4.setAttribute('src', mp4Src)
      sourceMp4.setAttribute('type', 'video/mp4')

      // Ajouter les sources à la vidéo
      video.appendChild(sourceWebm)
      video.appendChild(sourceMp4)

      // Forcer le chargement de la première frame
      video.load()

      // Gérer les erreurs de chargement
      video.addEventListener(
        'error',
        function (e) {
          console.warn('Erreur de chargement vidéo:', e)
        },
        true
      )
    })
}

// Désactiver l'autoplay des Lottie dans les hero-animation
function disableAllLottieAutoplay() {
  // Sélectionner uniquement les Lottie dans les hero-animation
  const heroSliders = document.querySelectorAll(
    '.hero-animation, .hero-animation-2'
  )
  heroSliders.forEach((slider) => {
    const lotties = slider.querySelectorAll('[data-animation-type="lottie"]')
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

// Attendre que Webflow soit chargé
window.Webflow = window.Webflow || []
window.Webflow.push(() => {
  // Désactiver l'autoplay de tous les Lottie immédiatement
  disableAllLottieAutoplay()

  // Ajouter des sources MP4 alternatives aux vidéos WebM
  addFallbackVideoSources()

  // hero left row
  leftSlider = new Swiper('.hero-animation', {
    modules: [Autoplay],
    slidesPerView: 3,
    loop: true,
    centeredSlides: true,
    spaceBetween: 32,
    speed: 500,
    allowTouchMove: false,
    autoplay: {
      delay: 3000,
      reverseDirection: true,
      disableOnInteraction: false,
    },
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
    on: {
      beforeInit() {
        // Désactiver l'autoplay des Lottie avant l'initialisation
        disableAllLottieAutoplay()
      },
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
        // Synchroniser le slider droit
        if (rightSlider && !rightSlider.animating) {
          rightSlider.slideNext()
        }
      },
      slideChangeTransitionEnd(swiper) {
        // Gérer tous les médias
        swiper.slides.forEach((slide) => {
          const isActive = slide.classList.contains('swiper-slide-active')
          handleMedia(slide, isActive)
        })
      },
    },
  })

  // hero right row
  rightSlider = new Swiper('.hero-animation-2', {
    modules: [Autoplay],
    slidesPerView: 3,
    loop: true,
    centeredSlides: true,
    spaceBetween: 32,
    allowTouchMove: false,
    speed: 500,
    autoplay: false, // Désactiver l'autoplay car il sera contrôlé par le slider gauche
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
    on: {
      init(swiper) {
        updatePrevSlideOpacity(swiper)
        // S'assurer que tous les médias sont en pause (vidéos ne se lancent jamais)
        swiper.slides.forEach((slide) => {
          handleMedia(slide, false, false)
        })
      },
      slideChangeTransitionStart(swiper) {
        updatePrevSlideOpacity(swiper)
      },
      slideChangeTransitionEnd(swiper) {
        // Gérer tous les médias lors des changements de slides (vidéos restent en pause)
        swiper.slides.forEach((slide) => {
          const isActive = slide.classList.contains('swiper-slide-active')
          handleMedia(slide, isActive, false)
        })
      },
    },
  })
})

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

// Gestionnaire de redimensionnement avec debounce
let resizeTimeout
let lastWindowWidth = window.innerWidth

window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout)
  resizeTimeout = setTimeout(() => {
    // Ne réinitialiser que si la largeur a changé
    if (lastWindowWidth !== window.innerWidth) {
      lastWindowWidth = window.innerWidth

      if (leftSlider && rightSlider) {
        // Sauvegarder les index actuels
        const leftCurrentIndex = leftSlider.activeIndex
        const rightCurrentIndex = rightSlider.activeIndex

        // Détruire et recréer les instances pour une réinitialisation complète
        leftSlider.destroy(true, true)
        rightSlider.destroy(true, true)

        // Réinitialiser les sliders
        leftSlider = new Swiper('.hero-animation', {
          modules: [Autoplay],
          slidesPerView: 3,
          loop: true,
          centeredSlides: true,
          spaceBetween: 32,
          speed: 500,
          autoplay: {
            delay: 3000,
            reverseDirection: true,
            disableOnInteraction: false,
          },
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
          on: {
            init(swiper) {
              updateSlideOpacity(swiper)
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
          initialSlide:
            leftCurrentIndex %
            (leftSlider.slides.length / (leftSlider.params.loop ? 2 : 1)),
        })

        rightSlider = new Swiper('.hero-animation-2', {
          modules: [Autoplay],
          slidesPerView: 3,
          loop: true,
          centeredSlides: true,
          spaceBetween: 32,
          speed: 500,
          autoplay: false,
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
          on: {
            init(swiper) {
              updatePrevSlideOpacity(swiper)
            },
            slideChangeTransitionStart(swiper) {
              updatePrevSlideOpacity(swiper)
            },
          },
          initialSlide:
            rightCurrentIndex %
            (rightSlider.slides.length / (rightSlider.params.loop ? 2 : 1)),
        })
      }
    }
  }, 300)
})

function initMarqueeScrollDirection() {
  document
    .querySelectorAll('[data-marquee-scroll-direction-target]')
    .forEach((marquee) => {
      // Query marquee elements
      const marqueeContent = marquee.querySelector(
        '[data-marquee-collection-target]'
      )
      const marqueeScroll = marquee.querySelector(
        '[data-marquee-scroll-target]'
      )
      if (!marqueeContent || !marqueeScroll) return

      // Get data attributes
      const {
        marqueeSpeed: speed,
        marqueeDuplicate: duplicate,
        marqueeScrollSpeed: scrollSpeed,
      } = marquee.dataset

      // Convert data attributes to usable types
      const marqueeSpeedAttr = parseFloat(speed)
      const duplicateAmount = parseInt(duplicate || 0)
      const scrollSpeedAttr = parseFloat(scrollSpeed)
      const speedMultiplier =
        window.innerWidth < 479 ? 0.25 : window.innerWidth < 991 ? 0.5 : 1

      let marqueeSpeed =
        marqueeSpeedAttr *
        (marqueeContent.offsetWidth / window.innerWidth) *
        speedMultiplier

      // Precompute styles for the scroll container
      marqueeScroll.style.marginLeft = `${scrollSpeedAttr * -1}%`
      marqueeScroll.style.width = `${scrollSpeedAttr * 2 + 100}%`

      // Duplicate marquee content
      if (duplicateAmount > 0) {
        const fragment = document.createDocumentFragment()
        for (let i = 0; i < duplicateAmount; i++) {
          fragment.appendChild(marqueeContent.cloneNode(true))
        }
        marqueeScroll.appendChild(fragment)
      }

      // GSAP animation for marquee content
      const marqueeItems = marquee.querySelectorAll(
        '[data-marquee-collection-target]'
      )

      // Simple animation vers la gauche
      gsap.set(marqueeItems, { xPercent: 0 })
      gsap.to(marqueeItems, {
        xPercent: -100,
        repeat: -1,
        duration: marqueeSpeed,
        ease: 'linear',
      })
    })
}
initMarqueeScrollDirection()
