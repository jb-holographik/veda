import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

function initWidgetsScrollAnimation() {
  const widgetsWrapper = document.querySelector('.section_widgets')
  if (!widgetsWrapper) return

  const widgetVisuals = document.querySelectorAll('.widget-visual')
  const widgetTexts = document.querySelectorAll('.is-widget-text')

  if (widgetVisuals.length < 4 || widgetTexts.length < 4) return

  // Fonction pour gérer l'état des widgets selon le pourcentage
  function updateWidgetState(progress) {
    // Réinitialiser tous les états
    widgetVisuals.forEach((visual) => {
      visual.classList.remove('is-active')
    })
    widgetTexts.forEach((text) => {
      text.classList.remove('is-active')
      text.classList.remove('is-o-8')
    })

    // Déterminer quel widget doit être actif selon la progression
    let activeIndex = 0
    if (progress >= 0.75) {
      activeIndex = 3
    } else if (progress >= 0.5) {
      activeIndex = 2
    } else if (progress >= 0.25) {
      activeIndex = 1
    }

    // Activer le widget correspondant
    widgetVisuals[activeIndex].classList.add('is-active')
    widgetTexts[activeIndex].classList.add('is-active')

    // Gérer les classes is-o-8 selon la progression
    if (progress < 0.5) {
      widgetTexts[3].classList.add('is-o-8')
    }
    if (progress >= 0.5) {
      widgetTexts[0].classList.add('is-o-8')
    }
    if (progress >= 0.75) {
      widgetTexts[1].classList.add('is-o-8')
      // Supprimer is-o-8 du 4ème texte s'il l'avait
      widgetTexts[3].classList.remove('is-o-8')
    }
  }

  // Initialiser l'état de départ
  updateWidgetState(0)

  // ScrollTrigger pour contrôler l'animation avec le scroll
  ScrollTrigger.create({
    trigger: widgetsWrapper,
    start: 'top center',
    end: 'bottom center',
    scrub: 1,
    onUpdate: (self) => {
      updateWidgetState(self.progress)
    },
  })
}

// Initialiser l'animation de scroll
initWidgetsScrollAnimation()
