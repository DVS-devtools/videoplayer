import YoutubeProvider from './index';
import global from '../../global';
import Player from 'youtube-player';

const flushPromises = () => {
    return new Promise(resolve => window.setImmediate(resolve));
};

class MockPlayer {
    _events = {};

    volume = 1;

    muted = false;

    currentTime = 0;

    duration = 100;

    constructor(dom, opts) {
        const parent = document.getElementById(dom);
        if (parent) {
            const iframe = document.createElement('iframe');
            parent.appendChild(iframe);
        }
    }

    on(evt, cb) {
        this._events[evt] = cb;
    }

    off(evt, cb) {
        delete this._events[evt];
    }

    fireEvent(evt, ...data) {
        if (this._events[evt]) {
            this._events[evt](...data);
        }
    }

    getCurrentTime() {
        return Promise.resolve(this.currentTime);
    }

    getDuration() {
        return Promise.resolve(this.duration);
    }

    isMuted() {
        return Promise.resolve(this.muted);
    }

    playVideo() {}
    pauseVideo() {}
    stopVideo() {}
    mute() {}
    unMute() {}
    setVolume(lvl) {}
    seekTo() {}
    destroy() {}
    getVideoUrl() {
        return Promise.resolve('http://test.com');
    }
}

document.body.innerHTML = `
    <div id="video"></div>
`;
const id = '123';
const options = {
    domNode: 'video',
    videoId: '123'
};

describe('YoutubeProvider initialization', () => {
    beforeEach(() => {
        global.YTSDK = null;
        window.AYT = undefined;
        for (const s of document.head.getElementsByTagName('script')) {
            s.remove();
        }
    });

    it('should correctly load the youtube-player module', async () => {
        const Instance = new YoutubeProvider(options, id);
        await flushPromises();
        const YTPlayer = new Player(options.domNode);
        // Is there a better way?
        expect(Object.keys(Instance.ytPlayer)).toEqual(Object.keys(YTPlayer));
    });

    it('should reuse the same Player if already loaded', async () => {
        // Simulate eager load
        const JestMockPlayer = jest.fn(() => new MockPlayer());
        window.AYT = {
            Player: JestMockPlayer
        };
        const Instance = new YoutubeProvider(options, id);
        await flushPromises();
        const YTPlayer = new Player(options.domNode);
        expect(Object.keys(Instance.ytPlayer)).not.toEqual(Object.keys(YTPlayer));
        expect(Instance.ytPlayer instanceof MockPlayer).toBe(true);
        expect(JestMockPlayer).toHaveBeenCalledWith(document.getElementById(options.domNode), {videoId: options.videoId});
    });

    it('should create an interval timer to simulate playback progress', async () => {
        jest.useFakeTimers();
        new YoutubeProvider(options, id);
        await flushPromises();
        expect(setInterval).toHaveBeenCalledWith(expect.any(Function), 250);
    });

    it('should simulate the playback progress', async () => {
        jest.useFakeTimers();
        const spys = {
            getDuration: jest.spyOn(MockPlayer.prototype, 'getDuration'),
            getCurrentTime: jest.spyOn(MockPlayer.prototype, 'getCurrentTime'),
        };
        window.AYT = {
            Player: (...params) => new MockPlayer(params),
        };
        const Instance = new YoutubeProvider(options, id);
        await flushPromises();
        Instance.ytPlayer.currentTime = 25;
        jest.advanceTimersByTime(260);
        await flushPromises();
        expect(spys.getDuration).toHaveBeenCalled();
        expect(spys.getCurrentTime).toHaveBeenCalled();
    });
});

describe('YoutubeProvider API', () => {
    let Instance;
    let spys;

    beforeEach(() => {
        global.YTSDK = null;
        window.AYT = {
            Player: (...params) => new MockPlayer(...params),
        };
        jest.restoreAllMocks();
        Instance = new YoutubeProvider(options, id);
        spys = {
            getCurrentTime: jest.spyOn(MockPlayer.prototype, 'getCurrentTime'),
            playVideo: jest.spyOn(MockPlayer.prototype, 'playVideo'),
            pauseVideo: jest.spyOn(MockPlayer.prototype, 'pauseVideo'),
            stopVideo: jest.spyOn(MockPlayer.prototype, 'stopVideo'),
            mute: jest.spyOn(MockPlayer.prototype, 'mute'),
            unMute: jest.spyOn(MockPlayer.prototype, 'unMute'),
            isMuted: jest.spyOn(MockPlayer.prototype, 'isMuted'),
            setVolume: jest.spyOn(MockPlayer.prototype, 'setVolume'),
            seekTo: jest.spyOn(MockPlayer.prototype, 'seekTo'),
            getVideoUrl: jest.spyOn(MockPlayer.prototype, 'getVideoUrl'),
        };
    });

    it('should call playVideo on play()', async () => {
        await Instance.play();
        expect(spys.playVideo).toHaveBeenCalled();
    });

    it('should call pauseVideo on pause()', async () => {
        await Instance.pause();
        expect(spys.pauseVideo).toHaveBeenCalled();
    });

    it('should call stopVideo on stop()', async () => {
        await Instance.stop();
        expect(spys.stopVideo).toHaveBeenCalled();
    });

    it('should call mute on mute()', async () => {
        await Instance.mute();
        expect(spys.mute).toHaveBeenCalled();
    });

    it('should call unMute on unmute()', async () => {
        await Instance.unmute();
        expect(spys.unMute).toHaveBeenCalled();
    });

    it('should call isMuted first and then mute or unMute on toggleMute()', async () => {
        Instance.ytPlayer.muted = true;
        await Instance.toggleMute();
        expect(spys.isMuted).toHaveBeenCalled();
        expect(spys.unMute).toHaveBeenCalled();

        Instance.ytPlayer.muted = false;
        await Instance.toggleMute();
        expect(spys.isMuted).toHaveBeenCalled();
        expect(spys.mute).toHaveBeenCalled();
    });

    it('should call setVolume on setVolume()', async () => {
        await Instance.setVolume(90);
        expect(spys.setVolume).toHaveBeenCalledWith(90);
    });

    it('should call seekTo on forward()', async () => {
        Instance.ytPlayer.currentTime = 50;
        await Instance.forward(10);
        expect(spys.getCurrentTime).toHaveBeenCalled();
        expect(spys.seekTo).toHaveBeenCalledWith(60);
    });

    it('should call seekTo on rewind()', async () => {
        Instance.ytPlayer.currentTime = 50;
        await Instance.rewind(10);
        expect(spys.getCurrentTime).toHaveBeenCalled();
        expect(spys.seekTo).toHaveBeenCalledWith(40);
    });

    it('should call seekTo on seek()', async () => {
        await Instance.seek(10);
        expect(spys.seekTo).toHaveBeenCalledWith(10);
    });

    it('should log a warning when try to call unsupported method toggleFullScreen', () => {
        const mock = jest.spyOn(console, 'warn');
        Instance.toggleFullScreen();
        expect(mock).toHaveBeenCalled();
    });

    it('should return the video url on Youtube website on download()', async () => {
        expect(await Instance.download()).toEqual('http://test.com');
        expect(spys.getVideoUrl).toHaveBeenCalled();
    });
});

describe('Youtube getters and cleanup', () => {
    let Instance;
    let destroySpy;
    beforeEach(() => {
        global.YTSDK = null;
        window.AYT = {
            Player: (...params) => new MockPlayer(...params),
        };
        Instance = new YoutubeProvider(options, id);
        document.body.innerHTML = `
            <div id="video"></div>
        `;
        destroySpy = jest.spyOn(MockPlayer.prototype, 'destroy');
    });

    it('should return all the registered listeners', async () => {
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

    it('should get the muted status', async () => {
        Instance.ytPlayer.muted = false;
        expect(await Instance.isMuted).toBe(false)
    });

    it('should remove the DOM element on clear', async () => {
        jest.useFakeTimers();
        const listenerId = Instance.fakeProgressListener;
        await Instance.clear();
        expect(Instance.listeners).toEqual({});
        expect(Instance.fakeProgressListener).toEqual(null);
        expect(destroySpy).toHaveBeenCalled();
        expect(clearInterval).toHaveBeenCalledWith(listenerId);
    });
});

describe('YoutubeProvider events, on - off - one', () => {
    let Instance;
    let spys;
    beforeEach(() => {
        jest.useFakeTimers();
        global.YTSDK = null;
        window.AYT = {
            Player: (...params) => new MockPlayer(params),
        };
        Instance = new YoutubeProvider(options, id);
        spys = {
            on: jest.spyOn(MockPlayer.prototype, 'on'),
            off: jest.spyOn(MockPlayer.prototype, 'off')
        }
        document.body.innerHTML = `
            <div id="video"></div>
        `;
    });

    it('should add a single listener to YoutubePlayer stateChange event', async () => {
        expect(Object.keys(Instance.ytPlayer._events).length).toBe(1);
        expect(Instance.ytPlayer._events['stateChange']).toEqual(expect.any(Function));
        const cb = () => {};
        await Instance.on('play', cb);
        expect(Object.keys(Instance.ytPlayer._events).length).toBe(1);
    });

    it('should call all registered events for play when stateChange is fired with data = 1', async () => {
        const cb = jest.fn();
        await Instance.on('play', cb);
        Instance.ytPlayer.fireEvent('stateChange', {data: 1});
        expect(cb).toHaveBeenCalledWith({data: 1});
    });

    it('should add an event on on', async () => {
        const cb = () => {};
        await Instance.on('play', cb);
        expect(Instance.listeners['play'].length).toBe(1);
        expect(Instance.listeners['play'][0].callback).toBe(cb);
    });

    it('should remove an event on off', async () => {
        const cb = () => {};
        await Instance.on('play', cb);
        await Instance.off('play', cb);
        expect(Instance.listeners['play'].length).toBe(0);
    });

    it('should send playbackProgress25 event', async () => {
        const cb = jest.fn();
        await Instance.on('playbackProgress25', cb);
        Instance.ytPlayer.currentTime = 25;
        jest.advanceTimersByTime(260);
        await flushPromises();
        expect(cb).toHaveBeenCalled();
        expect(Instance.timeupdatePercentages[25]).toBe(true);
    });

    it('should send playbackProgress50 event', async () => {
        const cb = jest.fn();
        await Instance.on('playbackProgress50', cb);
        Instance.ytPlayer.currentTime = 50;
        jest.advanceTimersByTime(260);
        await flushPromises();
        expect(cb).toHaveBeenCalled();
        expect(Instance.timeupdatePercentages[50]).toBe(true);
    });

    it('should send playbackProgress75 event', async () => {
        const cb = jest.fn();
        await Instance.on('playbackProgress75', cb);
        Instance.ytPlayer.currentTime = 75;
        jest.advanceTimersByTime(260);
        await flushPromises();
        expect(cb).toHaveBeenCalled();
        expect(Instance.timeupdatePercentages[75]).toBe(true);
    });

    it('should register a once event and deregister it after first fire', async () => {
        const cb = jest.fn();
        await Instance.one('play', cb);
        Instance.ytPlayer.fireEvent('stateChange', {data: 1});
        await flushPromises();
        expect(cb).toHaveBeenCalledWith({data: 1});
        expect(Instance.listeners.play.length).toBe(0);
    });

    it('should fire firstPlay event only on first play', async () => {
        const cb = jest.fn();
        await Instance.on('firstPlay', cb);
        expect(Instance.listeners.firstPlay.length).toBe(1);
        Instance.ytPlayer.fireEvent('stateChange', {data: 1});
        await flushPromises();
        expect(cb).toHaveBeenCalled();
        expect(Instance.listeners.firstPlay.length).toBe(1);
        expect(Instance.isPlayed).toBe(true);
        // Check that cb is not called on subsequent play events
        Instance.ytPlayer.fireEvent('stateChange', {data: 1});
        expect(cb).toHaveBeenCalledTimes(1);
        expect(Instance.isPlayed).toBe(true);
    });

    it('should fire firstPlay again after player stop', async () => {
        const cb = jest.fn();
        await Instance.on('firstPlay', cb);
        Instance.ytPlayer.fireEvent('stateChange', {data: 1});
        await flushPromises();
        await Instance.stop();
        Instance.ytPlayer.fireEvent('stateChange', {data: 1});
        expect(cb).toHaveBeenCalledTimes(2);
    });
});

describe('YoutubeProvider Errors', () => {
    beforeEach(() => {
        global.YTSDK = null;
        delete window.AYT;
        jest.resetAllMocks();
    });
    afterAll(() => {
        jest.resetAllMocks();
        jest.restoreAllMocks();
        jest.resetModules();
    });

    it('should catch an error while loading the sdk', () => {
        jest.mock('youtube-player', () => {
            throw new Error('Test Error');
        });
        const Instance = new YoutubeProvider(options, id);
        return expect(Instance.ready).rejects.toEqual(new Error('Test Error'));
    });

    it('should catch an error while creating the player', () =>  {
        jest.mock('youtube-player', () => () => {
            throw new Error('Player Test Error');
        });
        const Instance = new YoutubeProvider(options, id);
        return expect(Instance.ready).rejects.toEqual(new Error('Player Test Error'));
    });
});
