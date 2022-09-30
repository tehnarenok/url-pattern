import { URLPattern } from '../URLPattern';
import { expectParseResults } from './expectParseResults';

describe('static routes', () => {
    describe('test', () => {
        it('one route', () => {
            const urlPattern = new URLPattern('/test/app');

            expect(urlPattern.test('/test/app/')).toBe(true);
            expect(urlPattern.test('/test/app')).toBe(true);
            expect(urlPattern.test('/test/hello')).toBe(false);
        });

        it('some routes', () => {
            const urlPattern = new URLPattern('/test/app', '/app/test');

            expect(urlPattern.test('/test/app/')).toBe(true);
            expect(urlPattern.test('/test/app')).toBe(true);
            expect(urlPattern.test('/test/hello')).toBe(false);

            expect(urlPattern.test('/app/test/')).toBe(true);
            expect(urlPattern.test('/app/test')).toBe(true);
            expect(urlPattern.test('/app/hello')).toBe(false);
        });

        it('with hash', () => {
            const urlPattern = new URLPattern('/test/app');

            expect(urlPattern.test('/test/app/#app')).toBe(true);
        });

        it('with search', () => {
            const urlPattern = new URLPattern('/test/app');

            expect(urlPattern.test('/test/app/?hello=app')).toBe(true);
        });

        it('with search and hash', () => {
            const urlPattern = new URLPattern('/test/app');

            expect(urlPattern.test('/test/app/#app?hello=app')).toBe(true);
        });
    });

    describe('build', () => {
        it('one route', () => {
            const urlPattern = new URLPattern('/test/app');

            expect(urlPattern.build()).toBe('/test/app');
        });

        it('some routes', () => {
            const urlPattern = new URLPattern('/test/app', '/app/test');

            expect(urlPattern.build()).toBe('/test/app');
        });

        it('with search', () => {
            const urlPattern = new URLPattern('/test/app');

            const url = urlPattern.build({}, { hello: 'app' });

            expect(url).toBe('/test/app?hello=app');
        });

        it('with multiply search', () => {
            const urlPattern = new URLPattern('/test/app');

            const url = urlPattern.build({}, { hello: ['app', '1'] });

            expect(url).toBe('/test/app?hello=app&hello=1');
        });

        it('with hash', () => {
            const urlPattern = new URLPattern('/test/app');

            const url = urlPattern.build({}, {}, 'hello');

            expect(url).toBe('/test/app#hello');
        });

        it('with hash and search', () => {
            const urlPattern = new URLPattern('/test/app');

            const url = urlPattern.build({}, { hello: 'app' }, 'hello');

            expect(url).toBe('/test/app?hello=app#hello');
        });
    });

    describe('parse', () => {
        it('only pathname', () => {
            const urlPattern = new URLPattern('/test/app');

            const parseResult = urlPattern.parse('/test/app');

            expectParseResults(parseResult, {});
        });

        it('with search', () => {
            const urlPattern = new URLPattern('/test/app');

            const parseResult = urlPattern.parse('/test/app?hello=app');

            expectParseResults(parseResult, {
                search: {
                    hello: 'app'
                }
            });
        });

        it('with multiply search', () => {
            const urlPattern = new URLPattern('/test/app');

            const parseResult = urlPattern.parse('/test/app?hello=app&hello=1');

            expectParseResults(parseResult, {
                search: {
                    hello: ['app', '1']
                }
            });
        });

        it('with hash', () => {
            const urlPattern = new URLPattern('/test/app');

            const parseResult = urlPattern.parse('/test/app#hello');

            expectParseResults(parseResult, {
                hash: 'hello'
            });
        });

        it('with search hash 1', () => {
            const urlPattern = new URLPattern('/test/app');

            const parseResult = urlPattern.parse('/test/app?hello=app#hello');

            expectParseResults(parseResult, {
                search: {
                    hello: 'app'
                },
                hash: 'hello'
            });
        });
    });
});
