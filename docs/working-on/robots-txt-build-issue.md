# robots.txt Build Issue

## Error

During `npm run build`, the following error occurs:

```
[Error [PageNotFoundError]: Cannot find module for page: /robots.txt]
{ code: 'ENOENT' }

> Build error occurred
[Error: Failed to collect page data for /robots.txt] { type: 'Error' }
```

## Current State

- File exists: `app/robots.txt/route.ts`
- Route handler pattern is correct for Next.js 15
- Uses `export const dynamic = 'force-dynamic'`
- Imports `getClientData` which uses `getSupabaseClient()` requiring request context

## Possible Causes

1. **Corrupted `.next` cache** - stale build artifacts causing module resolution issues
2. **Next.js 15 route handler issue** - the route handler may need adjustment for build-time behavior
3. **Missing environment variables** during build causing the module to fail to load

## Status

- Pre-existing issue, not related to social links modal feature
- Needs investigation

## Potential Fix

Clear `.next` cache and rebuild:
```bash
Remove-Item -Recurse -Force .next
npm run build
```

If that doesn't work, may need to adjust the route handler to handle build-time scenarios.
