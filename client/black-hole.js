import { LitElement, html, css } from 'lit'

/* components */
import { PendingContainer } from './components/pending-container'
import { lazyLoad } from './components/lazy-load'
import { BlkPeers } from './components/blk-peers'
import { NoPeers } from './components/no-peers'
import { BlkMessage } from './components/blk-message'
import { BlkFooter } from './components/blk-footer'
import { BlkDialog } from './components/blk-dialog'
import { BlkToast } from './components/blk-toast'
import { BlkAbout } from './components/blk-about'

/* Js Class */
import { ServerConnection } from './components/server-connection'

/* Material */
import '@material/mwc-icon'
import '@material/mwc-icon-button'
import '@material/mwc-snackbar'
import '@material/mwc-linear-progress'

/* shared styles */
import { sharedStyles } from './styles/shared-styles.js'

class BlackHole extends PendingContainer(LitElement) {
  // private fields and methods
  #callbackGoingOnline
  #callbackGoingOffline
  #callbackMaxInnerWidth

  // connection stuff
  #server
  #peers
  // styles
  static get styles () {
    return [
      sharedStyles,
      css`
      [hidden] { 
        display: none !important; 
      }

      :host {
        display: block;
        background: linear-gradient(
          to bottom right, var(--mdc-theme-background), var(--my-color));
      }

      /* All elements interested have online / offline class */
      `
    ]
  }
  // properties
  static get properties () {
    return {
      title: String,
      offline: Boolean,
      dark: Boolean,
      hasPendingChildren: Boolean
    }
  }

  constructor () {
    super()
    // init
    this.maxInnerWidth = 800
    this.offline = !navigator.onLine
    this.hasPendingChildren = false

    // define the callback before bind to this here is why
    // >> https://github.com/tc39/proposal-private-methods/issues/11
    this.#callbackMaxInnerWidth = this.#handleMaxInnerWidth.bind(this)
    this.#callbackGoingOnline = this.#goingOnline.bind(this)
    this.#callbackGoingOffline = this.#goingOffline.bind(this)

    // connection stuff
    this.#server = new ServerConnection()
  }

  connectedCallback () {
    super.connectedCallback()

    // init the drawer or tabs layout
    this.#handleMaxInnerWidth()

    // TODO
    this.#firePendingState()

    // init the listeners
    window.addEventListener('resize', this.#callbackMaxInnerWidth)
    window.addEventListener('online', this.#callbackGoingOnline)
    window.addEventListener('offline', this.#callbackGoingOffline)
  }

  disconnectedCallback () {
    // disconnect the callbacks
    window.removeEventListener('resize', this.#callbackMaxInnerWidth)
    window.removeEventListener('online', this.#callbackGoingOnline)
    window.removeEventListener('offline', this.#callbackGoingOffline)

    super.disconnectedCallback()
  }

  // handle back online
  #goingOnline () {
    this.offline = false
    const snack = this.shadowRoot.querySelector('mwc-snackbar')
    snack.setAttribute('labelText', 'Online')
    snack.show()
  }

  // handle going Offline
  #goingOffline () {
    this.offline = true
    const snack = this.shadowRoot.querySelector('mwc-snackbar')
    snack.setAttribute('labelText', 'Offline')
    snack.show()
  }

  // handle the drawer or tabs layout to render base on screen
  #handleMaxInnerWidth () {
    if (window.innerWidth > this.maxInnerWidth) {
      // TODO handle
      console.log(`@WIDTH > ${this.maxInnerWidth}`)
    } else {
      // TODO handle
      console.log(`@WIDTH < ${this.maxInnerWidth}`)
    }
  }

  // TODO - Test Async tasks
  #firePendingState () {
    const promise = new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve()
      }, 2000)
    })
    const event = new CustomEvent('pending-state', {
      detail: {
        title: 'Async task',
        promise
      }
    })
    this.dispatchEvent(event)
  }

  render () {
    return html`
      <!-- Main -->
      <main>

        <!-- Progress Bar for Async tasks -->
        <mwc-linear-progress 
          indeterminate 
          .closed="${!this.hasPendingChildren}">
        </mwc-linear-progress>

        <!-- Main Content -->
        <no-peers></no-peers>
        <blk-peers></blk-peers>
        <blk-message></blk-message>

      </main>

      <blk-footer></blk-footer>

      <blk-dialog></blk-dialog>
      <blk-toast></blk-toast>
      <blk-about></blk-about>

      <!-- Snackbar -->
      <mwc-snackbar>
         <mwc-icon-button icon="close" slot="dismiss" stacked></mwc-icon-button>
      </mwc-snackbar>
    `
  }
}

window.customElements.define('black-hole', BlackHole)
