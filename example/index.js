import { VideoPlayer } from '../src/index.js';

/* "http://www.pocoyohouse.com/it/bvideoplayer?
id=6d164eb843ab8260c46a2bd30563fb1f&
videoid=VO990034684&
autoplay=1&
apienabled=1&
debugjs=0&
playerId=7f5ff0ae_6785_3c27_0f8c_6d8ad01330ac&
origin=http://www.pocoyohouse.com&
language=it&
w=1680&
h=1050&
streamingkey=PYPR_032CB1_FM1X_FF_YH" 
*/

window.wVideoPlayer = VideoPlayer;

VideoPlayer.defaults.provider = 'alfresco';

const player = VideoPlayer.createPlayer({
    domNode: '#video1',
    videoSrcBaseUrl: 'http://www.pocoyohouse.com/it/bvideoplayer',
    videoId: 'VO990047713',
    contentId: 'd2694a85c54e5b5ef6074224f8a01179',
    autoplay: 0,
    apienabled: 1,
    debugJs: 0,
    playerId: 'd2694a85c54e5b5ef6074224f8a01179',
    origin: 'http://localhost:3001/',
    language: 'it',
    width: 1680,
    height: 1050,
    streamingKey: 'PYSE_158AA1_FM1X_FF_YH'
});

const player2 = VideoPlayer.createPlayer({
    domNode: '#video2',
    videoSrcBaseUrl: 'http://www.pocoyohouse.com/it/bvideoplayer',
    videoId: 'VO990047713',
    contentId: 'd2694a85c54e5b5ef6074224f8a01179',
    autoplay: 0,
    apienabled: 1,
    debugJs: 0,
    playerId: 'd2694a85c54e5b5ef6074224f8a01179',
    origin: 'http://localhost:3001/',
    language: 'it',
    width: 1680,
    height: 1050,
    streamingKey: 'PYSE_158AA1_FM1X_FF_YH'
});

console.log(VideoPlayer.getPlayers())
