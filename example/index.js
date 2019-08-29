import { VideoPlayer } from '../src/index.js';

window.wVideoPlayer = VideoPlayer;

const cb = msg => () => console.log(msg);

// Audio test
window.audioP = VideoPlayer.createPlayer({
    domNode: '#audioOnly',
    provider: 'flowplayer',
    videoId: 'DD990047297',
    url: 'https://kidz.docomodigital.com/ota/stream/3afba7f0-4936-4ebd-8ceb-ae6a87a9709a',
    mime: 'audio/mpeg',
    audio: true,
    providerOptions: {
        poster: 'https://s.motime.com/l/images/abs/1024x760/cropin/mnt/alfresco_content_prod/contentstore/2015/5/11/15/39/d525d05c-ec72-488f-8f4b-f01bca3a2105.jpg'
    },
    events: {
        play: cb('play'),
        pause: cb('pause'),
        playbackProgress25: cb('playback25')
    }
});

window.toAll = (command) => {
    VideoPlayer.getPlayersAsArray().forEach(p => p[command]())
};
