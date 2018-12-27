import { VideoPlayer } from '../src/index.js';

window.wVideoPlayer = VideoPlayer;

VideoPlayer.defaults.provider = 'vimeo';

const player = VideoPlayer.createPlayer({
    domNode: '#video',
    provider: 'test',
    videoId: 123,
    events: {
        play: () => {
            console.log('ciao');
        }
    }
});

console.log(VideoPlayer.getPlayers())