export class ServerConnection {
  #ws
  constructor () {
    this.connect()
  }

  connect () {
    // this.#endpoint()  ws://127.0.0.1:8080/server/webrtc
    if (this.#isConnected() || this.#isConnecting()) return
    this.#ws = new WebSocket(this.#endpoint())
    this.#ws.binaryType = 'arraybuffer'
    this.#ws.addEventListener('open', () => {
      console.log(`@WS >> Connected to ${this.#endpoint()}`)
    })
    this.#ws.addEventListener('message', this.#onMessage)
    this.#ws.addEventListener('close', this.#onClose)
    this.#ws.addEventListener('error', this.#onError)
  }

  disconnect () {
    this.send({ type: 'disconnect' })
    this.#ws.onclose = null
    this.#ws.close()
  }

  send (msg) {
    if (!this.#isConnected()) return
    this.#ws.send(JSON.stringify(msg))
  }

  #onMessage (e) {
    console.log(e)
  }

  #onClose (e) {
    console.log(e)
  }

  #onError (error) {
    console.log(error)
  }

  #endpoint () {
    // eg. dev http://localhost:8000/server/webrtc
    //     pro https://server-ip:port/server/webrtc
    const protocol = location.protocol.startsWith('https') ? 
      'wss' : 'ws'
    const webRTC = window.RTCPeerConnection ?
      'webrtc' : 'fallback'
    // TODO production endpoint
    // return `${protocol}://${location.host}/server/${webRTC}`
    return 'ws://127.0.0.1:8080/server/webrtc'
  }

  #isConnected () {
    return this.#ws && this.#ws.readyState === this.#ws.OPEN
  }

  #isConnecting () {
    return this.#ws && this.#ws.readyState === this.#ws.CONNECTING
  }
}