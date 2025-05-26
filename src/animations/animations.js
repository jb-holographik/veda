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
  setInterval(cycleHighlights, 7500)
}

// --- OVERLAY ANIMATION ---

let defiInactivityTimeout
let defiIsScrolling = false
let defiIsAutoScrolling = false
let defiTrigger = null

function isPinnedAtTop(rect) {
  // Considérer comme épinglé si la position est à 1px près
  return Math.abs(rect.top) <= 1
}

function startDefiInactivityTimer(trigger) {
  clearTimeout(defiInactivityTimeout)
  const sectionRect = sectionDefi.getBoundingClientRect()
  const pinned = isPinnedAtTop(sectionRect)

  if (!defiIsAutoScrolling && pinned) {
    defiInactivityTimeout = setTimeout(() => {
      const currentRect = sectionDefi.getBoundingClientRect()
      if (
        !defiIsScrolling &&
        isPinnedAtTop(currentRect) &&
        trigger.progress < 1
      ) {
        defiIsAutoScrolling = true
        gsap.to('.selector-overlay', {
          x: '0%',
          duration: 1,
          ease: 'power1.inOut',
          onComplete: () => {
            defiIsAutoScrolling = false
            trigger.scroll(trigger.end)
          },
        })
      }
    }, 4000)
  }
}

function handleDefiScroll() {
  if (!defiIsScrolling) {
    defiIsScrolling = true
    clearTimeout(defiInactivityTimeout)
  }

  clearTimeout(window.scrollTimeout)
  window.scrollTimeout = setTimeout(() => {
    defiIsScrolling = false
    if (
      !defiIsAutoScrolling &&
      defiTrigger &&
      isPinnedAtTop(sectionDefi.getBoundingClientRect())
    ) {
      startDefiInactivityTimer(defiTrigger)
    }
  }, 150)
}

const defiInner = document.querySelector('.defi-inner')
const sectionDefi = document.querySelector('.section_defi')

if (defiInner && sectionDefi) {
  defiTrigger = ScrollTrigger.create({
    trigger: defiInner,
    start: 'top top',
    end: 'bottom top',
    scrub: true,
    pin: sectionDefi,
    anticipatePin: 1,
    markers: false,
    onEnter: (self) => {
      const rect = sectionDefi.getBoundingClientRect()
      window.addEventListener('scroll', handleDefiScroll, { passive: true })
      if (isPinnedAtTop(rect)) {
        startDefiInactivityTimer(self)
      }
    },
    onLeave: () => {
      clearTimeout(defiInactivityTimeout)
      window.removeEventListener('scroll', handleDefiScroll)
    },
    onEnterBack: (self) => {
      const rect = sectionDefi.getBoundingClientRect()
      window.addEventListener('scroll', handleDefiScroll, { passive: true })
      if (isPinnedAtTop(rect)) {
        startDefiInactivityTimer(self)
      }
    },
    onLeaveBack: () => {
      clearTimeout(defiInactivityTimeout)
      window.removeEventListener('scroll', handleDefiScroll)
    },
    onUpdate: (self) => {
      gsap.to('.selector-overlay', {
        x: `${(1 - self.progress) * 100}%`,
        ease: 'none',
        duration: 0.1,
      })

      // Démarrer le timer si la section est épinglée et qu'on n'est pas en train de scroller
      const rect = sectionDefi.getBoundingClientRect()
      if (isPinnedAtTop(rect) && !defiIsScrolling && !defiIsAutoScrolling) {
        startDefiInactivityTimer(self)
      }
    },
  })

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    clearTimeout(defiInactivityTimeout)
    window.removeEventListener('scroll', handleDefiScroll)
  })
}

// --- CTA ANIMATION ---

const cta = document.querySelector('.cta.is-animated')
if (cta) {
  const shadow = cta.querySelector('.cta-shadow')
  gsap.set(shadow, { opacity: 0, width: 0 })

  const tl = gsap.timeline({ repeat: -1, repeatDelay: 1 })

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
}
