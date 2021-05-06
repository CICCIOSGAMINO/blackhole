import { LitElement, html, css } from 'lit'

export class BlkMessage extends LitElement {
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
      <h2>Im BlkMessage</h2>
    `
  }
}

customElements.define('blk-message', BlkMessage)
