import FlowplayerProvider from './index';
import global from '../../global';

const flushPromises = () => {
    return new Promise(resolve => window.setImmediate(resolve));
};

class MockedPlayer {
    _events = {};
    duration = 100;
    video = {
        time: 4
    };
    constructor(...params){
        setTimeout(() => {
            this.fireEvent('ready');
        });
    };
    on(evt, cb) {
        this._events[evt] =cb;
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
    mute() {};
    fullscreen() {};
    volume() {};
    seek() {};
}


document.body.innerHTML = '<div id="fp-video"></div>';

const id = 'fpVideo';
const videourl = 'myvideourl';

const options = {
    domNode: 'fp-video',
    videoId: id,
    url: videourl
};

const fpCSSUrl = 'https://releases.flowplayer.org/7.2.7/skin/skin.css';

const jqueryUrl = 'https://code.jquery.com/jquery-1.12.4.min.js';

const fpUrl = 'https://releases.flowplayer.org/7.2.7/flowplayer.min.js';


describe('Flowplayer Provider Initialization', () => {
    beforeEach(() => {
        window.flowplayer = null;
        Array.from(document.head.getElementsByTagName('script')).forEach((s) => {
            s.remove();
        });

        Array.from(document.head.getElementsByTagName('link')).forEach((l) => {
            l.remove();
        });
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

});

describe('Flowplayer providers event on - off - one', () => {

});