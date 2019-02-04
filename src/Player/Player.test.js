import Player from '../Player';
import TestProvider from '../Provider/testProvider';
import DailymotionProvider from '../Provider/Dailymotion';
import VimeoProvider from '../Provider/Vimeo';
import FlowplayerProvider from '../Provider/Flowplayer';
import YoutubeProvider from '../Provider/Youtube';
import IframeProvider from '../Provider/Iframe';

jest.mock('../Provider/testProvider');
jest.mock('../Provider/Dailymotion');
jest.mock('../Provider/Vimeo');
jest.mock('../Provider/Flowplayer');
jest.mock('../Provider/Youtube');
jest.mock('../Provider/Iframe');

let TestPlayer = null;

beforeEach(() => {
    TestProvider.mockClear();
    DailymotionProvider.mockClear();
    VimeoProvider.mockClear();
    FlowplayerProvider.mockClear();
    YoutubeProvider.mockClear();
    IframeProvider.mockClear();
    TestPlayer = null;
});

describe('Player - TestProvider - Create a test player instance with div id', () => {
    it('should create a new Player passing a div id', () => {
        TestPlayer = new Player({
            domNode: 'video1',
            provider: 'test',
            videoId: '123',
        }, '123');

        expect(TestProvider).toHaveBeenCalled();
    });

    it('should create a new test Player passing a query selector', () => {
        TestPlayer = new Player({
            domNode: '#video1',
            provider: 'test',
            videoId: '123',
        }, '123');

        expect(TestProvider).toHaveBeenCalled();
    });

    it('should create a new test Player passing a domNode', () => {
        var domElement = document.createElement('div');
        domElement.id = 'video1';

        document.body.appendChild(domElement);

        TestPlayer = new Player({
            domNode: domElement,
            provider: 'test',
            videoId: '123',
        }, '123');

        expect(TestProvider).toHaveBeenCalled();
    });

    it('should not create a new test Player with an inexistent provider', () => {
        expect(() =>  new Player({
            domNode: 'video1',
            provider: 'myinexistentvideoplayer',
            videoId: '123',
        }, '123')).toThrow();
    });
});

describe('Player - Different Providers - Create a Player instance', () => {
    it('should create a Player with the Dailymotion Provider', () => {
        TestPlayer = new Player({
            domNode: '#video1',
            provider: 'dailymotion',
            videoId: '123',
        }, '123');

        expect(DailymotionProvider).toHaveBeenCalled();
    });

    it('should create a Player with the Vimeo Provider', () => {
        TestPlayer = new Player({
            domNode: '#video1',
            provider: 'vimeo',
            videoId: '123',
        }, '123');

        expect(VimeoProvider).toHaveBeenCalled();
    });

    it('should create a Player with the Flowplayer Provider', () => {
        TestPlayer = new Player({
            domNode: '#video1',
            provider: 'flowplayer',
            videoId: '123',
        }, '123');

        expect(FlowplayerProvider).toHaveBeenCalled();
    });

    it('should create a Player with the Youtube Provider', () => {
        TestPlayer = new Player({
            domNode: '#video1',
            provider: 'youtube',
            videoId: '123',
        }, '123');

        expect(YoutubeProvider).toHaveBeenCalled();
    });

    it('should create a Player with the Iframe Provider', () => {
        TestPlayer = new Player({
            domNode: '#video1',
            provider: 'iframe',
            videoId: '123',
        }, '123');

        expect(IframeProvider).toHaveBeenCalled();
    });
});

describe('PlayerMethods - TestProvider - function call', () => {
    beforeEach(() => {
        TestPlayer = new Player({
            domNode: '#video1',
            videoId: '123',
            provider: 'test'
        }, '123');
    });

    it('Should call the TestProvider play method', () => {
        TestPlayer.play();
        expect(TestProvider.prototype.play).toHaveBeenCalled();
    });

    it('Should call the TestProvider pause method', () => {
        TestPlayer.pause();
        expect(TestProvider.prototype.pause).toHaveBeenCalled();
    });

    it('Should call the TestProvider stop method', () => {
        TestPlayer.stop();
        expect(TestProvider.prototype.stop).toHaveBeenCalled();
    });

    it('Should call the TestProvider mute method', () => {
        TestPlayer.mute();
        expect(TestProvider.prototype.mute).toHaveBeenCalled();
    });

    it('Should call the TestProvider unmute method', () => {
        TestPlayer.unmute();
        expect(TestProvider.prototype.unmute).toHaveBeenCalled();
    });

    it('Should call the TestProvider toggleMute method', () => {
        TestPlayer.toggleMute();
        expect(TestProvider.prototype.toggleMute).toHaveBeenCalled();
    });

    it('Should call the TestProvider toggleFullScreen method', () => {
        TestPlayer.toggleFullScreen();
        expect(TestProvider.prototype.toggleFullScreen).toHaveBeenCalled();
    });

    it('Should call the TestProvider setVolume method', () => {
        TestPlayer.setVolume(0.4);
        expect(TestProvider.prototype.setVolume).toHaveBeenCalled();
    });

    it('Should call the TestProvider forward method', () => {
        TestPlayer.forward(50);
        expect(TestProvider.prototype.forward).toHaveBeenCalled();
    });

    it('Should call the TestProvider rewind method', () => {
        TestPlayer.rewind(50);
        expect(TestProvider.prototype.rewind).toHaveBeenCalled();
    });

    it('Should call the TestProvider seek method', () => {
        TestPlayer.seek(50);
        expect(TestProvider.prototype.seek).toHaveBeenCalled();
    });

    it('Should call the TestProvider clear method', () => {
        TestPlayer.clear();
        expect(TestProvider.prototype.clear).toHaveBeenCalled();
    });

    it('should call TestProvider togglePlay method', () => {
        TestPlayer.togglePlay();
        expect(TestProvider.prototype.togglePlay).toHaveBeenCalled();
    });

    it('should call TestProvider download method', () => {
        TestPlayer.download();
        expect(TestProvider.prototype.download).toHaveBeenCalled();
    });

    it('Should call the TestProvider on/off method', () => {
        const cb = () => {
            console.log('on play');
        };
        TestPlayer.on('play', cb);

        expect(TestProvider.prototype.on).toHaveBeenCalled();

        TestPlayer.off('play', cb);
        expect(TestProvider.prototype.off).toHaveBeenCalled();
    });

    it('should return all the Listeners in TestProvider', () => {
        // We can't check if "listeners" property of class TestProvider is called (no spy, no mock on class properties
        // We can only check if what is returned is equal to what we manually set
        const listeners = {
            play: [console.log],
            pause: [() => {}]
        };
        TestPlayer.player.listeners = listeners;
        expect(TestPlayer.getListeners()).toEqual(listeners);
    });
});
