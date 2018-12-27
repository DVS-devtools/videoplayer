import { VideoPlayer } from '../src/index.js';

window.wVideoPlayer = VideoPlayer;

VideoPlayer.defaults.provider = 'vimeo';

const player = VideoPlayer.createPlayer({
    domNode: '#video1',
    provider: 'test',
    videoId: 1,
    events: {
        play: () => {
            console.log('ciao');
        }
    }
});

const player2 = VideoPlayer.createPlayer({
    domNode: '#video2',
    provider: 'test',
    videoId: 2,
    events: {
        play: () => {
            console.log('ciao');
        }
    }
});

console.log(VideoPlayer.getPlayers())