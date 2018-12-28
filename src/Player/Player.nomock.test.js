import Player from '.';
import TestProvider from '../Provider/testProvider';
import { exec } from 'child_process';

let TestPlayer = null;
let flag = false;

window.HTMLMediaElement.prototype.load = () => { /* do nothing */ };
window.HTMLMediaElement.prototype.play = () => { /* do nothing */ };
window.HTMLMediaElement.prototype.pause = () => { /* do nothing */ };
window.HTMLMediaElement.prototype.mute = () => { /* do nothing */ };
window.HTMLMediaElement.prototype.unmute = () => { /* do nothing */ };
window.HTMLMediaElement.prototype.requestFullscreen = () => { /* do nothing */ };
window.HTMLMediaElement.prototype.setVolume = () => { /* do nothing */ };
window.HTMLMediaElement.prototype.forward = () => { /* do nothing */ };
window.HTMLMediaElement.prototype.rewind = () => { /* do nothing */ };
window.HTMLMediaElement.prototype.seek = () => { /* do nothing */ };
document.exitFullscreen = () => { /* do nothing */ };

describe('Player - TestProvider - Should call registered callback on fired events', () => {
    beforeEach(() => {
        const element = document.createElement('div');
        element.id = 'video1';

        document.body.appendChild(element);

        TestPlayer = new TestProvider({
            domNode: 'video1',
            provider: 'test'
        }, 123);

        document.getElementById('123').contentWindow.document.webkitCancelFullScreen = () => { /* do nothing */}

        flag = false;
    });

    it('should call play callback', (done) => {
        console.log('call play')

        const cb = () => {
            flag = true;
            expect(flag).toBeTruthy();
            done();
        }
    
        TestPlayer.on('play', cb);
        TestPlayer.play();
    });

    it('should call pause callback', (done) => {
        console.log('call pause', flag)

        
        const cb = () => {
            flag = true;
            expect(flag).toBeTruthy();
            done();
        }
    
        TestPlayer.on('pause', cb);
        TestPlayer.pause();
    });

    it('should call stop callback', (done) => {
        const cb = () => {
            flag = true;
            expect(flag).toBeTruthy();
            done();
        }
    
        TestPlayer.on('stop', cb);
        TestPlayer.stop();
    });

    it('should call mute callback', (done) => {
        const cb = () => {
            flag = true;
            expect(flag).toBeTruthy();
            done();
        }
    
        TestPlayer.on('mute', cb);
        TestPlayer.mute();
    });

    it('should call unmute callback', (done) => {
        const cb = () => {
            flag = true;
            expect(flag).toBeTruthy();
            done();
        }
    
        TestPlayer.on('unmute', cb);
        TestPlayer.unmute();
    });

    it('should call enterFullScreen callback', (done) => {
        const cb = () => {
            flag = true;
            expect(flag).toBeTruthy();
            done();
        }
    
        TestPlayer.on('enterFullScreen', cb);
        TestPlayer.toggleFullScreen();
    });

    it('should call exitFullScreen callback', (done) => {

        const cb = () => {
            console.log('exited');
            flag = true;
            expect(flag).toBeTruthy();
            done();
        }
    
        TestPlayer.on('exitFullScreen', cb);
        TestPlayer.toggleFullScreen();
        TestPlayer.toggleFullScreen();
    });

    it('should call forward callback', (done) => {
        const cb = () => {
            flag = true;
            expect(flag).toBeTruthy();
            done();
        }
    
        TestPlayer.on('forward', cb);
        TestPlayer.forward(50);
    });

    it('should call rewind callback', (done) => {
        const cb = () => {
            flag = true;
            expect(flag).toBeTruthy();
            done();
        }
    
        TestPlayer.on('rewind', cb);
        TestPlayer.rewind(50);
    });

    it('should call seek callback', (done) => {
        const cb = () => {
            flag = true;
            expect(flag).toBeTruthy();
            done();
        }
    
        TestPlayer.on('seek', cb);
        TestPlayer.seek(50);
    });

    it('should call setVolume callback', (done) => {
        const cb = () => {
            flag = true;
            expect(flag).toBeTruthy();
            done();
        }
    
        TestPlayer.on('setVolume', cb);
        TestPlayer.setVolume(0.4);
    });

    it('should call destroy callback', (done) => {
        const cb = () => {
            flag = true;
            expect(flag).toBeTruthy();
            done();
        }
    
        TestPlayer.on('destroy', cb);
        TestPlayer.clear();
    });
});