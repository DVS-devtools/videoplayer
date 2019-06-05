import FlowplayerProvider from './index';
import global from '../../global';

const flushPromises = () => {
    return new Promise(resolve => window.setImmediate(resolve));
};

class MockedPlayer {
    _events = {};
    muted = false;
    isFullscreen = false;
    video = {
        time: 4,
        duration: 100
    };
    constructor(...params){
        setTimeout(() => {
            this.fireEvent('ready');
        });
    };
    on(evt, cb) {
        this._events[evt] = cb;
    };
    off(evt, cb) {
        delete this._events[evt];
    };
    fireEvent(evt) {
        if (this._events[evt]){
            this._events[evt]();
        }
    };
    resume() {};
    pause() {};
    toggle() {};
    stop() {};
    mute() { this.muted = !this.muted };
    fullscreen() { this.isFullscreen = !this.isFullscreen};
    volume() {};
    seek() {};
    unload() {};
    shutdown() {};
}

document.body.innerHTML = '<div id="fp-video"></div>';

const id = 'fpVideo';
const videourl = 'myvideourl';

const options = {
    domNode: '#fp-video',
    videoId: id,
    url: videourl
};

const fpCSSUrl = 'https://releases.flowplayer.org/7.2.7/skin/skin.css';

const jqueryUrl = 'https://code.jquery.com/jquery-1.12.4.min.js';

const fpUrl = 'https://releases.flowplayer.org/7.2.7/flowplayer.min.js';
const fpCommercialUrl = 'https://releases.flowplayer.org/7.2.7/commercial/flowplayer.min.js';


describe('Flowplayer Provider Initialization', () => {
    beforeEach(() => {
        window.flowplayer = null;
        Array.from(document.head.getElementsByTagName('script')).forEach((s) => {
            s.remove();
        });

        Array.from(document.head.getElementsByTagName('link')).forEach((l) => {
            l.remove();
        });

        global.FPSDK = null;
    });

    it('Should correctly load only one time assets even if multiple instance are defined', () => {
        expect(document.head.getElementsByTagName('script').length).toBe(0);
        new FlowplayerProvider(options, id);
        new FlowplayerProvider(options, id);
        expect(document.head.getElementsByTagName('script').length).toBe(2);
        expect(document.head.getElementsByTagName('script')[0].src).toEqual(jqueryUrl);
        expect(document.head.getElementsByTagName('script')[1].src).toEqual(fpUrl);

        expect(document.head.getElementsByTagName('link').length).toBe(1);
        expect(document.head.getElementsByTagName('link')[0].href).toEqual(fpCSSUrl);
    });

    it('Should load commercial url', () => {
        expect(document.head.getElementsByTagName('script').length).toBe(0);

        const commercialOptions = {
            domNode: '#fp-video',
            videoId: id,
            url: videourl,
            providerOptions: { key: 'abcd' }
        };

        new FlowplayerProvider(commercialOptions, id);
        expect(document.head.getElementsByTagName('script').length).toBe(2);
        expect(document.head.getElementsByTagName('script')[0].src).toEqual(jqueryUrl);
        expect(document.head.getElementsByTagName('script')[1].src).toEqual(fpCommercialUrl);
    });
});

describe('FlowplayerProvider API', () => {
    let Instance;
    let spies;

    beforeEach(() => {
        global.FPSDK = null;
        window.flowplayer = () => new MockedPlayer;
        jest.restoreAllMocks();
        Instance = new FlowplayerProvider(options, id);
        spies = {
            resume: jest.spyOn(MockedPlayer.prototype, 'resume'),
            pause: jest.spyOn(MockedPlayer.prototype, 'pause'),
            toggle: jest.spyOn(MockedPlayer.prototype, 'toggle'),
            stop: jest.spyOn(MockedPlayer.prototype, 'stop'),
            mute: jest.spyOn(MockedPlayer.prototype, 'mute'),
            fullscreen: jest.spyOn(MockedPlayer.prototype, 'fullscreen'),
            volume: jest.spyOn(MockedPlayer.prototype, 'volume'),
            seek: jest.spyOn(MockedPlayer.prototype, 'seek'),
        }
    });

    it('Should call resume on play()', async () => {
        await Instance.play();
        expect(spies.resume).toHaveBeenCalled();
    });

    it('Should call pause on pause()', async () => {
        await Instance.pause();
        expect(spies.pause).toHaveBeenCalled();
    });

    it('should call toggle on togglePlay()', async () => {
        await Instance.togglePlay();
        expect(spies.toggle).toHaveBeenCalled();
    });

    it('Should call stop on stop()', async () => {
        await Instance.stop();
        expect(spies.stop).toHaveBeenCalled();
    });

    it('should call mute with true on mute()', async () => {
        await Instance.mute();
        expect(spies.mute).toHaveBeenCalledWith(true);
    });

    it('should call mute with false on unmute()', async () => {
        await Instance.unmute();
        expect(spies.mute).toHaveBeenCalledWith(false);
    });

    it('should call mute on togglemute without params on toggleMute()', async () => {
        await Instance.toggleMute();
        expect(spies.mute).toHaveBeenCalled();
    });

    it('should call fullscreen on toggleFullScreen()', async () => {
        await Instance.toggleFullScreen();
        expect(spies.fullscreen).toHaveBeenCalled();
    });

    it('should call volume with value 1 on 100% of percentage on setVolume()', async () => {
        await Instance.setVolume(100);
        expect(spies.volume).toHaveBeenCalledWith(1);
    });

    it('should call volume with value 0.5 on 50% of percentage on setVolume()', async () => {
        await Instance.setVolume(50);
        expect(spies.volume).toHaveBeenCalledWith(0.5);
    });

    it('should call volume with value 0 on 0% of percentage on setVolume()', async () => {
        await Instance.setVolume(0);
        expect(spies.volume).toHaveBeenCalledWith(0);
    });

    it('should call seek of 14 seconds on forward()', async () => {
        await Instance.forward(10);
        expect(spies.seek).toHaveBeenCalledWith(14);
    });

    it('should call seek of 1 seconds on rewind()', async () => {
        await Instance.rewind(3);
        expect(spies.seek).toHaveBeenCalledWith(1);
    });

    it('should call seek with given value on seek()', async () => {
        await Instance.seek(5);
        expect(spies.seek).toHaveBeenCalledWith(5);
    });
});

describe('Flowplayer getters and cleanup', () => {
    let Instance ;
    beforeEach(() => {
        global.FPSDK = null;
        window.flowplayer = () => new MockedPlayer();
        document.body.innerHTML = '<div id="fp-video"></div>';
        Instance = new FlowplayerProvider(options, id);
    });

    it('should get muted value with ismuted getter', async () => {
        Instance.toggleMute();
        expect(await Instance.isMuted).toBe(true);
        Instance.toggleMute();
        expect(await Instance.isMuted).toBe(false);
    });

    it('should get fullscreen status with isFullscreen getter', async () => {
        Instance.toggleFullScreen();
        expect(await Instance.isFullScreen).toBe(true);
        Instance.toggleFullScreen();
        expect(await Instance.isFullScreen).toBe(false);
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
        expect(Array.from(document.querySelector(options.domNode).querySelectorAll('div')).length).toBe(1);
        await Instance.clear();
        expect(Array.from(document.querySelector(options.domNode).querySelectorAll('div')).length).toBe(0);
    });
});

describe('Flowplayer providers event on - off - one', () => {
    let Instance;
    let spies;
    beforeEach(() => {
        global.FPSDK = null;
        window.flowplayer = () => new MockedPlayer();
        document.body.innerHTML = `<div id="fp-video"></div>`;
        Instance = new FlowplayerProvider(options, id);
        spies = {
            on: jest.spyOn(MockedPlayer.prototype, 'on'),
            off: jest.spyOn(MockedPlayer.prototype, 'off'),
        };
    });

    it('should add an event on on', async () => {
        const cb = () => {};
        await Instance.on('play', cb);
        expect(Instance.listeners['play'].length).toBe(1);
        expect(Instance.listeners['play'][0].callback).toBe(cb);
        expect(Instance.fpPlayer._events['play']).toBe(Instance.fpPlayer.play);
        expect(spies.on).toHaveBeenLastCalledWith('resume', Instance.fpPlayer._events['resume']);
    });

    it('should remove an event on off', async () => {
        const cb = () => {};
        await Instance.on('play', cb);
        const fpCb = Instance.fpListeners.play;
        await Instance.off('play', cb);
        expect(Instance.listeners['play'].length).toBe(0);
        expect(Instance.fpPlayer._events['play']).toBeUndefined();
        expect(spies.off).toHaveBeenLastCalledWith('play', fpCb);
    });

    it('should fire firstPlay event', async () => {
        const cb = jest.fn();
        await Instance.on('firstPlay', cb);
        Instance.fpPlayer.fireEvent('resume');
        expect(Instance.listeners['firstPlay'][0].callback).toHaveBeenCalled();
    });

    it('should send playbackProgress25 event', async () => {
        const cb = jest.fn();
        await Instance.on('playbackProgress25', cb);
        Instance.fpPlayer.video.duration = 100;
        Instance.fpPlayer.video.time = 25;
        Instance.fpPlayer.fireEvent('progress');
        expect(Instance.listeners['playbackProgress25'][0].callback).toHaveBeenCalled();
    });

    it('should send playbackProgress50 event', async () => {
        const cb = jest.fn();
        await Instance.on('playbackProgress50', cb);
        Instance.fpPlayer.video.duration = 100;
        Instance.fpPlayer.video.time = 50;
        Instance.fpPlayer.fireEvent('progress');
        expect(Instance.listeners['playbackProgress50'][0].callback).toHaveBeenCalled();
    });

    it('should send playbackProgress75 event', async () => {
        const cb = jest.fn();
        await Instance.on('playbackProgress75', cb);
        Instance.fpPlayer.video.duration = 100;
        Instance.fpPlayer.video.time = 75;
        Instance.fpPlayer.fireEvent('progress');
        expect(Instance.listeners['playbackProgress75'][0].callback).toHaveBeenCalled();
    });

    it('should register a once event and deregister it after first fire', async () => {
        const cb = jest.fn();
        await Instance.one('play', cb);
        const fpCb = Instance.fpListeners.play;
        Instance.fpPlayer.fireEvent('resume');
        await flushPromises();
        expect(cb).toHaveBeenCalled();
        expect(Instance.listeners.play.length).toBe(0);
        expect(spies.off).toHaveBeenLastCalledWith('play', fpCb);
    });
});

describe('It should throw an error', () => {
    let Instance;

    beforeEach(() => {
        global.FPSDK = null;
        window.flowplayer = null;
        document.body.innerHTML = `<div id="fp-video"></div>`;
        Promise.all = () => {
            return Promise.reject(new Error('Unable to load flowplayer'));
        };
        jest.restoreAllMocks();
    });

    it('ready should be a rejected promise', (done) => {
        Instance = new FlowplayerProvider(options, id);
        expect(Instance.ready).rejects.toEqual(new Error('Unable to load flowplayer'));
        done();
    });

    it('ready should be a rejected promise and should not call a command play', (done) => {
        Instance = new FlowplayerProvider(options, id);
        expect(Instance.ready).rejects.toEqual(new Error('Unable to load flowplayer'));

        window.flowplayer = () => new MockedPlayer;
        const spies = {
            resume: jest.spyOn(MockedPlayer.prototype, 'resume')
        };
        Instance.play();
        expect(spies.resume).not.toHaveBeenCalled();
        done();
    });

    it('ready should be ready', (done) => {
        Promise.all = () => {
            return Promise.resolve(new MockedPlayer());
        };
        Instance = new FlowplayerProvider(options, id);
        expect(Instance.ready).resolves.toEqual();
        done();
    })
});
