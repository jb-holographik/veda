import { gsap } from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const highlights = document.querySelectorAll('.highlight')
let current = 0
let isAnimating = false

function showHighlight(nextIndex) {
  if (isAnimating) return
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
        // Entrée du nouveau highlight
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
    // Premier affichage ou même highlight
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
  // Initial state
  highlights.forEach((el, i) => {
    if (i === 0) el.classList.add('is-active')
    else el.classList.remove('is-active')
  })
  setInterval(cycleHighlights, 7500)
}

//overlay animation
gsap.to('.selector-overlay', {
  x: '0%', // de -100% à 0%
  ease: 'none',
  scrollTrigger: {
    trigger: '.defi-inner',
    start: 'top top',
    end: 'bottom top',
    scrub: true,
    pin: '.section_defi',
    anticipatePin: 1,
  },
})

//overlay button animation
const cta = document.querySelector('.cta.is-animated')
const shadow = cta.querySelector('.cta-shadow')

// Initial setup (if needed)
gsap.set(shadow, { opacity: 0, width: 0 })

const tl = gsap.timeline({ repeat: -1, repeatDelay: 1 })

// Étape 1 : scale down du bouton
tl.to(cta, {
  scale: 0.8,
  duration: 0.2,
  ease: 'power1.out',
})

  // Étape 2 : opacity à 0.4 (immédiatement après le scale down)
  .to(shadow, {
    opacity: 0.4,
    duration: 0.01,
  })

  // Étape 3 : scale up du bouton + anim du shadow (width + opacity en même temps)
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
  ) // commence en même temps que le scale

  // Étape 4 : reset width à 0 instantanément
  .set(shadow, { width: 0 })
