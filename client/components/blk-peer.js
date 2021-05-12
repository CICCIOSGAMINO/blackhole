import { LitElement, html, css } from 'lit'

class BlkPeer extends LitElement {

  static get properties () {
    return {
      name: String,
      device: String,
      progress: Number
    }
  }

  constructor (peer) {
    this.#peer = peer
    // set the icon
    this.#setIcon()
  }

  connectedCallback () {
    // set some listeners
    this.addEventListener('drop', this.#onDrop)
    this.addEventListener('dragend', this.#onDragEnd)
    this.addEventListener('dragleave', this.#onDragEnd)
    this.addEventListener('dragover', this.#onDragOver)
    this.addEventListener('contextmenu', this.#onRightClick)
    this.addEventListener('touchstart', this.#onTouchStart)
    this.addEventListener('touchend', this.#onTouchEnd)

    // prevent browser's default file drop behavior
    window.addEventListener('dragover', e => e.preventDefault())
    window.addEventListener('drop', e => e.preventDefault())
  }

  #setIcon () {
    const device = this.#peer.name.device || this.#peer.name
    switch (device.type) {
      case 'mobile':
        this.device = '#phone-iphone'
        break
      case 'table':
        this.device = '#tablet-mac'
        break
      default:
        this.device = '#desktop-mac'
        break
    }
  }

  #onFileSelected (event) {
    const input = renderRoot.querySelector('input')
    const files = event.target.files
    const ce = new CustomEvent('files-selected', {
      files: files,
      to: this.#peer.id
    })
    this.dispatchEvent(ce)
    // reset input
    input.value = null
  }

  setProgress (progress) {
    this.progress = progress
  }

  #onDrop (event) {
    event.preventDefault()
    const files = event.dataTransfer.files
    const ce = new CustomEvent('files-selected', {
      files: files,
      to: this.#peer.id
    })
    this.dispatchEvent(ce)
  }

  #onRightClick (event) {
    event.preventDefault()
    const ce = new CustomEvent('text-recipient', {
      to: this.#peer.id
    })
    this.dispatchEvent(ce)
  }

  #onTouchStart (event) {
    this.#touchStart = Date.now()
    this.#touchTimer = setTimeout(_ => this.#onTouchEnd(), 610)
  }

  #onTouchEnd (event) {
    if (Date.now() - this.#touchStart < 500) {
      clearTimeout(this.#touchTimer)
    } else {
      // this is a long tap
      if (event) event.preventDefault()
      const ce = new CustomEvent('text-recipient', {
        to: this.#peer.id
      })
      this.dispatchEvent(ce)
    }
  }

  render () {
    return html`
      <label for="drop" title="Click to send the files or right click to send a text">
        <input @change=${this.#onFileSelected} name="drop" type="file" multiple>
        <p>Icon Device: ${this.device}</p>
      </label>
      <div class="progress"> Progress: ${this.progress}
        <div class="circle">Circle</div>
        <div class="circle right">Cirlce Right</div>
      </div>
      <div class="name"></div>
      <div class="device-name"></div>
      <div class="status"></div>
    `
  }
}

customElements.define('blk-peer', BlkPeer)
