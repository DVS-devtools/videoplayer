import { VideoPlayer } from '../src/index.js';

VideoPlayer.defaults.provider = 'vimeo';

const player = VideoPlayer.createPlayer({
    domNode: '#video',
    videoId: 123,
    events: {
        play: () => {
            console.log('ciao');
        }
    }
});

const player2 = VideoPlayer.createPlayer({
    domNode: '#video',
    videoId: 123,
    events: {
        play: () => {
            console.log('ciao');
        }
    }
});

console.log(VideoPlayer.getPlayers())