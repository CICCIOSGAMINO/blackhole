export class FileDigester {
  constructor (meta, callback) {
    this.#buffer = []
    this.#bytesReceived = 0
    this.#size = meta.size
    this.#mime = meta.mime || 'application/octet-stream'
    this.#name = meta.name
    this.#callback = callback
  }

  unChunk(chunk) {
    this.#buffer.push(chunk)
    this.#bytesReceived += chunk.byteLength || chunk.size
    const totalChunks = this.#buffer.length
    this.progress = this.#bytesReceived / this.#size
    if (this.#bytesReceived < this.#size) return
    // done
    const blob = new Blob(this.#buffer, {
      type: this.#mime
    })
    this.#callback({
      name: this.#name,
      mime: this.#mime,
      size: this.#size,
      blob, blob
    })
  }
}
