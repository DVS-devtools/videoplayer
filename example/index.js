import { VideoPlayer } from '../src/index.js';

window.wVideoPlayer = VideoPlayer;

VideoPlayer.defaults.provider = 'dailymotion';

const player = VideoPlayer.createPlayer({
    domNode: '#video1',
    videoId: 'xwr14q',
});

console.log(VideoPlayer.getPlayers())
