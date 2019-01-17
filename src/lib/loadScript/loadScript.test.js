import loadScript from './';

let error = false;

fdescribe('loadScript test', () => {
    beforeEach(() => {
    });

    it('should be present a head link', () => {
        loadScript('https://releases.flowplayer.org/7.2.7/flowplayer.min.js');
        expect(document.head.getElementsByTagName('script').length).toBe(1);
        expect(document.head.getElementsByTagName('script')[0].src).toEqual('https://releases.flowplayer.org/7.2.7/flowplayer.min.js');
    });

    it('should resolve a promise on success', async () => {
        loadScript('https://releases.flowplayer.org/7.2.7/flowplayer.min.js').then((p1, p2) => {
            expect(error).toBeFalsy();
        });
    });

    it('should reject a promise on error', () => {
        loadScript('abcd').catch((err) => {
           error= true;
           expect(error).toBeTruthy();
        });
    });
});
