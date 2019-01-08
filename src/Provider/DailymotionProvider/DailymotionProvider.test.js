import DailymotionProvider from './index';
import global from '../../global';

class MockPlayer {
    _events = {};

    fullscreen = false;

    muted = false;

    currentTime = 0;

    duration = 100;

    constructor(...params) {
        setTimeout(() => {
            this.fireEvent('apiready');
        }, 100);
    }

    addEventListener(evt, cb) {
        this._events[evt] = cb;
    }

    removeEventListener(evt, cb) {
        delete this._events[evt];
    }

    fireEvent(evt) {
        if (this._events[evt]) {
            this._events[evt]();
        }
    }

    play() {}
    pause() {}
    setMuted(bool) {}
    toggleMuted() {}
    setFullscreen(bool) {}
    setVolume(lvl) {}
    seek(sec) {}
}

document.body.innerHTML = `
    <div id="video"></div>
`;
const id = '123';
const options = {
    domNode: 'video',
    videoId: '123'
};
const sdkUrl = 'https://api.dmcdn.net/all.js';

describe('DailymotionProvider initialization', () => {
    beforeEach(() => {
        window.DMSDK = null;
        window.DM = undefined;
        for (const s of document.head.getElementsByTagName('script')) {
            s.remove();
        }
    });

    it('should correctly load only one SDK file even if multiple instances are defined', () => {
        expect(document.head.getElementsByTagName('script').length).toBe(0);
        new DailymotionProvider(options, id);
        new DailymotionProvider(options, id);
        expect(document.head.getElementsByTagName('script').length).toBe(1);
        expect(document.head.getElementsByTagName('script')[0].src).toEqual(sdkUrl);
    });
});

describe('DailymotionProvider API', () => {
    let Instance;
    let spys;

    beforeEach(() => {
        global.DMSDK = null;
        window.DM = {
            player: () => new MockPlayer(),
        };
        jest.restoreAllMocks();
        Instance = new DailymotionProvider(options, id);
        spys = {
            play: jest.spyOn(MockPlayer.prototype, 'play'),
            pause: jest.spyOn(MockPlayer.prototype, 'pause'),
            setMuted: jest.spyOn(MockPlayer.prototype, 'setMuted'),
            toggleMuted: jest.spyOn(MockPlayer.prototype, 'toggleMuted'),
            setFullscreen: jest.spyOn(MockPlayer.prototype, 'setFullscreen'),
            setVolume: jest.spyOn(MockPlayer.prototype, 'setVolume'),
            seek: jest.spyOn(MockPlayer.prototype, 'seek'),
        };
    });

    it('should call play on play()', async () => {
        await Instance.play();
        expect(spys.play).toHaveBeenCalled();
    });

    it('should call pause on pause()', async () => {
        await Instance.pause();
        expect(spys.pause).toHaveBeenCalled();
    });

    it('should call pause and seek on stop()', async () => {
        await Instance.stop();
        expect(spys.pause).toHaveBeenCalled();
        expect(spys.seek).toHaveBeenCalled();
    });

    it('should call setMuted on mute()', async () => {
        await Instance.mute();
        expect(spys.setMuted).toHaveBeenCalledWith(true);
    });

    it('should call setMuted on unmute()', async () => {
        await Instance.unmute();
        expect(spys.setMuted).toHaveBeenCalledWith(false);
    });

    it('should call toggleMuted on toggleMute()', async () => {
        await Instance.toggleMute();
        expect(spys.toggleMuted).toHaveBeenCalled();
    });

    it('should call setFullscreen on toggleFullScreen()', async () => {
        Instance.dmPlayer.fullscreen = false;
        await Instance.toggleFullScreen();
        expect(spys.setFullscreen).toHaveBeenCalledWith(true);
        Instance.dmPlayer.fullscreen = true;
        await Instance.toggleFullScreen();
        expect(spys.setFullscreen).toHaveBeenCalledWith(false);
    });

    it('should call setVolume on setVolume()', async () => {
        await Instance.setVolume(90);
        expect(spys.setVolume).toHaveBeenCalledWith(0.9);
        await Instance.setVolume(0.7);
        expect(spys.setVolume).toHaveBeenCalledWith(0.7);
    });

    it('should call seek on forward()', async () => {
        Instance.dmPlayer.currentTime = 50;
        await Instance.forward(10);
        expect(spys.seek).toHaveBeenCalledWith(60);
    });

    it('should call seek on rewind()', async () => {
        Instance.dmPlayer.currentTime = 50;
        await Instance.rewind(10);
        expect(spys.seek).toHaveBeenCalledWith(40);
    });

    it('should call seek on seek()', async () => {
        await Instance.seek(10);
        expect(spys.seek).toHaveBeenCalledWith(10);
    });
});

describe('DailymotionProvider getters and cleanup', () => {
    let Instance;
    beforeEach(() => {
        global.DMSDK = null;
        window.DM = {
            player: () => new MockPlayer(),
        };
        Instance = new DailymotionProvider(options, id);
        document.body.innerHTML = `
            <div id="video"></div>
        `;
    });

    it('should get muted status with isMuted getter', () => {
        Instance.dmPlayer.muted = true;
        expect(Instance.isMuted).toBe(true);
        Instance.dmPlayer.muted = false;
        expect(Instance.isMuted).toBe(false);
    });

    it('should get fullscreen status with isFullScreen getter', () => {
        Instance.dmPlayer.fullscreen = true;
        expect(Instance.isFullScreen).toBe(true);
        Instance.dmPlayer.fullscreen = false;
        expect(Instance.isFullScreen).toBe(false);
    });

    it('should return undefined on isMuted getter if DM is not ready', () => {
        Instance.dmPlayer = null;
        expect(Instance.isMuted).toBeUndefined();
    });

    it('should return undefined on isFullScreen getter if DM is not ready', () => {
        Instance.dmPlayer = null;
        expect(Instance.isFullScreen).toBeUndefined();
    });

    it('should return all the registered listeners', async () => {
        const cb1 = () => {};
        const cb2 = () => {};
        const cb3 = () => {};
        await Instance.on('play', cb1);
        await Instance.on('pause', cb2);
        await Instance.on('play', cb3);

        const listeners = Instance.getListeners();
        expect(Object.keys(listeners)).toEqual(['play', 'pause']);
        expect(listeners.play.length).toEqual(2);
        expect(listeners.pause.length).toEqual(1);
        expect(listeners.play[1]).toBe(cb1);
        expect(listeners.play[0]).toBe(cb3);
        expect(listeners.pause[0]).toBe(cb2);
    });

    it('should remove the DOM element on clear', async () => {
        expect(document.getElementById(options.domNode)).toBeDefined();
        await Instance.clear();
        expect(document.getElementById(options.domNode)).toBeNull();
    });
});

describe('DailymotionProvider events, on - off', () => {
    let Instance;
    let spys;
    beforeEach(() => {
        global.DMSDK = null;
        window.DM = {
            player: () => new MockPlayer(),
        };
        Instance = new DailymotionProvider(options, id);
        spys = {
            addEventListener: jest.spyOn(MockPlayer.prototype, 'addEventListener'),
            removeEventListener: jest.spyOn(MockPlayer.prototype, 'removeEventListener'),
        }
        document.body.innerHTML = `
            <div id="video"></div>
        `;
    });

   it('should add an event on on', async () => {
       const cb = () => {};
       await Instance.on('play', cb);
       expect(Instance.listeners['play'].length).toBe(1);
       expect(Instance.listeners['play'][0]).toBe(cb);
       expect(Instance.dmPlayer._events['play']).toBe(cb);
       expect(spys.addEventListener).toHaveBeenLastCalledWith('play', cb);
   });

    it('should remove an event on off', async () => {
        const cb = () => {};
        await Instance.on('play', cb);
        await Instance.off('play', cb);
        expect(Instance.listeners['play'].length).toBe(0);
        expect(Instance.dmPlayer._events['play']).toBeUndefined();
        expect(spys.removeEventListener).toHaveBeenLastCalledWith('play', cb);
    });

    it('should send timeupdate25 event', async () => {
        const cb = jest.fn();
        await Instance.on('timeupdate25', cb);
        Instance.dmPlayer.duration = 100;
        Instance.dmPlayer.currentTime = 25;
        Instance.dmPlayer.fireEvent('timeupdate');
        expect(Instance.listeners['timeupdate25'][0]).toHaveBeenCalled();
    });

    it('should send timeupdate50 event', async () => {
        const cb = jest.fn();
        await Instance.on('timeupdate50', cb);
        Instance.dmPlayer.duration = 100;
        Instance.dmPlayer.currentTime = 50;
        Instance.dmPlayer.fireEvent('timeupdate');
        expect(Instance.listeners['timeupdate50'][0]).toHaveBeenCalled();
    });

    it('should send timeupdate75 event', async () => {
        const cb = jest.fn();
        await Instance.on('timeupdate75', cb);
        Instance.dmPlayer.duration = 100;
        Instance.dmPlayer.currentTime = 75;
        Instance.dmPlayer.fireEvent('timeupdate');
        expect(Instance.listeners['timeupdate75'][0]).toHaveBeenCalled();
    });
});

