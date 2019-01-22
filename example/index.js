import { VideoPlayer } from '../src/index.js';

window.wVideoPlayer = VideoPlayer;

const cb = console.log;

Array.from((new Array(7))).forEach((n, i) => {
    const options = {};
    switch (true) {
        case i % 4 === 0:
            options.provider = 'vimeo';
            options.videoId = '57950299';
            break;
        case i % 3 === 0:
            options.provider = 'youtube';
            options.videoId = 'QK8mJJJvaes';
            break;
        case i % 2 === 0:
            options.provider = 'dailymotion';
            options.videoId = 'xwr14q';
            break;
        default:
            options.provider = 'flowplayer';
            options.videoId = 'VO990047713';
            options.url =  'http://video.kidzinmind.com/cmsp/2017/11/13/15/59/75c34439-e2c5-483d-a9b2-1efdb859f9ba.mp4';
    }
    const div = document.createElement('div');
    div.id = `video${i}`;
    document.body.appendChild(div);
    window[`player${i}`] = VideoPlayer.createPlayer(Object.assign({}, options, {
        domNode: div.id,
        events: {
            play: cb,
            playbackProgress25: cb,
        }
    }))
});

player0.on('firstPlay', () => console.log('first play'));


console.log(VideoPlayer.getPlayers())

window.toAll = (command) => {
    VideoPlayer.getPlayersAsArray().forEach(p => p[command]())
}
