import { VideoPlayer } from '../src/index.js';

window.wVideoPlayer = VideoPlayer;

const cb = msg => () => console.log(msg);

window.FPlayer = VideoPlayer.createPlayer({
    domNode: '#newVersion',
    provider: 'newflowplayer',
    url: 'https://kidz.docomodigital.com/ota/stream/fcd849d0-9921-476e-852f-f87e219018af',
    mime: 'audio/mp3',
    audio: true,
    providerOptions: {
        token: 'TOKEN',
    },
    // events: {
    //     play: cb('play'),
    //     pause: cb('pause'),
    //     playbackProgress25: cb('playback25'),
    //     playbackProgress50: cb('playback50'),
    //     playbackProgress75: cb('playback75'),
    //     firstPlay: cb('firstPlay'),
    //     end: cb('end')
    // }
})

window.toAll = (command) => {
    VideoPlayer.getPlayersAsArray().forEach(p => p[command]())
};
