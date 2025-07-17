# Troubleshooting: React Context "dispatcher is null" Error

## Problem Description

When using a local package (`wsdot-api-client`) in an Expo/React Native app, you may encounter the following error:

```
Error: can't access property "useContext", dispatcher is null
```

This error typically occurs when:
1. Metro bundler cannot resolve the local package correctly
2. Multiple React instances exist in the dependency tree
3. The local package structure is incomplete or incorrectly linked

## Root Cause

The "dispatcher is null" error is a classic sign of React context mismatch. This happens when:

1. **Multiple React Versions**: The main app and the local package have different React versions, or there are duplicate React installations
2. **Metro Resolution Issues**: Metro bundler cannot properly resolve the local package, causing it to use a different React instance
3. **Incomplete Package Structure**: The local package is missing essential files like `package.json` or has nested `node_modules`

## Solution Steps

### 1. Kill All Processes and Clear Caches

```bash
# Kill all Expo/Metro processes
pkill -f expo
pkill -f node

# Clear all caches and node_modules
rm -rf node_modules .expo .cache .next
```

### 2. Rebuild the Local Package

```bash
# Navigate to the local package directory
cd ../wsdot-api-client

# Clean and rebuild
rm -rf node_modules dist
bun install
bun run build
```

### 3. Copy Package to node_modules (Not Symlink)

```bash
# Navigate back to your app
cd /path/to/your/app

# Copy the entire package (not just dist folder)
cp -r ../wsdot-api-client node_modules/wsdot-api-client

# Remove nested node_modules to prevent duplicates
rm -rf node_modules/wsdot-api-client/node_modules
```

### 4. Reinstall Dependencies and Start

```bash
# Reinstall app dependencies
bun install

# Start Expo with clean cache
npx expo start --web --clear
```

## Why This Works

1. **Complete Package Structure**: Copying the entire package (including `package.json`) allows Metro to properly resolve the module
2. **Single React Instance**: Removing nested `node_modules` prevents duplicate React installations
3. **Clean Cache**: Starting with `--clear` ensures Metro rebuilds its module resolution cache

## Prevention

To avoid this issue in the future:

1. **Always copy, never symlink** local packages in Expo/React Native projects
2. **Remove nested node_modules** from copied packages
3. **Use the reinstall script** provided in `package.json` when making changes to the local package

## Common Mistakes

- ❌ Symlinking the local package (`npm link` or `yarn link`)
- ❌ Copying only the `dist` folder without `package.json`
- ❌ Leaving nested `node_modules` in the copied package
- ❌ Not clearing Metro cache after package changes

## Verification

After following the solution:

1. The app should start without bundling errors
2. The vesselLocations page should load successfully
3. No "dispatcher is null" errors should appear
4. The `useVesselLocations` hook should work correctly

## Related Issues

- Metro bundler module resolution
- React context provider setup
- Local package development workflow
- Expo dependency management 