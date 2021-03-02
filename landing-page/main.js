import './src/tutorial.js'
import './src/landing-page.js'

document.querySelector('[learn-more-button]').addEventListener('click', () => {
  document.querySelector('[learn-more-button-target]').scrollIntoView({ behavior: 'smooth' })
})
