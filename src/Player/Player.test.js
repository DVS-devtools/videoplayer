import Player from '../Player';
import TestProvider from '../Provider/testProvider';

jest.mock('../Provider/testProvider');

let TestPlayer = null;

beforeEach(() => {
    TestProvider.mockClear();
    TestPlayer = null;
});

describe('Player - TestProvider - Create a test player instance with div id', () => {
    it('should create a new Player passing a div id', () => {
        TestPlayer = new Player({
            domNode: 'video1',
            provider: 'test'
        }, '123');

        expect(TestProvider).toHaveBeenCalled();
    });

    it('should create a new test Player passing a query selector', () => {
        TestPlayer = new Player({
            domNode: '#video1',
            provider: 'test'
        }, '123');

        expect(TestProvider).toHaveBeenCalled();
    });

    it('should create a new test Player passing a domNode', () => {
        var domElement = document.createElement('div');
        domElement.id = 'video1';

        document.body.appendChild(domElement);

        TestPlayer = new Player({
            domNode: domElement,
            provider: 'test'
        }, '123');

        expect(TestProvider).toHaveBeenCalled();
    });

    it('should not create a new test Player with an inexistent provider', () => {
        expect(() =>  new Player({
            domNode: 'video1',
            provider: 'myinexistentvideoplayer'
        }, '123')).toThrow();
    });
});

describe('PlayerMethods - TestProvider - function call', () => {
    beforeEach(() => {
        TestPlayer = new Player({
            domNode: '#video1',
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

    it('Should call the TestProvider getListeners method', () => {
        TestPlayer.getListeners();
        expect(TestProvider.prototype.getListeners).toHaveBeenCalled();
    });

    it('Should call the TestProvider clear method', () => {
        TestPlayer.clear();
        expect(TestProvider.prototype.clear).toHaveBeenCalled();
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
});