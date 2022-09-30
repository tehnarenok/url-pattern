import { URLPattern } from '../URLPattern';
import { expectParseResults } from './expectParseResults';

describe('with params', () => {
    describe('test', () => {
        it('one route', () => {
            const urlPattern = new URLPattern('/test(/:id)/');

            expect(urlPattern.test('/test/app/')).toBe(true);
            expect(urlPattern.test('/test/')).toBe(true);
        });

        it('some routes', () => {
            const urlPattern = new URLPattern('/test(/:id)/', '(/:id)/test/');

            expect(urlPattern.test('/test/app/')).toBe(true);
            expect(urlPattern.test('/app/test/')).toBe(true);
            expect(urlPattern.test('/app/test123/')).toBe(false);
            expect(urlPattern.test('/test/')).toBe(true);
        });

        it('between non optional', () => {
            const urlPattern = new URLPattern('/test(/:id)/hello/');

            expect(urlPattern.test('/test/app/hello/')).toBe(true);
            expect(urlPattern.test('/test/hello/')).toBe(true);
        });
    });

    describe('build', () => {
        it('one route', () => {
            const urlPattern = new URLPattern('/test(/:id)/');

            expect(urlPattern.build({ id: 'app' })).toBe('/test/app/');
            expect(urlPattern.build()).toBe('/test/');
        });

        it('between non optional', () => {
            const urlPattern = new URLPattern('/test(/:id)/hello/');

            expect(urlPattern.build({ id: 'app' })).toBe('/test/app/hello/');
            expect(urlPattern.build()).toBe('/test/hello/');
        });

        it('some routes', () => {
            const urlPattern = new URLPattern('/test(/:id)/', '(/:appId)/test/');

            expect(urlPattern.build({ id: 'app' })).toBe('/test/app/');
            expect(urlPattern.build({ appId: 'app' })).toBe('/app/test/');
            expect(urlPattern.build()).toBe('/test/');
        });
    });

    describe('parse', () => {
        it('one route', () => {
            const urlPattern = new URLPattern('/test(/:id)/');

            const parseResults = [
                urlPattern.parse('/test/app/'),
                urlPattern.parse('/test/')
            ];

            expectParseResults(parseResults[0], {
                params: {
                    id: 'app'
                }
            });

            expectParseResults(parseResults[1], {});
        });

        it('some routes', () => {
            const urlPattern = new URLPattern('/test(/:id)/', '(/:appId)/test/');

            const parseResults = [
                urlPattern.parse('/test/app/'),
                urlPattern.parse('/app/test/'),
                urlPattern.parse('/test/')
            ];

            expectParseResults(parseResults[0], {
                params: {
                    id: 'app'
                }
            });

            expectParseResults(parseResults[1], {
                params: {
                    appId: 'app'
                }
            });

            expectParseResults(parseResults[2], {});
        });

        it('between non optional', () => {
            const urlPattern = new URLPattern('/test(/:id)/hello/');

            const parseResults = [
                urlPattern.parse('/test/app/hello/'),
                urlPattern.parse('/test/hello/')
            ];

            expectParseResults(parseResults[0], {
                params: {
                    id: 'app'
                }
            });

            expectParseResults(parseResults[1], {});
        });
    });
});
