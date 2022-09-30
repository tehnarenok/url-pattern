import { URLPattern } from '../URLPattern';
import { expectParseResults } from './expectParseResults';

describe('with smart params', () => {
    describe('test', () => {
        it('one route', () => {
            const urlPattern = new URLPattern('/test/id-<:id>/');

            expect(urlPattern.test('/test/id-app/')).toBe(true);
            expect(urlPattern.test('/test/')).toBe(false);
        });

        it('some routes', () => {
            const urlPattern = new URLPattern('/test/id-<:id>/', '/app-<:id>/test/');

            expect(urlPattern.test('/test/id-app/')).toBe(true);
            expect(urlPattern.test('/app-app/test/')).toBe(true);
            expect(urlPattern.test('/app/test123/')).toBe(false);
            expect(urlPattern.test('/test/')).toBe(false);
        });
    });

    describe('build', () => {
        it('one route', () => {
            const urlPattern = new URLPattern('/test/id-<:id>/');

            expect(urlPattern.build({ id: 'app' })).toBe('/test/id-app/');
        });

        it('some routes', () => {
            const urlPattern = new URLPattern('/test/id-<:id>/', '/app-<:appId>/test/');

            expect(urlPattern.build({ id: 'app' })).toBe('/test/id-app/');
            expect(urlPattern.build({ appId: 'app' })).toBe('/app-app/test/');
        });
    });

    describe('parse', () => {
        it('one route', () => {
            const urlPattern = new URLPattern('/test/id-<:id>/');

            const parseResult = urlPattern.parse('/test/id-app/');

            expectParseResults(parseResult, {
                params: {
                    id: 'app'
                }
            });
        });

        it('some routes', () => {
            const urlPattern = new URLPattern('/test/id-<:id>/', '/app-<:appId>/test/');

            const parseResults = [
                urlPattern.parse('/test/id-app/'),
                urlPattern.parse('/app-app/test/')
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
    });
});
