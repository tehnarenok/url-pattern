import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
    verbose: true,
    transform: {
        ['.+\\.ts?$']: 'ts-jest'
    },
    testMatch: [ '**/__tests__/*.test.{js,ts,tsx}' ]
};

export default config;
