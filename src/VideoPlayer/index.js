import Player from '../Player';
import { ValidateArg, ValidateObj } from '../Validation';

/**
 * @class VideoPlayer
 */
class VideoPlayer {
    defaults = {
        idPrefix: 'video_',
        provider: null,
        forward: 15,
        rewind: 15,
    };

    /**
     * @ignore
     * @type {Object.<string, Player>}
     */
    playerInstances = {};

    /**
     * @ignore
     * generate an unique id
     * @param idOrUrl
     * @param affix
     * @return {string}
     */
    generateId(idOrUrl, affix = 1) {
        const { idPrefix } = this.defaults;
        const id = `${idPrefix}${idOrUrl}_${affix}`;
        if (Object.keys(this.playerInstances).includes(id)) {
            return this.generateId(idOrUrl, affix + 1);
        }
        return id;
    }

    /**
     * Create a new player
     * @memberOf VideoPlayer
     * @param playerInitOptions
     * @param playerInitOptions.videoId Video id
     * @param playerInitOptions.url Video url
     * @param playerInitOptions.provider Player Provider
     * @example
     * VideoPlayer.createPlayer({
     *     domNode: '#el',
     *     videoId: 'sdHg79',
     *     provider: 'vimeo'
     * });
     * @return {Player}
     */
    @ValidateObj({ domNode: 'string', videoId: 'string|number' }, 0, { videoId: 'url' })
    createPlayer(playerInitOptions) {
        // Get the requested provider
        const provider = playerInitOptions.provider || this.defaults.provider;
        if (!provider) {
            throw new Error('cannot create player: provider or VideoPlayer.default.provider is required!');
        }
        // Filter the given options, remove "events", they are registered after
        const playerOptions = Object.assign({}, Object.keys(playerInitOptions).filter(k => k !== 'events').reduce((o, k) => {
            o[k] = playerInitOptions[k];
            return o;
        }, {}), { provider });
        // Generate the unique id of the Player
        const id = this.generateId(playerInitOptions.videoId || playerInitOptions.url);
        // Create the Player
        const player = new Player(playerOptions, id);
        // Save the created Player by its id
        this.playerInstances[id] = player;
        // Register all passed events
        if (playerInitOptions.events && Object.keys(playerInitOptions.events).length) {
            Object.keys(playerInitOptions.events).forEach((eventName) => {
                this.addEventListener(id, eventName, playerInitOptions.events[eventName]);
            });
        }
        return player;
    }

    /**
     * Get a previously created Player instance from its id
     * @param playerId
     * @example
     * VideoPlayer.getPlayer('video_sdHg79_1');
     * @return {Player}
     */
    @ValidateArg('string')
    getPlayer(playerId) {
        if (!Object.keys(this.playerInstances).includes(playerId)) {
            throw new Error(`Player with id ${playerId} not found`);
        }
        return this.playerInstances[playerId];
    }

    /**
     * Get all created Player instances keyed by their id
     * @example
     * VideoPlayer.getPlayers()
     * // {
     * //   video_sdHg79_1: Player
     * // }
     *
     * @return {Object.<string, Player>}
     */
    getPlayers() {
        return this.playerInstances;
    }

    /**
     * Get an array of all created Player
     * @example
     * VideoPlayer.getPlayersAsArray()
     * // [Player]
     * @return {Player[]}
     */
    getPlayersAsArray() {
        return Object.values(this.playerInstances);
    }

    /**
     * Add an event listener cb called when the specified event is fired
     * @param playerId
     * @param event
     * @param cb
     * @return cb
     */
    addEventListener(playerId, event, cb) {
        return this.getPlayer(playerId).on(event, cb);
    }

    /**
     * Remove a previously registered cb to an event
     * @param playerId
     * @param event
     * @param cb
     */
    removeEventListener(playerId, event, cb) {
        return this.getPlayer(playerId).off(event, cb);
    }

    /**
     * Destroys a Player instance
     * @param playerId
     * @return {*}
     */
    clear(playerId) {
        const player = this.getPlayer(playerId);
        delete this.playerInstances[playerId];
        return player.clear();
    }

    /**
     * Destroys all Player instances
     */
    clearAll() {
        Object.keys(this.playerInstances).forEach(playerId => this.clear(playerId));
        this.playerInstances = {};
    }

    /**
     * Send play command to the Player
     * @param playerId
     * @return {*|void|Promise<void>}
     */
    play(playerId) {
        return this.getPlayer(playerId).play();
    }

    /**
     * Send pause command to the Player
     * @param playerId
     * @return {*|void|never}
     */
    pause(playerId) {
        return this.getPlayer(playerId).pause();
    }

    /**
     * Send stop command to the Player
     * @param playerId
     * @return {*|void|never}
     */
    stop(playerId) {
        return this.getPlayer(playerId).stop();
    }

    /**
     * Send mute command to the Player
     * @param playerId
     * @return {*|never}
     */
    mute(playerId) {
        return this.getPlayer(playerId).mute();
    }

    /**
     * Send unmute command to the Player
     * @param playerId
     * @return {*|never}
     */
    unmute(playerId) {
        return this.getPlayer(playerId).unmute();
    }

    /**
     * Send toggleMute command to the Player
     * @param playerId
     * @return {*|never}
     */
    toggleMute(playerId) {
        return this.getPlayer(playerId).toggleMute();
    }

    /**
     * Send toggleFullscreen command to the Player
     * @param playerId
     * @return {*|never}
     */
    toggleFullscreen(playerId) {
        return this.getPlayer(playerId).toggleFullscreen();
    }

    /**
     * Send setVolume command to the Player
     * @param playerId
     * @param volume
     * @return {*}
     */
    @ValidateArg('string')
    @ValidateArg('number', 1)
    setVolume(playerId, volume) {
        return this.getPlayer(playerId).setVolume(volume);
    }

    /**
     * Send seek command to the Player
     * @param playerId
     * @param seconds
     * @return {*}
     */
    @ValidateArg('string')
    @ValidateArg('number', 1)
    seek(playerId, seconds) {
        return this.getPlayer(playerId).seek(seconds);
    }

    /**
     * Send forward command to the Player
     * @param playerId
     * @param seconds
     * @return {*|void}
     */
    @ValidateArg('string')
    @ValidateArg('number', 1)
    forward(playerId, seconds) {
        return this.getPlayer(playerId).forward(seconds || this.defaults.forward);
    }

    /**
     * Send rewind command to the Player
     * @param playerId
     * @param seconds
     * @return {*}
     */
    @ValidateArg('string')
    @ValidateArg('number', 1)
    rewind(playerId, seconds) {
        return this.getPlayer(playerId).rewind(seconds || this.defaults.rewind);
    }
}

export default new VideoPlayer();