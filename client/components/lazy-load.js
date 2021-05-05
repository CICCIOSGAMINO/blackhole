import { AsyncDirective, directive } from 'lit/async-directive.js'

class LazyLoad extends AsyncDirective {
  update (part, [importPromise, value]) {
    // signal the pending work to PendingContainer
    const ce = new CustomEvent('pending-state', {
      composed: false,
      bubbles: true,
      detail: {
        promise: importPromise
      }
    })

    part.parentNode.dispatchEvent(ce)

    importPromise.then(module => {
      // module imported
      this.setValue(value)
    })
  }
}

export const lazyLoad = directive(LazyLoad)
