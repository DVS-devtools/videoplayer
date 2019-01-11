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

VideoPlayer.defaults.provider = 'flowplayer';

var playEvent = () => {
    console.log('play')
}

window.player = VideoPlayer.createPlayer({
    domNode: '#video1',
    videoId: 'VO990047713',
    url: 'http://video.kidzinmind.com/cmsp/2017/11/13/15/59/75c34439-e2c5-483d-a9b2-1efdb859f9ba.mp4',
    providerOptions: {
        autoplay: 0,
        muted: 1,
        poster: 'https://scontent-mxp1-1.xx.fbcdn.net/v/t1.0-9/47388900_1952418691547440_2327501395416055808_n.jpg?_nc_cat=105&_nc_ht=scontent-mxp1-1.xx&oh=88e3464271e6da69aa18c97ee90b6a7e&oe=5CCF5219'
    },
    events: {
        firstPlay: () => {
            console.log('firstplay')
        },
        play: playEvent,
        pause: () => {
            console.log('pause');
        }
    }
    // streamingKey: 'PYSE_158AA1_FM1X_FF_YH'
});

console.log(VideoPlayer.getPlayers())
