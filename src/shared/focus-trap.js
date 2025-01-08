export default function focusTrap (event, container) {
  if (event.key !== 'Tab') {
    return
  }

  const focusableElements = Array.from(container.querySelectorAll('button, a, input, textarea, select, details, [tabindex]:not([tabindex="-1"])'))
  const firstFocusableElement = focusableElements.at(0)
  const lastFocusableElement = focusableElements.at(-1)

  if (!event.shiftKey && event.target === lastFocusableElement) {
    // Tabbing when on the last element.
    firstFocusableElement.focus()
    event.preventDefault()
  } else if (event.shiftKey && event.target === firstFocusableElement) {
    // Reverse tabbing when on the first element.
    lastFocusableElement.focus()
    event.preventDefault()
  }
}
