import loadstyle from './';

let error = false;

describe('loadstyle test', () => {
    it('should be present a head link', () => {
        loadstyle('https://releases.flowplayer.org/7.2.7/skin/skin.css');
        expect(document.head.getElementsByTagName('link').length).toBe(1);
        expect(document.head.getElementsByTagName('link')[0].href).toEqual('https://releases.flowplayer.org/7.2.7/skin/skin.css');
    });

    it('should resolve a promise on success', async () => {
        loadstyle('https://releases.flowplayer.org/7.2.7/skin/skin.css').then(() => {
            expect(error).toBeFalsy();
        });
    });

    it('should reject a promise on error', async () => {
        loadstyle('abcd').then(() => {
        }).catch((err) => {
            error = true;
            expect(error).toBeTruthy();
        });
    });
});