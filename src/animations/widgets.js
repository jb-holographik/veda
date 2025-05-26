import { gsap } from 'gsap'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import ScrollTrigger from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin)

// Variables globales
let inactivityTimeout
let isScrolling = false
let autoScrolling = false
let hasReachedTop = false

// Fonction pour détecter si on est sur mobile
function isMobile() {
  return (
    window.innerWidth <= 991 ||
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    )
  )
}

function updateWrapperHeight(wrapper, container, texts) {
  if (!wrapper || !container || !texts.length) return
  const singleTextHeight = texts[0].offsetHeight
  wrapper.style.height = `${singleTextHeight * 3}px`
  container.style.height = `${singleTextHeight * 4}px`
}

function updateTextsOpacity(activeIndex, texts, lotties) {
  texts.forEach((text, i) => {
    const distance = i - activeIndex
    let opacity = 0
    if (distance === 0) opacity = 1
    else if (distance === 1) opacity = 0.2
    else if (distance === 2) opacity = 0.08

    gsap.to(text, { opacity, duration: 0.2, overwrite: true })
  })

  lotties.forEach((lottie, i) => {
    gsap.to(lottie, {
      opacity: i === activeIndex ? 1 : 0,
      duration: 0.2,
      overwrite: true,
    })
  })
}

function startAutoScrollAnimation(section) {
  function scrollToNextSection() {
    const trigger = ScrollTrigger.getById('widgets-trigger')
    if (!trigger) return

    const progress = trigger.progress
    let targetProgress

    if (progress < 0.25) targetProgress = 0.25
    else if (progress < 0.5) targetProgress = 0.5
    else if (progress < 0.75) targetProgress = 0.75
    else {
      clearTimeout(inactivityTimeout)
      window.removeEventListener('scroll', handleScroll)
      return
    }

    autoScrolling = true
    const scrollDistance = section.offsetHeight * (targetProgress - progress)
    const currentScroll = window.pageYOffset

    window.scrollTo({
      top: currentScroll + scrollDistance,
      behavior: 'smooth',
    })

    setTimeout(() => {
      autoScrolling = false
      startInactivityTimer()
    }, 1000)
  }

  function startInactivityTimer() {
    clearTimeout(inactivityTimeout)
    if (!autoScrolling) {
      inactivityTimeout = setTimeout(() => {
        if (!isScrolling && hasReachedTop) {
          scrollToNextSection()
        }
      }, 3000)
    }
  }

  function handleScroll() {
    if (!isScrolling) {
      isScrolling = true
      clearTimeout(inactivityTimeout)
    }

    clearTimeout(window.scrollTimeout)
    window.scrollTimeout = setTimeout(() => {
      isScrolling = false
      if (!autoScrolling && hasReachedTop) {
        startInactivityTimer()
      }
    }, 150)
  }

  startInactivityTimer()
  window.addEventListener('scroll', handleScroll, { passive: true })

  window.addEventListener('beforeunload', () => {
    clearTimeout(inactivityTimeout)
    window.removeEventListener('scroll', handleScroll)
  })
}

function initWidgetsAnimation() {
  const container = document.querySelector('.widgets-texts')
  const wrapper = document.querySelector('.widgets-text-wrapper')
  const texts = container?.querySelectorAll('.widgets_text') || []
  const lotties = document.querySelectorAll('.widget')
  const section = document.querySelector('.section_widgets')

  if (!container || !wrapper || !texts.length || !section) return

  updateWrapperHeight(wrapper, container, texts)

  gsap.set(container, { y: 0 })
  texts.forEach((text, i) => {
    gsap.set(text, {
      opacity: i === 0 ? 1 : i === 1 ? 0.2 : i === 2 ? 0.08 : 0,
    })
  })
  lotties.forEach((lottie, i) => {
    gsap.set(lottie, { opacity: i === 0 ? 1 : 0 })
  })

  // Ne créer le ScrollTrigger que sur desktop
  if (!isMobile()) {
    ScrollTrigger.create({
      id: 'widgets-trigger',
      trigger: section,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onEnter: () => {
        hasReachedTop = true
        startAutoScrollAnimation(section, container)
      },
      onLeaveBack: () => {
        hasReachedTop = false
        clearTimeout(inactivityTimeout)
      },
      onUpdate: (self) => {
        if (!self.isActive) return

        const progress = self.progress
        let activeIndex = 0
        if (progress >= 0.75) activeIndex = 3
        else if (progress >= 0.5) activeIndex = 2
        else if (progress >= 0.25) activeIndex = 1

        const singleTextHeight = texts[0].offsetHeight
        const yOffset = -singleTextHeight * activeIndex

        gsap.to(container, {
          y: yOffset,
          duration: 0.2,
          overwrite: true,
        })

        updateTextsOpacity(activeIndex, texts, lotties)
      },
    })
  }

  window.addEventListener('resize', () => {
    updateWrapperHeight(wrapper, container, texts)
    // ScrollTrigger.refresh() // ⚠️ DÉSACTIVÉ POUR ÉVITER LES SAUTS SUR MOBILE
  })
}

document.addEventListener('DOMContentLoaded', initWidgetsAnimation)
