import URLParse from 'url-parse';
import { DoubleParamError, InvalidParamsError, InvalidPathError } from './errors';
import { IPattern, PatternValidator, SearchParams } from './types';
import { URLParseResult } from './URLParse';

const PATH_ITEM = {
    FIXED: /^\/[a-zA-Z0-9-_]+$/,
    PARAM: /^\/:[a-z][a-zA-Z0-9-_]+$/,
    SMART_PARAM: /^\/([a-zA-Z0-9-_]*<:[a-z][a-zA-Z0-9-_]+>[a-zA-Z0-9-_]*)+$/,
    OPTIONAL_PARAM: /^\(\/:[a-z][a-zA-Z0-9-_]+\)$/,
    OPTIONAL_SMART_PARAM: /^\(\/([a-zA-Z0-9-_]*<:[a-z][a-zA-Z0-9-_]+>[a-zA-Z0-9-_]*)+\)$/
};

// eslint-disable-next-line max-len
const regexpSplitter = /(\(\/([a-zA-Z0-9-_]*<:[a-z][a-zA-Z0-9-_]+>[a-zA-Z0-9-_]*)+\))|(\(\/:[a-z][a-zA-Z0-9-_]+\))|(\/([a-zA-Z0-9-_]*<:[a-z][a-zA-Z0-9-_]+>[a-zA-Z0-9-_]*)+)|(\/:[a-z][a-zA-Z0-9-_]+)|(\/[a-zA-Z0-9-_]+)/g;

const PATH_ITEM_RE = '[a-zA-Z0-9-_]+';

export class URLPattern {
    #patterns: IPattern[] = [];
    #validator: PatternValidator | undefined;

    constructor(pattern: string, ...args: string[]) {
        const patterns = [pattern, ...args];

        this.#patterns = patterns.map(pattern => this.parsePathPattern(pattern));
    }

    paramValidator(validator: PatternValidator) {
        this.#validator = validator;

        return this;
    }

    private parsePathPattern(pattern: string): IPattern {
        if (pattern === '*') {
            return {
                regexp: /.*/,
                params: {},
                getters: {},
                pattern
            };
        }

        const path: string[] = [];
        let regexpStringForParse = '';

        for (const match of pattern.matchAll(regexpSplitter)) {
            path.push(match[0]);

            if (match[0].startsWith('/')) {
                regexpStringForParse += '(\/[a-zA-Z0-9_-]+)';
            } else {
                regexpStringForParse += '(\/[a-zA-Z0-9_-]+)?';
            }
        }

        const regexpForParse = new RegExp('^' + regexpStringForParse + '\/?$');

        const getPathItem = (path: string, index: number) => {
            const pathItem = path.match(regexpForParse)?.[index + 1];

            if (!pathItem) {
                return null;
            }

            return pathItem.replace(/^\//, '');
        };

        let pathPattern = '';
        const getters: IPattern['getters'] = {};

        for (let idx = 0; idx < path.length; idx++) {
            const pathItem = path[idx];

            if (PATH_ITEM.FIXED.test(pathItem)) {
                pathPattern += `${pathItem}`;
            }
            if (PATH_ITEM.PARAM.test(pathItem)) {
                pathPattern += `/${PATH_ITEM_RE}`;

                const paramName = pathItem.replace('/:', '');

                if (getters[paramName]) {
                    throw new DoubleParamError();
                }

                getters[paramName] = {
                    get: (path: string) => {
                        return getPathItem(path, idx);
                    },
                    optional: false
                };
            }
            if (PATH_ITEM.OPTIONAL_PARAM.test(pathItem)) {
                pathPattern += `(/${PATH_ITEM_RE})?`;

                const paramName = pathItem.match(/\(\/:(.+)\)/)?.[1];

                if (paramName) {
                    if (getters[paramName]) {
                        throw new DoubleParamError();
                    }

                    getters[paramName] = {
                        get: (path: string) => {
                            return getPathItem(path, idx);
                        },
                        optional: true
                    };
                }
            }
            if (PATH_ITEM.SMART_PARAM.test(pathItem) || PATH_ITEM.OPTIONAL_SMART_PARAM.test(pathItem)) {
                const isOptional = PATH_ITEM.OPTIONAL_SMART_PARAM.test(pathItem);

                const matchPattern = /<:([a-z][a-zA-Z0-9-_]+)>/g;

                let matches = pathItem.matchAll(matchPattern);

                let itemPattern = `${pathItem}${isOptional ? '?' : ''}`;
                let getterPattern = pathItem.replace(/^\(?\//, '').replace(/\)$/, '');

                for (const match of matches) {
                    itemPattern = itemPattern.replace(match[0], PATH_ITEM_RE);
                    getterPattern = getterPattern.replace(match[0], `(${PATH_ITEM_RE})`);
                }

                matches = pathItem.matchAll(matchPattern);

                const getter = (getterPattern: string, index: number) => (path: string) => {
                    const pathItem = getPathItem(path, idx);

                    if (!pathItem) {
                        return null;
                    }

                    const matches = Array.from(pathItem.matchAll(new RegExp(`^${getterPattern}$`, 'g')));

                    return matches[0][index];
                };

                let index = 0;

                for (const match of matches) {
                    const paramName = match[1];

                    if (getters[paramName]) {
                        throw new DoubleParamError();
                    }

                    getters[paramName] = {
                        get: getter(getterPattern, index + 1),
                        optional: isOptional
                    };

                    index += 1;
                }

                pathPattern += itemPattern;
            }
        }

        pathPattern += '/?';

        let newPattern = pattern;

        // eslint-disable-next-line max-len
        for (const match of pattern.matchAll(/(\(\/([a-zA-Z0-9-_]*<:[a-z][a-zA-Z0-9-_]+>[a-zA-Z0-9-_]*)+\))|(\(\/:[a-z][a-zA-Z0-9-_]+\))/g)) {
            const value = match[0];
            const innerValue = value.match(/\(\/(.+)\)/)?.[1];

            if (innerValue) {
                newPattern = newPattern.replace(value, '/' + innerValue);
            }
        }

        return {
            regexp: new RegExp('^' + pathPattern + '$'),
            params: Object.fromEntries(Object.entries(getters).map(([name, getter]) => [name, getter.optional])),
            getters,
            pattern: newPattern
        };
    }

    test(url: string) {
        const { pathname } = new URLParse(url);

        const isPathValid = this.#patterns
            .map(pattern => {
                return pattern.regexp.test(pathname);
            })
            .some(Boolean);

        return isPathValid;
    }

    private getPattern = (pathname: string): IPattern | null => {
        for (let idx = 0; idx < this.#patterns.length; idx++) {
            const pattern = this.#patterns[idx];

            if (pattern.regexp.test(pathname)) {
                return pattern;
            }
        }

        return null;
    };

    private getParamByPattern(path: string, param: string, pattern: IPattern) {
        if (!Object.keys(pattern.params).includes(param)) {
            return null;
        }

        return pattern.getters[param].get(path);
    }

    getParam(url: string, param: string) {
        const { pathname } = new URLParse(url);

        const pattern = this.getPattern(pathname);

        if (!pattern) {
            throw new InvalidPathError();
        }

        return this.getParamByPattern(pathname, param, pattern);
    }

    getParams(url: string) {
        const { pathname: path } = new URLParse(url);

        const pattern = this.getPattern(path);

        if (!pattern) {
            throw new InvalidPathError();
        }

        return pattern.params;
    }

    parse(url: string) {
        return new URLParseResult(url, this);
    }

    private compareParams(params: string[], patterParams: Record<string, boolean>) {
        let isValid = true;

        for (const param of params) {
            isValid = isValid && Boolean(Object.entries(patterParams).find(value => param === value[0]));
        }

        for (const param of Object.entries(patterParams)) {
            isValid = isValid && (param[1] || Boolean(params.find(value => value === param[0])));
        }

        return isValid;
    }

    build(
        params: Record<string, string> = {},
        search: SearchParams = {},
        hash: string | undefined = undefined
    ) {
        for (const pattern of this.#patterns) {
            if (this.compareParams(Object.keys(params), pattern.params)) {
                let url = pattern.pattern;

                for (const param of Object.keys(pattern.params)) {
                    if (params[param]) {
                        url = url.replace(new RegExp(`(:${param})|(<:${param}>)`), params[param]);
                    }
                }

                url = url.replace(/\/:[a-zA-Z0-9-_]+/g, '');
                url = url.replace(/\/([a-zA-Z0-9-_]*<:[a-z][a-zA-Z0-9-_]+>[a-zA-Z0-9-_]*)+/g, '');

                const searchParams = new URLSearchParams();

                for (const [name, value] of Object.entries(search)) {
                    if (Array.isArray(value)) {
                        value.forEach(val => searchParams.append(name, val));
                    } else {
                        searchParams.set(name, value);
                    }
                }

                const searchString = searchParams.toString();

                if (searchString?.length) {
                    url += `?${searchString}`;
                }

                if (hash?.length) {
                    url += `#${hash}`;
                }

                return url;
            }
        }

        throw new InvalidParamsError();
    }
}
