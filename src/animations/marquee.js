import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

function initMarqueeScrollDirection() {
  document
    .querySelectorAll('[data-marquee-scroll-direction-target]')
    .forEach((marquee) => {
      // Query marquee elements - gérer plusieurs marquees dans le même conteneur
      const marqueeContents = marquee.querySelectorAll(
        '[data-marquee-collection-target]'
      )
      const marqueeScrolls = marquee.querySelectorAll(
        '[data-marquee-scroll-target]'
      )

      if (!marqueeContents.length || !marqueeScrolls.length) return

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

      // Traiter chaque marquee (premier et deuxième)
      marqueeContents.forEach((marqueeContent, index) => {
        const marqueeScroll = marqueeScrolls[index]
        if (!marqueeScroll) return

        let marqueeSpeed =
          marqueeSpeedAttr *
          (marqueeContent.offsetWidth / window.innerWidth) *
          speedMultiplier

        // Precompute styles for the scroll container
        marqueeScroll.style.marginLeft = `${scrollSpeedAttr * -1}%`
        marqueeScroll.style.width = `${scrollSpeedAttr * 2 + 100}%`

        // Identifier le deuxième marquee par sa classe .is-2
        const isSecondMarquee = marqueeContent
          .closest('.logos-marquee')
          ?.classList.contains('is-2')

        // Duplicate marquee content
        if (duplicateAmount > 0) {
          const fragment = document.createDocumentFragment()
          for (let i = 0; i < duplicateAmount; i++) {
            fragment.appendChild(marqueeContent.cloneNode(true))
          }

          // Pour le deuxième marquee (qui va vers la droite), ajouter les duplicatas à gauche
          if (isSecondMarquee) {
            marqueeScroll.insertBefore(fragment, marqueeContent)
          } else {
            marqueeScroll.appendChild(fragment)
          }
        }

        // GSAP animation for marquee content
        const marqueeItems = marqueeScroll.querySelectorAll(
          '[data-marquee-collection-target]'
        )

        if (isSecondMarquee) {
          // Pour le deuxième marquee (qui va vers la droite)
          // Même durée pour la même vitesse visuelle
          gsap.set(marqueeItems, { xPercent: -100 })
          gsap.to(marqueeItems, {
            xPercent: 0,
            repeat: -1,
            duration: marqueeSpeed,
            ease: 'linear',
          })
        } else {
          // Pour le premier marquee (qui va vers la gauche)
          gsap.set(marqueeItems, { xPercent: 0 })
          gsap.to(marqueeItems, {
            xPercent: -100,
            repeat: -1,
            duration: marqueeSpeed,
            ease: 'linear',
          })
        }
      })
    })
}
initMarqueeScrollDirection()
