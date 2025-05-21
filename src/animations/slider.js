import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import Swiper from 'swiper'
import { Autoplay } from 'swiper/modules'
import 'swiper/css'

gsap.registerPlugin(ScrollTrigger)

// Créer les références aux sliders
let leftSlider, rightSlider

// Détecter si le navigateur est Firefox
const isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1

// Fonction pour gérer les médias (vidéos et Lottie)
function handleMedia(slide, isActive) {
  // Gestion des vidéos
  const video = slide.querySelector('video')
  if (video) {
    if (isActive) {
      video.play().catch((err) => {
        console.warn('Erreur lecture vidéo :', err)
        // Si on est sur Firefox et que la lecture échoue, remplacer par une image
        if (isFirefox && video.style.display !== 'none') {
          tryReplaceVideoWithImage(video)
        }
      })
    } else {
      video.pause()
      video.currentTime = 0
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

// Remplacer une vidéo qui ne fonctionne pas par une image
function tryReplaceVideoWithImage(video) {
  // Masquer la vidéo problématique
  video.style.display = 'none'

  // Créer une image de remplacement
  const img = document.createElement('img')

  // Essayer différentes stratégies pour trouver une image
  if (video.poster) {
    img.src = video.poster
  } else if (video.querySelector('source')) {
    const sourceUrl = video.querySelector('source').src
    img.src = sourceUrl
      .replace(/\.(webm|mp4)(\?.*)?$/, '.jpg$2')
      .replace('/video/', '/image/')
  } else {
    // Image placeholder en cas d'échec
    img.src =
      'data:image/svg+xml;charset=utf-8,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 viewBox%3D%220 0 1 1%22%3E%3C%2Fsvg%3E'
  }

  // Appliquer des styles pour que l'image ressemble à la vidéo
  img.alt = 'Media content'
  img.style.width = '100%'
  img.style.height = '100%'
  img.style.objectFit = 'cover'
  img.style.position = video.style.position || 'relative'

  // Ajouter l'image juste après la vidéo
  video.parentNode.insertBefore(img, video.nextSibling)
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

      // Si Webflow est disponible, arrêter l'animation
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
  // Désactiver l'autoplay des Lottie dans les hero-animation
  disableAllLottieAutoplay()

  // hero left row
  leftSlider = new Swiper('.hero-animation', {
    modules: [Autoplay],
    direction: 'vertical',
    effect: 'slide',
    slidesPerView: 3,
    loop: true,
    centeredSlides: true,
    spaceBetween: 32,
    autoplay: {
      delay: 4000,
      reverseDirection: true,
      disableOnInteraction: false,
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
    direction: 'vertical',
    effect: 'slide',
    slidesPerView: 3,
    loop: true,
    centeredSlides: true,
    spaceBetween: 32,
    autoplay: false, // Désactiver l'autoplay car il sera contrôlé par le slider gauche
    on: {
      init(swiper) {
        updatePrevSlideOpacity(swiper)
        // S'assurer que tous les médias sont en pause
        swiper.slides.forEach((slide) => {
          handleMedia(slide, false)
        })
      },
      slideChangeTransitionStart(swiper) {
        updatePrevSlideOpacity(swiper)
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

// Gestionnaire de redimensionnement
window.addEventListener('resize', () => {
  if (leftSlider && rightSlider) {
    leftSlider.update()
    rightSlider.update()
  }
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
        marqueeDirection: direction,
        marqueeDuplicate: duplicate,
        marqueeScrollSpeed: scrollSpeed,
      } = marquee.dataset

      // Convert data attributes to usable types
      const marqueeSpeedAttr = parseFloat(speed)
      const marqueeDirectionAttr = direction === 'right' ? 1 : -1 // 1 for right, -1 for left
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
      const animation = gsap
        .to(marqueeItems, {
          xPercent: -100, // Move completely out of view
          repeat: -1,
          duration: marqueeSpeed,
          ease: 'linear',
        })
        .totalProgress(0.5)

      // Initialize marquee in the correct direction
      gsap.set(marqueeItems, {
        xPercent: marqueeDirectionAttr === 1 ? 100 : -100,
      })
      animation.timeScale(marqueeDirectionAttr) // Set correct direction
      animation.play() // Start animation immediately

      // Set initial marquee status
      marquee.setAttribute('data-marquee-status', 'normal')

      // ScrollTrigger logic for direction inversion
      ScrollTrigger.create({
        trigger: marquee,
        start: 'top bottom',
        end: 'bottom top',
        onUpdate: (self) => {
          const isInverted = self.direction === 1 // Scrolling down
          const currentDirection = isInverted
            ? -marqueeDirectionAttr
            : marqueeDirectionAttr

          // Update animation direction and marquee status
          animation.timeScale(currentDirection)
          marquee.setAttribute(
            'data-marquee-status',
            isInverted ? 'normal' : 'inverted'
          )
        },
      })

      // Extra speed effect on scroll
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: marquee,
          start: '0% 100%',
          end: '100% 0%',
          scrub: 0,
        },
      })

      const scrollStart =
        marqueeDirectionAttr === -1 ? scrollSpeedAttr : -scrollSpeedAttr
      const scrollEnd = -scrollStart

      tl.fromTo(
        marqueeScroll,
        { x: `${scrollStart}vw` },
        { x: `${scrollEnd}vw`, ease: 'none' }
      )
    })
}
initMarqueeScrollDirection()
