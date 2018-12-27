import Player from '../Player';
import { ValidateArg, ValidateObj } from '../Validation';

class VideoPlayer {
    defaults = {
        idPrefix: 'video_',
    };

    playerInstances = {};

    generateId(idOrUrl, affix = 1) {
        const { idPrefix } = this.defaults;
        const id = `${idPrefix}${idOrUrl}_${affix}`;
        if (Object.keys(this.playerInstances).includes(id)) {
            return this.generateId(idOrUrl, affix + 1);
        }
        return id;
    }

    /**
     * @param playerInitOptions
     * @param playerInitOptions.videoId Video id
     * @param playerInitOptions.url Video url
     * @param playerInitOptions.provider Player Provider
     * @return {Player}
     */
    @ValidateObj('videoId|url', 'domNode')
    createPlayer(playerInitOptions) {
        const provider = playerInitOptions.provider || this.defaults.provider;
        if (!provider) {
            throw new Error('cannot create player: provider or VideoPlayer.default.provider is required!');
        }
        const playerOptions = Object.assign({}, Object.keys(playerInitOptions).filter(k => k !== 'events').reduce((o, k) => {
            o[k] = playerInitOptions[k];
            return o;
        }, {}), { provider });
        const id = this.generateId(playerInitOptions.videoId || playerInitOptions.url);
        const player = new Player(playerOptions, id);
        this.playerInstances[id] = player;
        if (playerInitOptions.events && Object.keys(playerInitOptions.events).length) {
            Object.keys(playerInitOptions.events).forEach((eventName) => {
                this.addEventListener(id, eventName, playerInitOptions.events[eventName]);
            });
        }
        return player;
    }

    /**
     * @param playerId
     * @return Player
     */
    @ValidateArg()
    getPlayer(playerId = 'ss') {
        if (!Object.keys(this.playerInstances).includes(playerId)) {
            throw new Error(`Player with id ${playerId} not found`);
        }
        return this.playerInstances[playerId];
    }

    getPlayers(asArray = false) {
        return asArray ? Object.values(this.playerInstances) : this.playerInstances;
    }

    addEventListener(playerId, event, cb) {
        const player = this.getPlayer(playerId);
        return player.on(event, cb);
    }

    removeEventListener(playerId, event, cb) {
        const player = this.getPlayer(playerId);
        return player.off(event, cb);
    }
}

export default new VideoPlayer();