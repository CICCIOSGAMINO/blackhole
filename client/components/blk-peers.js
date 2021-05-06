import { LitElement, html, css } from 'lit'

export class BlkPeers extends LitElement {
  static get styles () {
    return css`
      :host {
        display: block;
        min-width: 10rem;
        min-height: 10rem;
        background-color: yellowgreen;
      }
    `
  }

  render () {
    return html`
      <h2>Im BlkPeers</h2>
    `
  }
}

customElements.define('blk-peers', BlkPeers)
