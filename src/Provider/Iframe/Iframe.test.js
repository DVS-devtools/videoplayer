import IframeProvider from './index';

const flushPromises = () => {
    return new Promise(resolve => window.setImmediate(resolve));
};

document.body.innerHTML = '<div id="iframe-video"></div>';

const id = 'fpVideo';
const videourl = 'http://www.pocoyohouse.com/it/bvideoplayer?id=d2694a85c54e5b5ef6074224f8a01179&videoid=VO990047713&autoplay=1&apienabled=1&debugjs=0&playerId=bcacd70d_0b9f_8386_ec04_33160307b7db&&language=it&w=1440&h=900&streamingkey=PYSE_158AA1_FM1X_FF_YH';
const domNode = '#iframe-video';

const options = {
    domNode,
    videoId: id,
    url: videourl
};

describe('IframeProvider Initialization', () => {
    beforeEach(() => {
        document.querySelector(domNode).innerHTML = '';
    });

    it('should correctly create an iframe node with the correct src', () => {
        new IframeProvider(options, id);
        expect(document.querySelector(domNode).children.length).toBe(1);
        const iframe = document.querySelector(domNode).children[0];
        expect(iframe).toBeInstanceOf(HTMLIFrameElement);
        expect(iframe.src).toEqual(videourl);
        expect(iframe.id).toEqual(id);
    });

    it('should resolve the ready promise on ready event', async () => {
        const Instance = new IframeProvider(options, id);
        Instance.isThisIframe = () => true;
        const data = {event: 'ready'};
        Instance.iframeWindow.parent.postMessage(JSON.stringify(data), '*');
        await flushPromises();
        await expect(Instance.ready).resolves.toEqual(data);
    });

    it('should reject the ready promise on malformed event', async (done) => {
        const Instance = new IframeProvider(options, id);
        Instance.isThisIframe = () => true;
        const data = {foo: 'bar'};
        Instance.iframeWindow.parent.postMessage(data, '*');
        Instance.ready.catch(e => {
            expect(e).toEqual(new SyntaxError('Unexpected token o in JSON at position 1'))
            done()
        })
    });
});

describe('IframeProvider API', () => {
    let Instance;

    beforeEach(() => {
        document.querySelector(domNode).innerHTML = '';
        Instance = new IframeProvider(options, id);
        Instance.ready = Promise.resolve(); // Skip wait for iframe ready event
    });

    it('Should call play on play()', async (done) => {
        Instance.iframeWindow.addEventListener('message', (msg) => {
            expect(JSON.parse(msg.data)).toEqual({method: 'play'});
            done();
        });
        await Instance.play();
    });

    it('Should call pause on pause()', async (done) => {
        Instance.iframeWindow.addEventListener('message', (msg) => {
            expect(JSON.parse(msg.data)).toEqual({method: 'pause'});
            done();
        });
        await Instance.pause();
    });

    it('should call toggle on togglePlay()', async (done) => {
        Instance.iframeWindow.addEventListener('message', (msg) => {
            expect(JSON.parse(msg.data)).toEqual({method: 'toggleplay'});
            done();
        });
        await Instance.togglePlay();
    });

    it('Should call stop on stop()', async (done) => {
        Instance.iframeWindow.addEventListener('message', (msg) => {
            expect(JSON.parse(msg.data)).toEqual({method: 'stop'});
            done();
        });
        await Instance.stop();
    });

    it('should call mute with true on mute()', async (done) => {
        Instance.iframeWindow.addEventListener('message', (msg) => {
            expect(JSON.parse(msg.data)).toEqual({method: 'mute'});
            done();
        });
        await Instance.mute();
    });

    it('should call unmute on unmute()', async (done) => {
        Instance.iframeWindow.addEventListener('message', (msg) => {
            expect(JSON.parse(msg.data)).toEqual({method: 'unmute'});
            done();
        });
        await Instance.unmute();
    });

    it('should call togglemute on toggleMute()', async (done) => {
        Instance.iframeWindow.addEventListener('message', (msg) => {
            expect(JSON.parse(msg.data)).toEqual({method: 'togglemute'});
            done();
        });
        await Instance.toggleMute();
    });

    it('should call fullscreen on toggleFullScreen()', async (done) => {
        Instance.iframeWindow.addEventListener('message', (msg) => {
            expect(JSON.parse(msg.data)).toEqual({method: 'togglefullscreen'});
            done();
        });
        await Instance.toggleFullScreen();
    });

    it('should call setvolume with value 1 on 100% of percentage on setVolume()', async (done) => {
        Instance.iframeWindow.addEventListener('message', (msg) => {
            expect(JSON.parse(msg.data)).toEqual({method: 'setvolume', data: 1});
            done();
        });
        await Instance.setVolume(100);
    });

    it('should call volume with value 0.5 on 50% of percentage on setVolume()', async (done) => {
        Instance.iframeWindow.addEventListener('message', (msg) => {
            expect(JSON.parse(msg.data)).toEqual({method: 'setvolume', data: 0.5});
            done();
        });
        await Instance.setVolume(50);
    });

    it('should call volume with value 0 on 0% of percentage on setVolume()', async (done) => {
        Instance.iframeWindow.addEventListener('message', (msg) => {
            expect(JSON.parse(msg.data)).toEqual({method: 'setvolume', data: 0});
            done();
        });
        await Instance.setVolume(0);
    });

    it('should call forward on forward()', async (done) => {
        Instance.iframeWindow.addEventListener('message', (msg) => {
            expect(JSON.parse(msg.data)).toEqual({method: 'forward', data: 10});
            done();
        });
        await Instance.forward(10);
    });

    it('should call rewind on rewind()', async (done) => {
        Instance.iframeWindow.addEventListener('message', (msg) => {
            expect(JSON.parse(msg.data)).toEqual({method: 'rewind', data: 10});
            done();
        });
        await Instance.rewind(10);
    });

    it('should call seek with given value on seek()', async (done) => {
        Instance.iframeWindow.addEventListener('message', (msg) => {
            expect(JSON.parse(msg.data)).toEqual({method: 'seek', data: 5});
            done();
        });
        await Instance.seek(5);
    });

    it('should call download on download()', async (done) => {
        Instance.iframeWindow.addEventListener('message', (msg) => {
            expect(JSON.parse(msg.data)).toEqual({method: 'download'});
            done();
        });
        await Instance.download();
    });
});

describe('IframeProvider getters and cleanup', () => {
    let Instance ;
    beforeEach(() => {
        document.querySelector(domNode).innerHTML = '';
        Instance = new IframeProvider(options, id);
        Instance.ready = Promise.resolve(); // Skip wait for iframe ready event
    });

    it('should return all the listeners', async () => {
        const cb1 = () => {};
        const cb2 = () => {};
        const cb3 = () => {};
        await Instance.on('play', cb1);
        await Instance.on('pause', cb2);
        await Instance.on('play', cb3);
        const listeners = Instance.listeners;
        expect(Object.keys(listeners)).toEqual(['play', 'pause']);
        expect(listeners.play.length).toEqual(2);
        expect(listeners.pause.length).toEqual(1);
        expect(listeners.play[1].callback).toBe(cb1);
        expect(listeners.play[1].once).toBe(false);
        expect(listeners.play[0].callback).toBe(cb3);
        expect(listeners.play[0].once).toBe(false);
        expect(listeners.pause[0].callback).toBe(cb2);
        expect(listeners.pause[0].once).toBe(false);
    });

    it('should remove the DOM element on clear()', async () => {
        expect(Array.from(document.querySelector(options.domNode).querySelectorAll('iframe')).length).toBe(1);
        await Instance.clear();
        expect(Array.from(document.querySelector(options.domNode).querySelectorAll('iframe')).length).toBe(0);
    });
});

describe('IframeProvider event on - off - one', () => {
    let Instance;
    let cb;
    beforeEach(() => {
        document.querySelector(domNode).innerHTML = '';
        Instance = new IframeProvider(options, id);
        Instance.ready = Promise.resolve(); // Skip wait for iframe ready event
        Instance.isThisIframe = () => true; // message event source is null
        jest.clearAllMocks();
        cb = jest.fn();
    });

    it('should add an event on on', async (done) => {
        await Instance.on('play', cb);
        expect(Instance.listeners['play'].length).toBe(1);
        expect(Instance.listeners['play'][0].callback).toBe(cb);
        const data = {event: 'play'};
        const l = (e) => {
            expect(cb).toHaveBeenCalledWith(data);
            Instance.iframeWindow.parent.removeEventListener('message', l);
            done();
        };
        Instance.iframeWindow.parent.addEventListener('message', l);
        Instance.iframeWindow.parent.postMessage(JSON.stringify(data), '*');
    });

    it('should remove an event on off', async (done) => {
        await Instance.on('play', cb);
        await Instance.off('play', cb);
        expect(Instance.listeners['play'].length).toBe(0);
        const data = {event: 'play'};
        const l = (e) => {
            expect(cb).not.toHaveBeenCalled();
            Instance.iframeWindow.parent.removeEventListener('message', l);
            done();
        };
        Instance.iframeWindow.parent.addEventListener('message', l);
        Instance.iframeWindow.parent.postMessage(JSON.stringify(data), '*');
    });

    it('should fire firstPlay event', async (done) => {
        await Instance.on('firstPlay', cb);
        const data = {event: 'firstplay'};
        const l = (e) => {
            expect(cb).toHaveBeenCalledWith(data);
            Instance.iframeWindow.parent.removeEventListener('message', l);
            done();
        };
        Instance.iframeWindow.parent.addEventListener('message', l);
        Instance.iframeWindow.parent.postMessage(JSON.stringify(data), '*');
    });

    it('should send playback event', async (done) => {
        await Instance.on('playbackProgress', cb);
        const data = {event: 'progress'};
        const l = (e) => {
            expect(cb).toHaveBeenCalledWith(data);
            Instance.iframeWindow.parent.removeEventListener('message', l);
            done();
        };
        Instance.iframeWindow.parent.addEventListener('message', l);
        Instance.iframeWindow.parent.postMessage(JSON.stringify(data), '*');
    });

    it('should register a once event and deregister it after first fire', async (done) => {
        await Instance.one('play', cb);
        const data = {event: 'play'};
        const l = async (e) => {
            expect(cb).toHaveBeenCalledWith(data);
            await flushPromises();
            expect(Instance.listeners.play.length).toBe(0);
            Instance.iframeWindow.parent.removeEventListener('message', l);
            done();
        };
        Instance.iframeWindow.parent.addEventListener('message', l);
        Instance.iframeWindow.parent.postMessage(JSON.stringify(data), '*');
    });
});
