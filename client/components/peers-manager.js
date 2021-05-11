import { LitElement, html, css } from 'lit'
import { RTCPeer } from './peer'

class PeersManager extends LitElement {
  #peers
  #server
  constructor (serverConnection) {
    super()
    this.#peers = {}
    this.#server = serverConnection
  }

  connectedCallback () {
    super.connectedCallback()
    this.addEventListener('signal', e => this.#onMessage(e.detail))
    this.addEventListener('peers', e => this.#onPeers(e.detail))
    this.addEventListener('files-selected', this.#onFilesSelected)
    this.addEventListener('send-text', this.#onSendText)
    this.addEventListener('peer-left', this.#onPeerLeft)
  }

  #onMessage (msg) {
    if (!this.#peers[msg.sender]) {
      this.#peers[msg.sender] = new RTCPeer(this.#server)
    }
    this.#peers[msg.sender].onServerMsg(msg)
  }

  #onPeers (peers) {
    peers.forEach(peer => {
      if (this.peers[peer.id]) {
        // TODO refresh
      }
      if (window.RTCPeerConnection) {
        // Use the RTC connection
        this.peers[peer.id] = new RTCPeer(this.#server, peer.id)
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

}

customElements.define('peers-manager', PeersManager)
