## VideoPlayer

VideoPlayer is a Manager for all the videos displayed in a web page

It can manage multiple video instances with multiple video Provider:

#### Supported providers:
* Vimeo
* Dailymotion
* Youtube
* Flowplayer (internal player, just pass a video source url)

## Usage
```javascript
import VideoPlayer from 'video-player';

// VideoPlayer is already an instance, no need to create a new one

const player = VideoPlayer.createPlayer({
    domNode: document.getElementById('video'),
    provider: 'dailymotion', // | 'vimeo' | 'youtube' | 'flowplayer'
    videoId: 'uxWvd',
    providerOptions: {
        // See each provider init options
    },
});

// Play the video (Note: some (mobile) browsers does not allow the play before a user interaction)
player.play();
// Pause the video
player.pause();

// Every player instance has an unique id, you can use it to send command from the VideoPlayer class
const id = player.id; // video_uxWvd_1
// Stop the video with the given id
VideoPlayer.stop(id); // player.stop()
// Clear (remove) the video with the given id
VideoPlayer.clear(id) // player.clear()

```
##### Add an event listener
```javascript
const callback = (evt) => {
    // Do stuff...
}
VideoPlayer.addEventListener(id, 'play', callback);
```
##### Remove an event listener
```javascript
VideoPlayer.removeEventListener(id, 'play', callback);
```

*See the [Documentation](#documentation) for a list of all available commands*

##### Create a new Player passing the DOM id instead of the DOM Node
```javascript
VideoPlayer.createPlayer({
    domNode: 'video', // Accepted also Css selector: #video, MUST BE an ID
    provider: 'dailymotion',
    videoId: 'uxWvd',
    //...
});
```

#### Register event listeners when creating the Player
```javascript
const playCallback = (evt) => {
    //
}

const pauseCallback = (evt) => {
    //
}

VideoPlayer.createPlayer({
    domNode: document.getElementById('video'),
    provider: 'dailymotion',
    videoId: 'uxWvd',
    events: {
        play: playCallback,
        pause: pauseCallback,
    },
});
```

**The Player instance is exposed and directly accessible, you can bypass at all the VideoPlayer interface**

```javascript
import { Player } from './src'
const player = new Player({
    domNode: document.getElementById('video'),
    provider: 'dailymotion',
    videoId: 'uxWvd',
    // ... Same options as VideoPlayer.createPlayer except for "events" (not supported here)
});
// You can still hae multiple Player instances, but they are not aware of each other
const player2 = new Player({
    domNode: document.getElementById('video2'),
    provider: 'vimeo',
    videoId: 'da45hds',
});
```

## Documentation
To read the documentation, go to:
 
