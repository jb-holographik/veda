import { gsap } from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// Sélection des éléments
const container = document.querySelector('.widgets-texts')
const texts = container.querySelectorAll('.widgets_text')
const lotties = document.querySelectorAll('.widget')

// Fonction pour mettre à jour l'opacité des textes
function updateTextsOpacity(activeIndex) {
  texts.forEach((text, i) => {
    let opacity = 0
    const distanceFromActive = i - activeIndex

    if (distanceFromActive === 0) opacity = 1
    // Texte actif
    else if (distanceFromActive === 1) opacity = 0.2
    // Premier texte après
    else if (distanceFromActive === 2) opacity = 0.08
    // Deuxième texte après
    else if (distanceFromActive === 3) opacity = 0
    // Troisième texte après
    else opacity = 0 // Tous les autres textes

    gsap.to(text, {
      opacity,
      duration: 0.2,
      overwrite: true,
    })
  })

  // Mettre à jour la visibilité des animations Lottie
  lotties.forEach((lottie, i) => {
    gsap.to(lottie, {
      opacity: i === activeIndex ? 1 : 0,
      duration: 0.2,
      overwrite: true,
    })
  })
}

// Attendre que le DOM soit complètement chargé
document.addEventListener('DOMContentLoaded', () => {
  // Calculer la hauteur d'un seul widgets_text
  const singleTextHeight = texts[0].offsetHeight

  // Appliquer la hauteur totale au container (4x la hauteur d'un texte)
  container.style.height = `${singleTextHeight * 4}px`

  // Reset de la position initiale
  gsap.set(container, {
    y: 0,
  })

  // Initialiser l'opacité des textes avec le premier texte actif
  updateTextsOpacity(0)

  // Créer l'animation de scroll
  ScrollTrigger.create({
    trigger: '.section_widgets',
    start: 'top top',
    end: 'bottom bottom',
    scrub: true,
    onUpdate: (self) => {
      // Calculer l'index actif basé sur le pourcentage de scroll
      const progress = self.progress
      let activeIndex = 0

      if (progress >= 0.75) activeIndex = 3
      else if (progress >= 0.5) activeIndex = 2
      else if (progress >= 0.25) activeIndex = 1

      // Calculer le déplacement vertical
      const yOffset = -singleTextHeight * activeIndex

      // Animer le container de textes
      gsap.to(container, {
        y: yOffset,
        duration: 0.2,
        overwrite: true,
      })

      // Mettre à jour l'opacité des textes
      updateTextsOpacity(activeIndex)
    },
  })
})
