import URLParse from 'url-parse';
import { URLPattern } from '.';
import { SearchParams } from './types';

export class URLParseResult {
    #urlPattern: URLPattern;
    #url: string;
    #hash?: string;
    #params: Record<string, string> = {};
    #search: SearchParams = {};

    constructor(url: string, pattern: URLPattern) {
        this.#url = url;
        this.#urlPattern = pattern;

        if (!this.validate()) {
            throw new Error('Url not valid for this pattern');
        }

        this.parsePath();
        this.parseSearch();
        this.parseHash();
    }

    private validate() {
        return this.#urlPattern.test(this.#url);
    }

    private parsePath() {
        const params = this.#urlPattern.getParams(this.#url);

        for (const param of Object.keys(params)) {
            const value = this.#urlPattern.getParam(this.#url, param);

            if (!value && !params[param]) {
                throw new Error('Cant parse url');
            }

            if (value) {
                this.#params[param] = value;
            }
        }
    }

    private parseSearch() {
        const search = new URLSearchParams(new URLParse(this.#url).query);

        const searchKeys = search.keys();

        for (const key of searchKeys) {
            const value = search.getAll(key);

            if (value?.length > 1) {
                this.#search[key] = value;
            }

            if (value?.length === 1) {
                this.#search[key] = value[0];
            }
        }
    }

    private parseHash() {
        const hash = new URLParse(this.#url).hash.replace(/^#/, '');

        this.#hash = hash.length ? hash : undefined;
    }

    get(paramName: string) {
        return this.#params[paramName];
    }

    params() {
        return this.#params;
    }

    search() {
        return this.#search;
    }

    hash() {
        return this.#hash;
    }
}
