import { URLPattern } from '../URLPattern';
import { expectParseResults } from './expectParseResults';

describe('with params', () => {
    describe('test', () => {
        it('one route', () => {
            const urlPattern = new URLPattern('/test/:id/');

            expect(urlPattern.test('/test/app/')).toBe(true);
            expect(urlPattern.test('/test/')).toBe(false);
        });

        it('some routes', () => {
            const urlPattern = new URLPattern('/test/:id/', '/:id/test/');

            expect(urlPattern.test('/test/app/')).toBe(true);
            expect(urlPattern.test('/app/test/')).toBe(true);
            expect(urlPattern.test('/app/test123/')).toBe(false);
            expect(urlPattern.test('/test/')).toBe(false);
        });

        it('some params', () => {
            const urlPattern = new URLPattern('/test/:id/hello/:app/');

            expect(urlPattern.test('/test/app/hello/yandex/')).toBe(true);
        });
    });

    describe('build', () => {
        it('one route', () => {
            const urlPattern = new URLPattern('/test/:id/');

            expect(urlPattern.build({ id: 'app' })).toBe('/test/app/');
        });

        it('some routes', () => {
            const urlPattern = new URLPattern('/test/:id/', '/:appId/test/');

            expect(urlPattern.build({ id: 'app' })).toBe('/test/app/');
            expect(urlPattern.build({ appId: 'app' })).toBe('/app/test/');
        });

        it('some params', () => {
            const urlPattern = new URLPattern('/test/:id/hello/:app/');

            expect(urlPattern.build({
                app: 'yandex',
                id: '12312'
            })).toBe('/test/12312/hello/yandex/');
        });
    });

    describe('parse', () => {
        it('one route', () => {
            const urlPattern = new URLPattern('/test/:id/');

            const parseResult = urlPattern.parse('/test/app/');

            expectParseResults(parseResult, {
                params: {
                    id: 'app'
                }
            });
        });

        it('some routes', () => {
            const urlPattern = new URLPattern('/test/:id/', '/:appId/test/');

            const parseResults = [
                urlPattern.parse('/test/app/'),
                urlPattern.parse('/app/test/')
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
        });

        it('some params', () => {
            const urlPattern = new URLPattern('/test/:id/hello/:app/');

            const parseResult = urlPattern.parse('/test/12312/hello/yandex/');

            expectParseResults(parseResult, {
                params: {
                    app: 'yandex',
                    id: '12312'
                }
            });
        });
    });
});
