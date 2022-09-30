# URL Pattern

This package is designed for building and parsing URLs by patterns.

## Problem

How are you building url for your site?  
Maybe so?

```typescript
// url.ts
const jobId = '123456';
...
const jobUrl = `/jobs/${jobId}/?from=listing`;
const jobsUrl = `/jobs/`;
```

This is not good. Why? Because if you will want to change routing you will have to make a lot of changes to your code.  
With this package you can do it like this

```typescript
// jobPattern.ts
import { URLPattern } from '@tehdev/url-pattern';

export const jobPattern = new URLPattern('/jobs(/:jobId)/');
```

```typescript
// url.ts
import { jobPattern } from './jobPattern';

const jobId = '123456';
...
const jobUrl = jobPattern.build({ jobId }, { from: 'listing' }); // -> /jobs/123456/?from=listing
const jobsUrl = jobPattern.build(); // -> /jobs/
```

If you want to change the pattern, then you can change the pattern without changing the number and name of the parameters, then you do not have to change the entire code

## Patterns

### Static

Static path item

```typescript
new URLPattern('.../jobs/...');
```

### Parameterized path item

Parameterized path item - version 1

```typescript
new URLPattern('.../:jobId/...');
```

Parameterized path item - version 2

```typescript
new URLPattern('.../id-<:jobId>/...');
```

In the last example, `id-` is a static part in a parameterized path item

### Optional parameterized path item

Optional parameterized path item - version 1

```typescript
new URLPattern('...(/:jobId)/...');
```

Optional parameterized path item - version 2

```typescript
new URLPattern('...(/id-<:jobId>)/...');
```

## Search params and hash

You can build or parse urls with search and hash

```typescript
const jobPattern = new URLPattern('/jobs(/:jobId)/');

jobPattern.build({jobId: '1234'}, {from: 'listing'}); // -> /jobs/123456/?from=listing
jobPattern.build({jobId: '1234'}, {from: 'listing'}, 'reviews'); // -> /jobs/123456/?from=listing#reviews

const parseResult = jobPattern.parse('/jobs/123456/?from=listing#reviews');
parseResult.search() -> // {from: 'listing'}
parseResult.params() -> // {jobId: '1234'}
parseResult.hash() -> // "reviews"
```
