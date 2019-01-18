import TestProvider from '../Provider/testProvider';
import DailymotionProvider from '../Provider/Dailymotion';
import FlowplayerProvider from '../Provider/Flowplayer';
import VimeoProvider from '../Provider/Vimeo';
import { ValidateArg } from '../Validation';

/**
 * This class will provide you a player instance. An instance is indipendent
 * by all the other player instances, this does it mean that you can manage more
 * players inside a single page, all managed indipendently.
 * How to manage the instances is your own choice .
 * You can use your own players manager, creating your interface and manage it in
 * the way you want, or you can use the VideoPlayer interface,
 * that provides you a faster and easier way to manage more players in a single page. Please
 * remember that if you are using the VideoPlayer class you need to interact directly with that.
 *
 * You can read the full VideoPlayer documentation here: LINK_TO_VIDEOPLAYER_CLASS
 *
 */
class Player {
    id = null;

    player = null;

    /**
     * Creates an instance of Player.
     * @param {Object} options configuration options ( provider, videoId, url, domNode... )
     * @param {String} id Id of the player to associate inside the dom
     */
    constructor(options, id) {
        this.id = id;

        if (!options.provider || typeof options.provider !== 'string') {
            throw new Error('Invalid Provider');
        }

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
        default:
            this.player = null;
            throw new Error(`Unsupported Provider ${options.provider}`);
        }
    }

    /**
     * Add listener to event.
     * Note that a same event can manage more listeners.
     *
     * Here is the list of the accepted listeners:
     * - play;
     * - pause;
     * - stop;
     * - mute;
     * - unmute;
     * - enterFullScreen;
     * - exitFullScreen;
     * - setVolume;
     * - forward;
     * - rewind;
     * - seek;
     * - destroy;
     *
     * Please remember to store the function inside a variable, in order to call the off method
     * to remove the listener on a precise event
     *
     * @param {String} event name of the event (see list of compatible listeners)
     * @param {Function} cb method to call when the event is fired
     * @return {Promise<void>}
     * @memberOf Player
     */
    @ValidateArg('string')
    @ValidateArg('function', 1)
    on(event, cb) {
        return this.player.on(event, cb);
    }

    /**
     * Remove Listener to event (you can have a look at the "on" method to see a full list of
     * the compatible listeners);
     *
     * @param {String} event name of the event (see list of compatible listeners)
     * @param {Function} cb method to remove
     * @return {Promise<void>}
     * @memberOf Player
     */
    @ValidateArg('string')
    @ValidateArg('function', 1)
    off(event, cb) {
        return this.player.off(event, cb);
    }

    /**
     * Play a video.
     * @return {Promise<void>}
     * @memberOf Player
     */
    play() {
        return this.player.play();
    }

    /**
     * Pause a video.
     * @return {Promise<void>}
     * @memberOf Player
     */
    pause() {
        return this.player.pause();
    }

    /**
     * Stop the player (restarting from 0s).
     * @return {Promise<void>}
     * @memberOf Player
     */
    stop() {
        return this.player.stop();
    }

    /**
     * Set the attribute muted to true.
     * @return {Promise<void>}
     * @memberOf Player
     */
    mute() {
        return this.player.mute();
    }

    /**
     * Set the attribute muted to false
     * @return {Promise<void>}
     * @memberOf Player
     */
    unmute() {
        return this.player.unmute();
    }

    /**
     * Switch between muted and unmuted
     * @return {Promise<void>}
     * @memberOf Player
     */
    toggleMute() {
        return this.player.toggleMute();
    }

    /**
     * Enter/exit in fullscreen mode
     * @return {Promise<void>}
     * @memberOf Player
     */
    toggleFullScreen() {
        return this.player.toggleFullScreen();
    }

    /**
     * Play/Pause the video
     * @return {Promise<void>}
     * @memberOf Player
     */
    togglePlay() {
        return this.player.togglePlay();
    }

    /**
     * Set the volume level to the given value.
     *
     * @param {Number} volumeLevel Value between 0 and 1, all other value are not accepted.
     * @return {Promise<void>}
     * @memberOf Player
     */
    @ValidateArg('number')
    setVolume(volumeLevel) {
        return this.player.setVolume(volumeLevel);
    }

    /**
     * Go ahead in the video by the specified value (in seconds)
     *
     * @param {Number} seconds
     * @return {Promise<void>}
     * @memberOf Player
     */
    @ValidateArg('number')
    forward(seconds) {
        return this.player.forward(seconds);
    }

    /**
     * Go back in the video by the specified value (in seconds)
     *
     * @param {Number} seconds
     * @return {Promise<void>}
     * @memberOf Player
     */
    @ValidateArg('number')
    rewind(seconds) {
        return this.player.rewind(seconds);
    }

    /**
     * Set the current time of the video at the specified value (in seconds)
     *
     * @param {*} seconds
     * @return {Promise<void>}
     * @memberOf Player
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
     * @memberOf Player
     */
    clear() {
        this.player.clear();
        this.player = null;
    }

    /**
     * Directly download the video or returns the video Url
     * @return {Promise<void|string>}
     */
    download() {
        return this.player.download();
    }

    /**
     * Get the list of all the active listeners on the player, with the
     *  added function
     *
     * @return {Object<string, Array<function>>}
     * @memberOf Player
     */
    getListeners() {
        return this.player.listeners();
    }
}

export default Player;
