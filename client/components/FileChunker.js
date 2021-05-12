export class FileChunker {
  constructor (file, onChunk, onPartitionEnd) {
    this.#chunkSize = 64000 //  64kB
    this.#maxPartitionSize = 1e6  // 1MB
    this.#offset = 0
    this.#partitionSize = 0
    this.#file = file
    this.#onChunk = onChunk
    this.#onPartitionEnd = onPartitionEnd
    this.#reader = new FileReader()
    this.#reader.addEventListener('load', e => this.#onChunkRead(e.target.result))
  }

  nextPartition () {
    this.#partitionSize = 0
    this.#readChunk()
  }

  #readChunk () {
    const chunk = this.#file.slice(this.#offset, this.#offset + this.#chunkSize)
    this.#reader.readAsArrayBuffer(chunk)
  }

  #onChunkRead (chunk) {
    this.#offset += chunk.byteLength
    this.#partitionSize += chunk.byteLength
    this.#onChunk(chunk)
    if (this.#isPartitionEnd() || this.#isFileEnd()) {
      this.#onPartitionEnd(this.#offset)
      return
    }
    this.#readChunk()
  }

  // TODO check this function
  repeatPartition () {
    this.#offset -= this.#partitionSize
    this.nextPartition()
  }

  #isPartitionEnd () {
    return this.#partitionSize >= this.#maxPartitionSize
  }

  #isFileEnd () {
    return this.#offset > this.#file.size
  }

  get progress () {
    return this.#offset / this.#file.size
  }
}
