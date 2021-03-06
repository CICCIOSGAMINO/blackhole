import { LitElement, html, css } from 'lit'

/* components */
import { BlkPeer } from './components/blk-peer'
import { BlkFooter } from './components/blk-footer'
import { BlkDialog } from './components/blk-dialog'
import { BlkToast } from './components/blk-toast'
import { BlkAbout } from './components/blk-about'

/* Js Class */
import { PendingContainer } from './components/pending-container'
import { ServerConnection } from './components/server-connection'
import { RTCPeer } from './components/RTCPeer'

/* Material */
import '@material/mwc-icon'
import '@material/mwc-icon-button'
import '@material/mwc-snackbar'
import '@material/mwc-linear-progress'

/* shared styles */
import { sharedStyles } from './styles/shared-styles.js'

/**
 * @typedef {{
 *  id: string;
 *  name: string;
 *  device: string;
 * }} Peer
 */

class BlkHole extends PendingContainer(LitElement) {
  #callbackMaxInnerWidth
  #callbackGoingOnline
  #callbackGoingOffline
  #peers
  #server
  static get styles () {
    return [
      sharedStyles,
      css`
      [hidden] { 
        display: none !important; 
      }

      :host {
        display: block;
        min-height: 100vh;
        min-width: 100vw;

        background: linear-gradient(
          to bottom right, var(--mdc-theme-background), var(--my-color));
      }

      /* Absolute position the local peer */
      .local-peer {
        width: 200px;
        position: absolute;
        bottom: 10rem;
        left: 0; 
        right: 0; 
        margin-left: auto; 
        margin-right: auto; 
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
      hasPendingChildren: Boolean,
      peer: Object,
      peers: {
        type: Array,
        attribute: false
      }
    }
  }

  constructor () {
    super()
    // init
    this.maxInnerWidth = 800
    this.offline = !navigator.onLine
    this.hasPendingChildren = false
    // This Peer set
    this.peer = {
      id: 'ciccio5522',
      name: 'Cicciosgamino-Peer',
      device: 'linux'
    }
    // peers [{ id: '', name: '', device: '' }]
    this.peers = []
    // define the callback before bind to this here is why
    // >> https://github.com/tc39/proposal-private-methods/issues/11
    this.#callbackMaxInnerWidth = this.#handleMaxInnerWidth.bind(this)
    this.#callbackGoingOnline = this.#goingOnline.bind(this)
    this.#callbackGoingOffline = this.#goingOffline.bind(this)

    this.#server = new ServerConnection()

    // signal coming from server
    this.addEventListener('signal', e => this.#onMessageFromServer(e.detail))
    this.addEventListener('peers', e => this.#onPeers(e.detail))
    this.addEventListener('files-selected', this.#onFilesSelected)
    this.addEventListener('send-text', this.#onSendText)

    this.addEventListener('peer-joined', e => this.#onPeerJoined(e.detail))
    this.addEventListener('peer-left', e => this.#onPeerLeft(e.detail))
    this.addEventListener('file-progress', e => this.#onFileProgress(e.detail))
    this.addEventListener('paste', e => this.#onPaste(e.detail))
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

  #onMessageFromServer (msg) {
    // DEBUG msg from server in BlkHome peer manger
    console.log(`@BLK-HOME (Msg from server) >> ${msg}`)
    if (!this.#peers[msg.sender]) {
      // create the RTC Peer
      this.#peers[msg.sender] = new RTCPeer(this.#server)
    }
    // call onServerMsg method on the Peer
    this.#peers[msg.sender].onServerMsg(msg)
  }

  #onPeers (peers) {
    peers.forEach(peer => {
      if (this.#peers[peer.id]) {
        console.log(`@PEER (${peer.id}) >> Updated`)
      }
      if (window.RTCPeerConnection) {
        // Use the RTC connection
        this.#peers[peer.id] = new RTCPeer(this.#server, peer.id)
      } else {
        // TODO Use the WebSocket connection
        console.log('@WS >> WebSocket connection needed!')
      }
    })
  }

  sendTo (peerId, msg) {
    this.#peers[peerId].send(msg)
  }

  #onFilesSelected (msg) {
    this.#peers[msg.to].sendFiles(msg.files)
  }

  #onSendText (msg) {
    this.#peers[msg.to].sendText(msg.text)
  }

  #onPeerLeft (peerId) {
    const peer = this.#peers[peerId]
    delete this.#peers[peerId]
    peer.close()
  }

  #onPeerJoined (peer) {
    // return if already present
    if (this.renderRoot.querySelector(`#${peer.id}`)) return
    // create the peer
    // TODO
    const blkPeer = new BlkPeer(peer)
  }

  #onFileProgress () {

  }

  #onPaste () {
    
  }

  render () {
    return html`

      <!-- Progress Bar for Async tasks -->
      <mwc-linear-progress 
        indeterminate 
        .closed="${!this.hasPendingChildren}">
      </mwc-linear-progress>

      <!-- Main -->
      <main>

        <!-- Remote Peers -->
        <section>

          ${this.peers.map(p => html`
            <blk-peer .id=${p.id} .name=${p.name} .device=${p.device}></blk-peer>
          `)}

        </section>

        <!-- Local Peer -->
        <section>

          <blk-peer
            class="local-peer"
            .id=${this.peer.id} 
            .name=${this.peer.name} 
            .device=${this.peer.device}>
          <blk-peer>

        </section>

      </main>


      <!-- <blk-footer></blk-footer> -->
      <!-- <blk-dialog></blk-dialog> --> 
      <!-- <blk-toast></blk-toast> -->
      <!-- <blk-about></blk-about> -->

      <!-- Snackbar -->
      <mwc-snackbar>
         <mwc-icon-button icon="close" slot="dismiss" stacked></mwc-icon-button>
      </mwc-snackbar>
    `
  }
}

window.customElements.define('blk-hole', BlkHole)
