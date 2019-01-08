import { getDomNode, Unsupported } from './index';

describe('getDomNode', () => {
    document.body.innerHTML = `
        <div id="element">test</div>
    `;

    it('should get the domNode from a passed dom id', () => {
        const node = getDomNode('element');
        expect(node).toBeInstanceOf(HTMLDivElement);
    });

    it('should get the domNode from a passed dom id starting with #', () => {
        const node = getDomNode('#element');
        expect(node).toBeInstanceOf(HTMLDivElement);
    });

    it('should get the domNode from a passed domNode', () => {
        const el = document.getElementById('element');
        const node = getDomNode(el);
        expect(node).toBeInstanceOf(HTMLDivElement);
    });
});

@Unsupported('not', 'unsupported')
class TestClass {
    supported() {
        console.log('supported method called');
    }

    @Unsupported()
    unsupportedMethod() {
        console.log('unsupported method called');
    }
}

describe('Unsupported', () => {
    let warnSpy;
    let logSpy;
    let Instance;
    beforeEach(() => {
        jest.restoreAllMocks();
        warnSpy = jest.spyOn(console, 'warn');
        logSpy = jest.spyOn(console, 'log');
        Instance = new TestClass();
    });

    it('should warn when an unsupported method is called', () => {
        Instance.not();
        Instance.unsupported();
        expect(warnSpy).toHaveBeenCalledTimes(2);
    });

    it('should correctly call a supported method', () => {
        Instance.supported();
        expect(logSpy).toHaveBeenCalled();
    });

    it('should warn when an unsupported method is defined in the class prototype but marked as @Unsupported()', () => {
        Instance.unsupportedMethod();
        expect(warnSpy).toHaveBeenCalled();
        expect(logSpy).not.toHaveBeenCalled();
    });
});
