import { ValidateArg, ValidateObj, ValidateOptionalArg } from './index';

class TestClass {
    @ValidateArg('string')
    methodOne(opts) {
        return opts;
    }

    @ValidateArg('string')
    @ValidateArg('number', 1)
    methodTwo(opts, opts2) {
        return {
            one: opts,
            two: opts2,
        };
    }

    @ValidateArg('string')
    @ValidateOptionalArg('number', 1)
    methodOptional(required, optional) {
        return Object.assign({required}, optional && {optional});
    }

    @ValidateObj({
        foo: 'string',
        bar: 'boolean|number'
    })
    methodObject(obj) {
        return obj;
    }

    @ValidateObj({
        foo: 'string'
    }, 0, {foo: 'bar'})
    methodObjectAlias(obj) {
        return obj;
    }
}

describe('ValidateArg', () => {
    let TestInstance;
    beforeEach(() => {
        TestInstance = new TestClass();
    });

    it('should return what the original method returns', () => {
        expect(TestInstance.methodOne('test')).toEqual('test');
    });

    it('should throw if the typeof of the param does not match the one given', () => {
        expect(() => TestInstance.methodOne(123)).toThrow();
    });

    it('should throw if no params are passed', () => {
        expect(() => TestInstance.methodOne()).toThrow();
    });

    it('should throw if passed params are less than expected params', () => {
        expect(() => TestInstance.methodTwo('string')).toThrow();
    });

    it('should check multiple params with multiple decorators', () => {
        expect(TestInstance.methodTwo('test', 2)).toEqual({ one: 'test', two: 2 });
    });
});

describe('ValidateOptionalArg', () => {
    let TestInstance;
    beforeEach(() => {
        TestInstance = new TestClass();
    });

    it('should return what the original method returns', () => {
        expect(TestInstance.methodOptional('test', 123)).toEqual({required: 'test', optional: 123});
        expect(TestInstance.methodOptional('test')).toEqual({required: 'test'});
    });

    it('should throw if the optional arg is passed but the typeof does not match', () => {
        expect(() => TestInstance.methodOptional('test', 'foo')).toThrow();
    });
});

describe('ValidateObj', () => {
    let TestInstance;
    beforeEach(() => {
        TestInstance = new TestClass();
    });

    it('should return what the original method returns', () => {
        const obj1 = {foo: 'bar', bar: true};
        const obj2 = {foo: 'bar', bar: 1};
        expect(TestInstance.methodObject(obj1)).toEqual(obj1);
        expect(TestInstance.methodObject(obj2)).toEqual(obj2);
    });

    it('should throw when the param is not an object', () => {
        expect(() => TestInstance.methodObject('string')).toThrow();
    });

    it('should throw when a key type does not match the schema', () => {
        expect(() => TestInstance.methodObject({foo: 123, bar: true})).toThrow();
    });

    it('should throw when a key is omitted but defined in the schema', () => {
        expect(() => TestInstance.methodObject({foo: 'bar'})).toThrow();
    });

    it('should return what the original method returns if the key is not found but has an alias', () => {
        expect(TestInstance.methodObjectAlias({bar: 'baz'})).toEqual({bar: 'baz'});
    });

    it('should throw when a key is omitted and its alias type does not match the original key schema', () => {
        expect(() => TestInstance.methodObjectAlias({bar: 123})).toThrow();
    });
});
