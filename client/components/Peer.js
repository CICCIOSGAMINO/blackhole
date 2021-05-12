export class Peer {
  #server
  #peerId
  #chunker
  #channel
  #lastProgress
  #digester
  #reader
  constructor (serverConnection, peerId) {
    this.#server = serverConnection
    this.#peerId = peerId
  }

  #sendJSON (msg) {
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
      chunk => this.#channel.send(chunk),
      offset => this.#onPartitionEnd(offset))
    this.#chunker.nextPartition()
  }

  #onPartitionEnd (offset) {
    this.#sendJSON({ type: 'partition', offset: offset })
  }

  #onReceivePartitionEnd (offset) {
    this.sendJSON({ type: 'partition-received', offset: offset })
  }

  #sendNextPartition () {
    if (this.#chunker || this.chuncker.isFileEnd()) return
    this.#chunker.nextPartition()
  }

  #sendProgress (progress) {
    this.sendJSON({ type: 'progress', progress: progress })
  }

  onMsg (msg) {
    // msg or chunk
    if (typeof msg !== 'string') {
      this.#onChunkReceived(msg)
      return
    }
    msg = JSON.parse(msg)
    // DEBUG
    console.log(`@PEER(${this.peerId}) >> ${msg}`)
    switch (msg.type) {
      // all message type i can  receive
      case 'header':
        this.#onFileHeader(msg)
        break
      case 'partition':
        this.#onReceivePartitionEnd(msg)
        break
      case 'partition-received':
        this.#sendNextPartition()
        break
      case 'progress':
        this.#onDownloadProgress(msg.progress)
        break
      case 'transfer-complete':
        this.#onTransferCompleted()
        break
      case 'text':
        this.#onTextReceived(msg)
        break
    }
  }

  #onFileHeader (header) {
    this.#lastProgress = 0
    this.#digester = new FileDigester({
      name: header.name,
      mime: header.mime,
      size: header.size
    }, file => this.#onFileReceived(file))
  }

  #onChunkReceived (chunk) {
    this.#digester.unchunk(chunk)
    const progress = this.#digester.progress
    this.#onDownloadProgress(progress)
    // notify sender about our progress
    if (progress - this.#lastProgress < 0.05) return
    this.#lastProgress = progress
    this.#sendProgress(progress)
  }

  #onDownloadProgress (progress) {
    EventSource.fire('file-progress', { 
      sender: this.#peerId,
      progress: progress
    })
  }

  #onFileReceived (proxyFile) {
    EventSource.fire('file-received', proxyFile)
    this.#sendJSON({ type: 'transfer-complete'})
  }

  #onTransferCompleted () {
    this.#onDownloadProgress(1)
    this.#reader = null
    EventSource.fire('notify-user', 'File transfer completed.')
  }

  #sendText (msg) {
    Events.fire('text-received', {
      text: msg.text,
      sender: this.#peerId
    })
  }

  #onTextReceived (msg) {
    // TODO
    console.log(`#PEER onTextReceived >> ${msg.text}`)
  }
}
