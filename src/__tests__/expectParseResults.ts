import isEqual from 'lodash/isEqual';
import { SearchParams } from '../types';
import { URLParseResult } from '../URLParse';

export const expectParseResults = (
    parseResult: URLParseResult,
    data: {
        params?: Record<string, string>,
        search?: SearchParams,
        hash?: string,
    }
) => {
    expect(isEqual(parseResult.params(), data.params ?? {})).toBe(true);
    expect(isEqual(parseResult.search(), data.search ?? {})).toBe(true);
    expect(parseResult.hash()).toBe(data.hash);
};
