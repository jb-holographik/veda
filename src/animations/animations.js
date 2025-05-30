import { gsap } from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// --- HIGHLIGHTS ---

const highlights = document.querySelectorAll('.highlight')
let current = 0
let isAnimating = false

document.addEventListener('DOMContentLoaded', () => {
  const burger = document.querySelector('.navbar_burger')
  const navMenu = document.querySelector('.nav-menu')

  burger.addEventListener('click', () => {
    burger.classList.toggle('is-active')
    navMenu.classList.toggle('is-open')
  })
})

function showHighlight(nextIndex) {
  if (!highlights.length || isAnimating) return
  isAnimating = true

  const prevIndex = Array.from(highlights).findIndex((el) =>
    el.classList.contains('is-active')
  )
  const prev = highlights[prevIndex]
  const next = highlights[nextIndex]

  if (prev && prev !== next) {
    gsap.to(prev, {
      y: '-100%',
      opacity: 0,
      duration: 0.6,
      ease: 'power2.in',
      onComplete: () => {
        prev.classList.remove('is-active')
        prev.style.transform = ''
        gsap.fromTo(
          next,
          { y: '100%', opacity: 0 },
          {
            y: '0%',
            opacity: 1,
            duration: 0.6,
            ease: 'power2.out',
            onStart: () => next.classList.add('is-active'),
            onComplete: () => {
              next.style.transform = ''
              isAnimating = false
            },
          }
        )
      },
    })
  } else {
    gsap.fromTo(
      next,
      { y: '100%', opacity: 0 },
      {
        y: '0%',
        opacity: 1,
        duration: 0.6,
        ease: 'power2.out',
        onStart: () => next.classList.add('is-active'),
        onComplete: () => {
          next.style.transform = ''
          isAnimating = false
        },
      }
    )
  }
}

function cycleHighlights() {
  const next = (current + 1) % highlights.length
  showHighlight(next)
  current = next
}

if (highlights.length > 0) {
  highlights.forEach((el, i) => {
    if (i === 0) el.classList.add('is-active')
    else el.classList.remove('is-active')
  })
  setInterval(cycleHighlights, 3000)
}

// --- DEFI ANIMATION ---

const defiInner = document.querySelector('.defi-inner')
const sectionDefi = document.querySelector('.section_defi')
const defiLottie = document.querySelector('.section_defi .selector-animation')

if (defiInner && sectionDefi && defiLottie) {
  // Mettre le lottie en pause au démarrage
  let defiLottieInstance = null

  // Initialiser la position de l'overlay
  const overlay = document.querySelector('.selector-overlay')
  if (overlay) {
    gsap.set(overlay, { x: '100%' })
  }

  // Fonction pour récupérer l'instance Lottie
  const getLottieInstance = () => {
    try {
      if (window.Webflow && window.Webflow.require) {
        const lottieInstances =
          window.Webflow.require('lottie').lottie.getRegisteredAnimations()

        const instance = lottieInstances.find((animation) => {
          return animation.wrapper === defiLottie
        })

        if (instance) {
          return instance
        }
        return null
      }
    } catch {
      return null
    }
    return null
  }

  // Fonction pour initialiser et jouer le Lottie
  const initAndPlayLottie = () => {
    // Réessayer de récupérer l'instance si elle n'a pas été trouvée avant
    if (!defiLottieInstance) {
      defiLottieInstance = getLottieInstance()
    }

    if (defiLottieInstance) {
      // Remettre le Lottie au début avant de le lancer
      defiLottieInstance.goToAndStop(0, true)

      // Supprimer l'ancien listener s'il existe
      defiLottieInstance.removeEventListener('enterFrame')

      // Écouter la progression du Lottie pour déclencher l'overlay avant la fin
      defiLottieInstance.addEventListener('enterFrame', (e) => {
        const frame = e.currentTime
        const totalFrames = defiLottieInstance.totalFrames
        const progress = frame / totalFrames

        // Déclencher l'overlay à 80% de l'animation Lottie
        if (progress >= 0.8 && !window.overlayAnimationStarted) {
          window.overlayAnimationStarted = true
          gsap.to('.selector-overlay', {
            x: '0%',
            duration: 1,
            ease: 'power2.inOut',
            onComplete: () => {
              window.overlayAnimationStarted = false
              // Déclencher l'animation du CTA après l'overlay
              playCTAAnimation()
            },
          })
        }
      })

      defiLottieInstance.play()
    }
  }

  // ScrollTrigger pour lancer le lottie à 20% du viewport
  ScrollTrigger.create({
    trigger: sectionDefi,
    start: 'top 40%',
    end: 'bottom top',
    toggleClass: 'is-visible',
    toggleActions: 'restart none none reset',
    onRefresh: (self) => {
      if (self.isActive) {
        initAndPlayLottie()
      }
    },
    onToggle: (self) => {
      if (self.isActive) {
        initAndPlayLottie()
      } else {
        // Réinitialisation complète quand la section sort du viewport
        if (defiLottieInstance) {
          defiLottieInstance.stop()
          defiLottieInstance.goToAndStop(0, true)
          defiLottieInstance.removeEventListener('enterFrame')
        }
        gsap.set('.selector-overlay', { x: '100%' })
        window.overlayAnimationStarted = false
        ctaAnimationPlayed = false
      }
    },
  })
}

// --- CTA ANIMATION ---

const cta = document.querySelector('.cta.is-animated')
let ctaAnimationPlayed = false

function playCTAAnimation() {
  if (cta && !ctaAnimationPlayed) {
    const shadow = cta.querySelector('.cta-shadow')
    gsap.set(shadow, { opacity: 0, width: 0 })

    const tl = gsap.timeline()

    tl.to(cta, {
      scale: 0.8,
      duration: 0.2,
      ease: 'power1.out',
    })
      .to(shadow, {
        opacity: 0.4,
        duration: 0.01,
      })
      .to(
        cta,
        {
          scale: 1,
          duration: 0.4,
          ease: 'power2.out',
        },
        '>'
      )
      .to(
        shadow,
        {
          width: '100%',
          opacity: 0,
          duration: 0.4,
          ease: 'power2.out',
        },
        '<'
      )
      .set(shadow, { width: 0 })

    ctaAnimationPlayed = true
  }
}
