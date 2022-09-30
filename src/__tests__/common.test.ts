import { URLPattern } from '../URLPattern';
import { expectParseResults } from './expectParseResults';

const urls: Array<{
    url: string,
    params: Record<string, string>,
    search?: Record<string, string>,
    hash?: string
}> = [
    {
        url: '/dubai/jobs/',
        params: {
            region: 'dubai'
        }
    },
    {
        url: '/dubai/jobs/?min=5000',
        params: {
            region: 'dubai'
        },
        search: {
            min: '5000'
        }
    },
    {
        url: '/dubai/jobs/software-developer/',
        params: {
            region: 'dubai',
            vacancy: 'software-developer'
        }
    },
    {
        url: '/dubai/jobs/software-developer/we-5-or-more/',
        params: {
            region: 'dubai',
            vacancy: 'software-developer',
            workExperience: '5-or-more'
        }
    },
    {
        url: '/dubai/jobs/we-5-or-more/',
        params: {
            region: 'dubai',
            workExperience: '5-or-more'
        }
    },
    {
        url: '/dubai/jobs/we-5-or-more/c-amazon/',
        params: {
            region: 'dubai',
            workExperience: '5-or-more',
            company: 'amazon'
        }
    },
    {
        url: '/dubai/jobs/software-developer/we-5-or-more/c-amazon/',
        params: {
            region: 'dubai',
            vacancy: 'software-developer',
            workExperience: '5-or-more',
            company: 'amazon'
        }
    }
];

const getUrlPattern = () => {
    return new URLPattern(
        '/:region/jobs(/we-<:workExperience>)(/c-<:company>)/',
        '/:region/jobs/:vacancy(/we-<:workExperience>)(/c-<:company>)/'
    );
};

describe('common', () => {
    describe('parse', () => {
        urls.map(url => (
            it(url.url, () => {
                const urlPattern = getUrlPattern();

                const parseResult = urlPattern.parse(url.url);

                expectParseResults(parseResult, {
                    params: url.params,
                    search: url.search,
                    hash: url.hash
                });
            })
        ));
    });

    describe('build', () => {
        urls.map(url => (
            it(url.url, () => {
                const urlPattern = getUrlPattern();

                const buildedUrl = urlPattern.build(
                    url.params,
                    url.search,
                    url.hash
                );

                expect(buildedUrl).toBe(url.url);
            })
        ));
    });
});
