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
        autoplay: true,
        token: 'TOKEN',
        poster: 'https://lh3.googleusercontent.com/proxy/0BdyhREpY6J96Wm4DSM9OnEyR0nzhj5d7d3c3aF44-MF_BJ58G2cewAKaoImR5PrgCRMRlRfKdrB5Ww77SKJIt6DVhE'
    },
    events: {
        play: cb('play'),
        pause: cb('pause'),
        playbackProgress25: cb('playback25'),
        playbackProgress50: cb('playback50'),
        playbackProgress75: cb('playback75'),
        firstPlay: cb('firstPlay')
    }
})

window.toAll = (command) => {
    VideoPlayer.getPlayersAsArray().forEach(p => p[command]())
};
