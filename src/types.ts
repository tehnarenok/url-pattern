export interface Getter {
    get: (path: string) => string | null;
    optional: boolean;
}

export interface IPattern {
    regexp: RegExp;
    params: Record<string, boolean>;
    getters: Record<string, Getter>;
    pattern: string;
}

export type PatternValidator = (name: string, value: string, patternIndex: number) => boolean;

export type SearchParams = Record<string, string | string[]>;
