export default class TestProvider {
    id = null;

    iframeDoc = null;

    iframeContentWindow = null;

    isMuted = false;

    isFullScreen = false;

    listeners = {};

    /**
     *Creates an instance of TestProvider.
     * @param {Object} options
     * @param {String} id
     * @memberof TestProvider
     */
    constructor(options, id) {
        console.log('TestProvider', `Player ${id} initialized with: ${options}`);

        this.id = id;

        const iframeElement = document.createElement('iframe');

        iframeElement.id = id;
        document.body.appendChild(iframeElement);

        this.iframeDoc = iframeElement.contentDocument || iframeElement.contentWindow.document;
        this.iframeContentWindow = iframeElement.contentWindow;

        this.iframeDoc.open();
        this.iframeDoc.write(`
            <html>
                <body>
                <video width="200" controls>
                <source src="http://distribution.bbb3d.renderfarming.net/video/mp4/bbb_sunflower_1080p_60fps_normal.mp4" type="video/mp4">
                <source src="http://distribution.bbb3d.renderfarming.net/video/mp4/bbb_sunflower_1080p_60fps_normal.ogg" type="video/ogg">
                Your browser does not support HTML5 video.
                </video>
                </body>
            </html>`);
        this.iframeDoc.close();

        const [videoBBB] = this.iframeDoc.getElementsByTagName('video');
        console.log(videoBBB);

        this.iframeContentWindow.addEventListener('message', (receivedMessage) => {
            console.log([`iframe: ${id}`, 'received', receivedMessage]);

            const message = JSON.parse(receivedMessage.data);

            switch (message.command) {
            case 'play':
                videoBBB.play();
                this.fireEvent('play');
                console.log('Video player played');
                break;
            case 'pause':
                videoBBB.pause();
                this.fireEvent('pause');
                console.log('Video player paused');
                break;
            case 'stop':
                videoBBB.pause();
                videoBBB.currentTime = 0;
                this.fireEvent('stop');
                console.log('Video player stopped');
                break;
            case 'mute':
                videoBBB.muted = true;
                break;
            case 'unmute':
                videoBBB.muted = false;
                break;
            case 'enterFullScreen':
                if (videoBBB.requestFullscreen) {
                    videoBBB.requestFullscreen();
                } else if (videoBBB.mozRequestFullScreen) {
                    videoBBB.mozRequestFullScreen();
                } else if (videoBBB.webkitRequestFullscreen) {
                    videoBBB.webkitRequestFullscreen();
                } else if (videoBBB.msRequestFullscreen) {
                    videoBBB.msRequestFullscreen();
                }
                break;
            case 'exitFullScreen':
                if (this.iframeDoc.mozCancelFullScreen) {
                    this.iframeDoc.mozCancelFullScreen();
                } else {
                    this.iframeDoc.webkitCancelFullScreen();
                }
                break;
            case 'setVolume':
                videoBBB.volume = message.value;
                break;
            case 'forward':
                videoBBB.currentTime += message.value;
                break;
            case 'rewind':
                videoBBB.currentTime -= message.value;
                break;
            case 'seek':
                videoBBB.currentTime = message.value;
                break;
            default:
                console.log('unknown message', receivedMessage.data);
            }
        });
    }

    fireEvent(evt) {
        if (typeof this.listeners[evt] !== 'undefined') {
            this.listeners[evt].forEach((callbackFunction) => {
                callbackFunction();
            });
        }
    }

    on(event, cb) {
        if (typeof this.listeners[event] === 'undefined') {
            this.listeners[event] = [];
        }

        this.listeners[event].push(cb);

        return cb;
    }

    play() {
        this.iframeContentWindow.postMessage(JSON.stringify({ command: 'play' }));
    }

    pause() {
        this.iframeContentWindow.postMessage(JSON.stringify({ command: 'pause' }));
    }

    stop() {
        this.iframeContentWindow.postMessage(JSON.stringify({ command: 'stop' }));
    }

    mute() {
        this.isMuted = true;
        this.iframeContentWindow.postMessage(JSON.stringify({ command: 'mute' }));
    }

    unmute() {
        this.isMuted = false;
        this.iframeContentWindow.postMessage(JSON.stringify({ command: 'unmute' }));
    }

    toggleMute() {
        if (this.isMuted) {
            this.isMuted = false;
            this.unmute();
        } else {
            this.isMuted = true;
            this.mute();
        }
    }

    toggleFullScreen() {
        if (this.isFullScreen) {
            this.isFullScreen = false;
            this.iframeContentWindow.postMessage(JSON.stringify({ command: 'exitFullScreen' }));
        } else {
            this.isFullScreen = true;
            this.iframeContentWindow.postMessage(JSON.stringify({ command: 'enterFullScreen' }));
        }
    }

    setVolume(volumeLevel) {
        this.iframeContentWindow.postMessage(JSON.stringify({ command: 'setVolume', value: volumeLevel }));
    }

    forward(seconds) {
        this.iframeContentWindow.postMessage(JSON.stringify({ command: 'forward', value: seconds }));
    }

    rewind(seconds) {
        this.iframeContentWindow.postMessage(JSON.stringify({ command: 'rewind', value: seconds }));
    }

    seek(seconds) {
        this.iframeContentWindow.postMessage(JSON.stringify({ command: 'seek', value: seconds }));
    }
}