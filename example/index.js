import { VideoPlayer } from '../src/index.js';

window.wVideoPlayer = VideoPlayer;

const cb = msg => () => console.log(msg);

// Audio test
// window.audioP = VideoPlayer.createPlayer({
//     domNode: '#audioOnly',
//     provider: 'flowplayer',
//     videoId: 'DD990047297',
//     url: 'https://www.w3schools.com/html/mov_bbb.mp4',
//     mime: 'audio/mpeg',
//     audio: false,
//     providerOptions: {
//         autoplay: true,
//         poster: 'https://s.motime.com/l/images/abs/1024x760/cropin/mnt/alfresco_content_prod/contentstore/2015/5/11/15/39/d525d05c-ec72-488f-8f4b-f01bca3a2105.jpg'
//     },
//     events: {
//         play: cb('play'),
//         pause: cb('pause'),
//         playbackProgress25: cb('playback25')
//     }
// });

// New version
window.newFP = VideoPlayer.createPlayer({
    domNode: '#newVersion',
    provider: 'newflowplayer',
    videoId: 'DD990047298',
    url: 'https://www.w3schools.com/html/mov_bbb.mp4',
    mime: 'audio/mpeg',
    audio: false,
    providerOptions: {
        token: 'TOKEN',
    },
    events: {
        play: cb('play'),
        pause: cb('pause'),
        playbackProgress25: cb('playback25')
    }
})

window.newFP.player.ready.then(() => {
  let ppp = window.newFP.player.fpPlayer
})

window.toAll = (command) => {
    VideoPlayer.getPlayersAsArray().forEach(p => p[command]())
};
