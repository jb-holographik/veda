import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

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
