import loadStyle from './';

let error = false;

describe('loadStyle test', () => {
    it('should be present a head link', () => {
        loadStyle('https://releases.flowplayer.org/7.2.7/skin/skin.css');
        expect(document.head.getElementsByTagName('link').length).toBe(1);
        expect(document.head.getElementsByTagName('link')[0].href).toEqual('https://releases.flowplayer.org/7.2.7/skin/skin.css');
    });

    it('should resolve a promise on success', async () => {
        loadStyle('https://releases.flowplayer.org/7.2.7/skin/skin.css').then(() => {
            expect(error).toBeFalsy();
        });
    });

    it('should reject a promise on error', async () => {
        loadStyle('abcd').then(() => {
        }).catch((err) => {
            error = true;
            expect(error).toBeTruthy();
        });
    });
});
