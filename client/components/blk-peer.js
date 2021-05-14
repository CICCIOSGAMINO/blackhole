import { LitElement, html, css } from 'lit'

export class BlkPeer extends LitElement {
  #touchTimer
  static get styles () {
    return css`
      :host {
        display: block;
        background-color: red;
      }
    `
  }

  static get properties () {
    return {
      id: String,
      name: String,
      device: String,
      progress: Number,
    }
  }

  constructor () {
    super()
    // set the icon
    this.#setIcon()

    this.addEventListener('drop', this.#onDrop)
    this.addEventListener('dragend', this.#onDragEnd)
    this.addEventListener('dragleave', this.#onDragEnd)
    this.addEventListener('dragover', this.#onDragOver)
    this.addEventListener('contextmenu', this.#onRightClick)
    this.addEventListener('touchstart', this.#onTouchStart)
    this.addEventListener('touchend', this.#onTouchEnd)
  }

  connectedCallback () {
    super.connectedCallback()
    // prevent browser's default file drop behavior
    window.addEventListener('dragover', e => e.preventDefault())
    window.addEventListener('drop', e => e.preventDefault())
  }

  disconnectedCallback () {
    window.removeEventListener('dragover')
    window.removeEventListener('drop')
    super.disconnectedCallback()
  }

  #setIcon () {
    switch (this.device) {
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
    const input = this.renderRoot.querySelector('input')
    const files = event.target.files
    const ce = new CustomEvent('files-selected', {
      files: files,
      to: this.peer.id
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
      to: this.peer.id
    })
    this.dispatchEvent(ce)
  }

  #onRightClick (event) {
    event.preventDefault()
    const ce = new CustomEvent('text-recipient', {
      to: this.peer.id
    })
    this.dispatchEvent(ce)
  }

  #onTouchStart (event) {
    this.#onTouchStart = Date.now()
    this.#touchTimer = setTimeout(_ => this.#onTouchEnd(), 610)
  }

  #onTouchEnd (event) {
    if (Date.now() - this.#onTouchStart < 500) {
      clearTimeout(this.#touchTimer)
    } else {
      // this is a long tap
      if (event) event.preventDefault()
      const ce = new CustomEvent('text-recipient', {
        to: this.id
      })
      this.dispatchEvent(ce)
    }
  }

  #onDragEnd () {

  }

  #onDragOver () {

  }

  render () {
    return html`
      
      <label for="drop" title="Click to send the files or right click to send a text">
        <input @change=${this.#onFileSelected} name="drop" type="file" multiple>
        <p>Icon Device: ${this.device}</p>
      </label>
    `
  }
}

customElements.define('blk-peer', BlkPeer)
