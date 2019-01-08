export default class FlowPlayer {
    id = null;

    contentId = null;

    videoId = null;

    country = null;

    language = null;

    otaService = null;

    apiEnabled = null;

    debugJs = null;

    autoplay = null;

    rel = null;

    origin = null;

    width = null;

    height = null;

    streamingkey = null;

    downloadUrl = null; // add &action=dwl to enable download url;

    videoSrcBaseUrl = null;

    videoSrcUrl = null;

    iframeElement = null;

    iframeContentWindow = null;

    listeners = {};

    insertElementInDOM(domNode) {
        this.iframeElement = document.createElement('iframe');
        this.iframeElement.id = this.id;
        this.iframeElement.src = this.videoSrcUrl;
        this.iframeElement.width = '100%';
        this.iframeElement.height = '100%';

        if (typeof domNode === 'string') {
            if (domNode.indexOf('#') === 0) {
                this.parent = document.querySelector(domNode);
                this.parent.appendChild(this.iframeElement);
            } else {
                this.parent = document.getElementById(domNode);
                this.parent.appendChild(this.iframeElement);
            }
        } else {
            this.parent = domNode;
            this.parent.appendChild(this.iframeElement);
        }

        this.iframeContentWindow = document.getElementById(this.id).contentWindow;
    }

    generateVideoSrcUrl() {
        return `${this.videoSrcBaseUrl}?`
        + `id=${this.contentId}&`
        + `videoid=${this.videoId}&`
        + `autoplay=${this.autoplay}&`
        + `apienabled=${this.apiEnabled}&`
        + `debugjs=${this.debugJs}&`
        + `playerId=${this.id}&`
        + `origin=${this.origin}&`
        + `language=${this.language}&`
        + `w=${this.width}&`
        + `h=${this.height}&`
        + `streamingkey=${this.streamingkey}`;
    }

    managePostMessageEvents(message) {
        switch (message.event) {
        case 'play':
            if (typeof message.conf !== 'undefined') {
                console.log('@@@ firstplay', message);
                this.fireEvent('firsPlay');
            } else {
                console.log('@@@ play', message);
                this.fireEvent('play');
            }
            break;
        case 'pause':
            console.log('@@@ pause', message);
            this.fireEvent('pause');
            break;
        case 'downloadInfo':
            console.log('@@@ downloadInfo', message);
            this.fireEvent('downloadInfo');
            break;
        case 'ready':
            console.log('@@@ ready', message);
            this.fireEvent('ready');
            break;
        case 'finish':
            console.log('@@@ finish', message);
            this.fireEvent('finish');
            break;
        default:
            console.warn('Command not found');
        }
    }

    receivedMessageCb(receivedMessage) {
        let message = null;

        if (typeof receivedMessage !== 'undefined' && typeof receivedMessage.data !== 'undefined') {
            if (receivedMessage.data) {
                try {
                    message = JSON.parse(receivedMessage.data);

                    if (message.uid === this.id) {
                        this.managePostMessageEvents(message);
                    }
                } catch (e) {
                    console.warn(['Product-Fe-Videoplayer', e]);
                }
            } else {
                console.warn(['Product-Fe-Videoplayer', 'No message found']);
            }
        }
    }

    listenOnPostMessage = () => {
        window.addEventListener('message', (message) => { if (typeof message.data === 'string') { this.receivedMessageCb(message); } });
    };

    constructor(options, id) {
        this.id = id;
        this.videoId = options.videoId; // remember to manage also url as videoid;
        this.streamingkey = options.streamingKey ? options.streamingKey : '';

        /* COULD BE SETTED WITH A DECORATOR */
        this.country = options.country ? options.country : 'en';
        this.language = options.language ? options.language : 'en';
        this.origin = options.origin ? options.origin : '*';

        this.otaService = options.otaService ? options.otaService : null;
        this.apiEnabled = options.apiEnabled ? options.apiEnabled : 1;
        this.debugJs = options.debugJs ? options.debugJs : 0;
        this.autoplay = options.autoplay ? options.autoplay : 0;
        this.rel = options.rel ? options.rel : '';
        this.width = options.width ? options.width : window.innerWidth;
        this.height = options.height ? options.height : window.innerHeight;
        this.contentId = options.contentId ? options.contentId : '';

        this.videoSrcBaseUrl = options.videoSrcBaseUrl ? options.videoSrcBaseUrl
            : window.location.origin;

        this.videoSrcUrl = this.generateVideoSrcUrl();

        console.log('generated url', this.videoSrcUrl);

        this.insertElementInDOM(options.domNode);

        this.listenOnPostMessage();
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

        this.listeners[event].unshift(cb);

        return cb;
    }

    off(event, cb) {
        if (this.listeners[event] && this.listeners[event].includes(cb)) {
            const index = this.listeners[event].indexOf(cb);
            this.listeners[event].splice(index, 1);
        }
    }

    getListeners(evt) {
        if (typeof evt === 'string') {
            if (typeof this.listeners[evt] !== 'undefined') {
                return this.listeners[evt];
            }

            return [];
        }

        return this.listeners;
    }

    play() {
        this.iframeContentWindow.postMessage(JSON.stringify({ event: 'play' }), '*');
    }

    pause() {
        this.iframeContentWindow.postMessage(JSON.stringify({ event: 'pause' }), '*');
    }
}