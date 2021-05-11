export class FileChunker {
  constructor (file, onChunk, onPartitionEnd) {
    this.#chunkSize = 64000 // 64kB
    
  }
}
