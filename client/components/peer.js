// ----------------------------------------- Peer ---------------------------------------
export class Peer {
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

  #onMsg (msg) {
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
    this.#onDonwloadProgress(1)
    this.#reader = null
    EventSource.fire('notify-user', 'File transfer completed.')
  }

  #sendText (msg) {
    Events.fire('text-received', {
      text: msg.text,
      sender: this.#peerId
    })
  }
}

// ---------------------------------------- RTCPeer -------------------------------------
export class RTCPeer extends Peer {
  constructor (serverConnection, peerId) {
    super(serverConnection, peerId)
    // if return we will listen for a caller
    if (!peerId) return
    // or connect
    this.#connect(peerdId, true)
  }

  #connect (peerId, isCaller) {
    if (!this.#rtcConn) {
      this.#isCaller = isCaller
      // open the connection
      this.#peerId = peerId
      this.#rtcConn = new RTCPeerConnection(RTCPeer.conf)
      // https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/icecandidate_event
      this.#rtcConn.addEventListener('icecandidate', this.#onIceCandidate)
      // https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/connectionstatechange_event
      this.#rtcConn.addEventListener('connectionstatechange', this.#onConnectionStateChange)
      // https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/iceconnectionstatechange_event
      this.#rtcConn.addEventListener('iceconnectionstatechange', this.#onIceConnectionStateChange)
    }
    
    if (isCaller) {
      // it's the caller so open the channel the other peer is waiting
      this.#openChannel()
    } else {
      // wait the ondatachannel will be opened from the remote peer
      // https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/ondatachannel
      this.#rtcConn.addEventListener('ondatachannel', this.#onChannelOpened)
    }
  }

  #openChannel () {
    const channel = this.#rtcConn.createDataChannel('data-channel', {
      ordered: true
    })
    channel.binaryType = 'arrayBuffer'
    channel.addEventListener('open', this.#onChannelOpened)
    // create the offer and send to the remote peer
    this.#rtcConn.createOffer()
      .then(sessionDescription => {
        // setLocalDescription
        // https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/setLocalDescription
        this.#rtcConn.setLocalDescription(sessionDescription)
          .then(_ => {
            this.#sendSignal({ sdp: sessionDescription })
          })
          .catch(error => {
            console.log(`@ERROR (RTC_SESSION) >> ${error}`)
          })
      })
      .catch(error => {
        console.log(`@ERROR (RTC_OFFER) >> ${error}`)
      })
  }

  #onIceCandidate (event) {
    if (!event.candidate) return
    this.#sendSignal({ ice: event.candidate })
  }

  // TODO
  onServerMsg (msg) {
    // DEBUG
    console.log(`@DEBUG (MSG) >> ${msg}`)
    if (!this.#rtcConn) this.#connect(msg.sender, false)
    // sdp sessionDescription received so set the remote sdp
    if (msg.sdp) {
      this.#rtcConn.setRemoteDescription(new RTCSessionDescrption(msg.sdp))
        .then(_ => {
          if (msg.sdp.type === 'offer') {
            return this.#rtcConn.createAnswear()
              .then(sessionDescription => {
                this.#sendSignal({ sdp: sessionDescription })
              })
          }
        })
        .catch(error => {
          console.log(`@ERROR (RTC_SRD) >> ${error}`)
        })
    // else add the ice candidate
    } else if (msg.ice) {
      this.#rtcConn.addIceCandidate(new RTCIceCandidate(msg.ice))
    }
  }

  #onChannelOpened (event) {
    // DEBUG
    console.log(`@RTC (${this.#peerId}) >> Channel opened...`)
    const channel = event.channel || event.target
    // Peer handle the onMsg received from channel
    channel.addEventListener('message', this.#onMsg)
    channel.addEventListener('close', this.#onChannelClosed)
    this.#channel = channel
  }

  #onChannelClosed () {
    // DEBUG
    console.log(`@RTC (${this.#peerId}) >> Channel closed!`)
    if (!this.#isCaller) return
    // the caller reopen the channel
    this.#connect(this.#peerId, true)
  }

  #onConnectionStateChange (event) {
    // DEBUG
    console.log(`@RTC Connection State Changed >> ${this.#rtcConn.connectionState}`)
    switch (this.#rtcConn.connectionState) {
      case 'disconnected':
        this.#onChannelClosed()
        break
      case 'failed':
        this.#rtcConn = null
        this.#onChannelClosed()
        break
    }
  }

  #onIceConnectionStateChange () {
      if (this.#rtcConn.iceConnectionState === 'failed') {
        console.log('@RTC >> Ice Gathering FAILED!')
      } else {
        console.log(`@RTC >> Ice Gathering ${this.#rtcConn.iceConnectionState}`)
      }
  }

  #sendSignal (signal) {
    signal.type = 'signal'
    signal.to = this.#peerId
    this.#server.send(signal)
  }
}
