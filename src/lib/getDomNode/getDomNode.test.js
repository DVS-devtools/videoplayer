import getDomNode from './index';

describe('getDomNode', () => {
    document.body.innerHTML = `
        <div id="element">test</div>
        <div class="test">first</div>
        <div class="test">second</div>
    `;

    // it('should get the domNode from a passed dom id', () => {
    //     const node = getDomNode('element');
    //     expect(node).toBeInstanceOf(HTMLDivElement);
    // });

    it('should get the domNode from a passed dom id starting with #', () => {
        const node = getDomNode('#element');
        expect(node).toBeInstanceOf(HTMLDivElement);
    });

    it('should get the domNode from a passed domNode', () => {
        const el = document.getElementById('element');
        const node = getDomNode(el);
        expect(node).toBeInstanceOf(HTMLDivElement);
    });

    it('should get the first matched element', () => {
        const node = getDomNode('.test');
        expect(node.innerHTML).toEqual('first');
    });
});
