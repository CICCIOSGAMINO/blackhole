export class Peer {
  constructor (serverConnection, peerId) {
    this.#server = serverConnection
    this.#peerId = peerId
  }

  sendJSON (msg) {
    this.send(JSON.stringify(msg))
  }

  sendFile (file) {
    this.sendJSON({
      type: 'header',
      name: file.name,
      mime: file.type,
      size: file.size
    })
    this.#chunker = new FileChunker(file,
      chunk => this.#send(chunk),
      offset => this.#onPartitionEnd(offset))
    this.#chunker.nextPartition()
  }
}