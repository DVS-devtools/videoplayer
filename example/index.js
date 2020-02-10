import { VideoPlayer } from '../src/index.js';

window.wVideoPlayer = VideoPlayer;

const cb = msg => () => console.log(msg);

window.FPlayer = VideoPlayer.createPlayer({
    domNode: '#newVersion',
    provider: 'newflowplayer',
    videoId: 'DD990047298',
    url: 'https://www.w3schools.com/html/mov_bbb.mp4',
    mime: 'audio/mpeg',
    audio: false,
    providerOptions: {
        token: 'eyJraWQiOiJqNFJjN3QzeEZpTUsiLCJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NiJ9.eyJjIjoie1wiYWNsXCI6NixcImlkXCI6XCJqNFJjN3QzeEZpTUtcIn0iLCJpc3MiOiJGbG93cGxheWVyIn0.7X2ag-N3b1kAtTFmpwKdu8BzZ7PT5wXjvFIQKfYw226DdZq93TgYbMcOuR36vFJ6qzilRe2OqvZppZsu4glW8A',
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
