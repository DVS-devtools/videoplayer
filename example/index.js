import { VideoPlayer } from '../src/index.js';

window.wVideoPlayer = VideoPlayer;

const cb = msg => () => console.log(msg);

window.FPlayer = VideoPlayer.createPlayer({
    domNode: '#newVersion',
    provider: 'newflowplayer',
    videoId: 'DD990047298',
    url: 'https://www.w3schools.com/html/mov_bbb.mp4',
    mime: 'video/mp4',
    audio: false,
    providerOptions: {
        token: 'TOKEN',
    },
    events: {
        play: cb('play'),
        pause: cb('pause'),
        playbackProgress25: cb('playback25'),
        playbackProgress50: cb('playback50'),
        playbackProgress75: cb('playback75'),
    }
})

window.toAll = (command) => {
    VideoPlayer.getPlayersAsArray().forEach(p => p[command]())
};
