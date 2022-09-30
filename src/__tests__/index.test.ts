import { URLPattern } from '..';

describe('Тестики', () => {
    it('парсим статику', () => {
        const pattern = new URLPattern('/test/');

        expect(pattern.test('/test/')).toBe(true);
        expect(pattern.build()).toBe('/test/');
    });

    it('опциональный параметр', () => {
        const pattern = new URLPattern('/test(/:hello)/');

        expect(pattern.test('/test/')).toBe(true);
        expect(pattern.test('/test/kek/')).toBe(true);
        expect(pattern.build()).toBe('/test/');
        expect(pattern.build({ hello: 'kek' })).toBe('/test/kek/');
    });

    it('с параметром', () => {
        const pattern = new URLPattern('/test/:hello/');

        expect(pattern.test('/test/kek/')).toBe(true);
        expect(pattern.build({ hello: 'kek' })).toBe('/test/kek/');
    });

    it('с умным параметром', () => {
        const pattern = new URLPattern('/test/st-<:hello>/');

        expect(pattern.test('/test/st-kek/')).toBe(true);
        expect(pattern.build({ hello: 'kek' })).toBe('/test/st-kek/');
    });

    it('с опциональным умным параметром', () => {
        const pattern = new URLPattern('/test(/st-<:hello>)/');

        expect(pattern.test('/test/st-kek/')).toBe(true);
        expect(pattern.test('/test/')).toBe(true);
        expect(pattern.build()).toBe('/test/');
        expect(pattern.build({ hello: 'kek' })).toBe('/test/st-kek/');
    });
});
