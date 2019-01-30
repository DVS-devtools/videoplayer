import TestProvider from '../Provider/testProvider';
import DailymotionProvider from '../Provider/Dailymotion';
import FlowplayerProvider from '../Provider/Flowplayer';
import VimeoProvider from '../Provider/Vimeo';
import YoutubeProvider from '../Provider/Youtube';
import IframeProvider from '../Provider/Iframe';
import { ValidateArg, ValidateObj } from '../Validation';

/**
 * This class will provide you a player instance. An instance is independent
 * to all the other player instances, this means that you can have more
 * players inside a single page, all managed independently.
 * How to manage the instances is your own choice.
 * You can use your own players manager, creating your interface and manage it in
 * the way you want, or you can use the {@link VideoPlayer} interface,
 * that provides you a faster and easier way to manage more players in a single page. Please
 * remember that if you are using the VideoPlayer class you need to interact directly with that.
 * @example
 * const options = {
 *     domNode: document.getElementById('player'),
 *     provider: 'dailymotion',
 *     videoId: 'xwr14q',
 *     providerOptions: {
 *        params: {
 *            quality: 720,
 *        },
 *     },
 * };
 * const player = new Player(options, 'player_1');
 */
class Player {
    id = null;

    player = null;

    /**
     * Creates an instance of Player.
     * @param {Object} options configuration options ( provider, videoId, url, domNode... )
     * @param {String|Node} options.domNode DOM element identifier,
     * where to mount the player.
     *
     * Can be a DOM Node instance (ex: document.getElementById(id))
     * or a querySelector for a Node ID (ex: #id)
     * @param {String} options.provider The provider to use,
     * one of: 'dailymotion', 'vimeo', 'youtube', 'flowplayer' | 'iframe'
     * @param {String} [options.videoId] ID of the video, passed to the provider to find the video
     * @param {String} [options.url] url of the video resource, passed to the provider
     * @param {Object<any>}[options.providerOptions] provider init options,
     * see each provider doc to know what can be passed here:
     * * **Vimeo**: https://github.com/vimeo/player.js#embed-options
     * * **Dailymotion**: https://developer.dailymotion.com/player#player-parameters
     * * **Youtube**: https://developers.google.com/youtube/player_parameters?playerVersion=HTML5#Parameters
     * * **Flowplayer**: https://flowplayer.com/help/developers/flowplayer-7/setup#player-options
     * @param {String} [id] Id of the player,
     * it is used by {@link VideoPlayer} to manage multiple Player instances
     */
    constructor(options, id) {
        this.id = id;

        return this.createPlayer(options, id);
    }

    /**
     * @ignore
     * Creates the Player provider
     * @param options
     * @param {String} id Id of the player to associate inside the dom
     * @return {Player}
     */
    @ValidateObj({ provider: 'string', domNode: 'string|object', videoId: 'string|number' }, 0, { videoId: 'url' })
    @ValidateArg('string|number', 1)
    createPlayer(options, id) {
        switch (options.provider) {
        case 'test':
            this.player = new TestProvider(options, id);
            break;
        case 'dailymotion':
            this.player = new DailymotionProvider(options, id);
            break;
        case 'flowplayer':
            this.player = new FlowplayerProvider(options, id);
            break;
        case 'vimeo':
            this.player = new VimeoProvider(options, id);
            break;
        case 'youtube':
            this.player = new YoutubeProvider(options, id);
            break;
        case 'iframe':
            this.player = new IframeProvider(options, id);
            break;
        default:
            this.player = null;
            throw new Error(`Unsupported Provider ${options.provider}`);
        }
        return this;
    }

    /**
     * Add a listener callback to an event.
     * Note that the same event can manage more listeners.
     *
     * Please remember to store the function inside a variable, in order to call the off method
     * to remove the listener on a precise event
     *
     * Supported events:
     * * **play**: fired when video starts playing
     * * **pause**: fired when video stops playing
     * * **end**: fired at the end of the playback
     * * **playbackProgress**: fired every N ms (depends ont he provider) while the video is playing
     * * **playbackProgress25**: fired when the video reach 25% of playback duration
     * * **playbackProgress50**: fired when the video reach 50% of playback duration
     * * **playbackProgress75**: fired when the video reach the 75% of playback duration
     * * **loadProgress**: fired while the video data are downloading
     * * **seek**: fired when the video seeks from the current time to another
     * * **setVolume**: fired when the video changes volume
     * * **buffering**: fired when the video starts buffering (an playback stops)
     * * **firstPlay**: fired when the video starts to play for the first time
     * (the stop() method reset the first play, the successive play() fires a firstPlay event )
     *
     * *The method supports also every Provider specific events (ex. VimeoProvider **bufferend**)*
     * @param {String} event the Event name (see supported events)
     * @param {Function} callback Function to call when the event is fired
     * @return {Promise<void>}
     * @example
     * const callback = (evt) => {
     *     // Do stuff..
     * };
     * player.on('play', callback);
     */
    @ValidateArg('string')
    @ValidateArg('function', 1)
    on(event, callback) {
        return this.player.on(event, callback);
    }

    /**
     * Remove a listener from an event
     *
     * @param {String} event name of the event (see [on]{@link Player#on} supported events)
     * @param {Function} callback method to remove
     * @return {Promise<void>}
     * @example
     * player.off('play', callback);
     */
    @ValidateArg('string')
    @ValidateArg('function', 1)
    off(event, callback) {
        return this.player.off(event, callback);
    }

    /**
     * Play the video.
     * @return {Promise<void>}
     * @example
     * player.play();
     */
    play() {
        return this.player.play();
    }

    /**
     * Pause the video
     * @return {Promise<void>}
     * @example
     * player.pause();
     */
    pause() {
        return this.player.pause();
    }

    /**
     * Stop the video (restarting from 0s)
     * @return {Promise<void>}
     * @example
     * player.stop();
     */
    stop() {
        return this.player.stop();
    }

    /**
     * Mute the video
     * @return {Promise<void>}
     * @example
     * player.mute();
     */
    mute() {
        return this.player.mute();
    }

    /**
     * Unmute the video
     * @return {Promise<void>}
     * @example
     * player.unmute();
     */
    unmute() {
        return this.player.unmute();
    }

    /**
     * Switch between muted and unmuted
     * @return {Promise<void>}
     * @example
     * player.toggleMute();
     */
    toggleMute() {
        return this.player.toggleMute();
    }

    /**
     * Enter/exit in fullscreen mode
     * @return {Promise<void>}
     * @example
     * player.toggleFullScreen();
     */
    toggleFullScreen() {
        return this.player.toggleFullScreen();
    }

    /**
     * Play/Pause the video
     * @return {Promise<void>}
     * @example
     * player.togglePlay();
     */
    togglePlay() {
        return this.player.togglePlay();
    }

    /**
     * Set the volume level to the given value.
     *
     * @param {Number} volumeLevel Value between 0 and 1.
     * @return {Promise<void>}
     * @example
     * player.setVolume(1); // Max volume
     * player.setVolume(0); // Muted
     */
    @ValidateArg('number')
    setVolume(volumeLevel) {
        return this.player.setVolume(volumeLevel);
    }

    /**
     * Go forward in the video by the specified value (in seconds)
     *
     * @param {Number} seconds seconds to forward
     * @return {Promise<void>}
     * @example
     * player.forward(15);
     */
    @ValidateArg('number')
    forward(seconds) {
        return this.player.forward(seconds);
    }

    /**
     * Go back in the video by the specified value (in seconds)
     *
     * @param {Number} seconds seconds to rewind
     * @return {Promise<void>}
     * @example
     * player.rewind(15);
     */
    @ValidateArg('number')
    rewind(seconds) {
        return this.player.rewind(seconds);
    }

    /**
     * Set the current time of the video at the specified value (in seconds)
     *
     * @param {Number} seconds seconds to seek
     * @return {Promise<void>}
     * @example
     * player.seek(45);
     */
    @ValidateArg('number')
    seek(seconds) {
        return this.player.seek(seconds);
    }

    /**
     * Destroy the Player (it will remove the active instance of the player and the
     * player element in the DOM).
     *
     * @return {Promise<void>}
     * @example
     * player.clear();
     */
    clear() {
        this.player.clear();
        this.player = null;
    }

    /**
     * Directly download the video or returns the video Url
     * @return {Promise<void|string>}
     * @example
     * player.download();
     */
    download() {
        return this.player.download();
    }

    /**
     * Get the list of all the active listeners on the player, with the
     *  added functions
     *
     * @return {Object<string, Array<function>>}
     * @example
     * player.getListeners();
     * /* {
     * *    play: [Function, Function, ...],
     * *    pause: [Function, ...],
     * *  }
     *
     */
    getListeners() {
        return this.player.listeners;
    }
}

export default Player;
