# Publishing to NPM

This guide explains how to publish the @realvest/mcp-server package to NPM.

## Prerequisites

1. Create an NPM account at https://www.npmjs.com/signup
2. Install Node.js 18+ and npm
3. Login to NPM:
   ```bash
   npm login
   ```

## First-Time Setup

1. Verify the package name is available:
   ```bash
   npm view @realvest/mcp-server
   ```
   (Should show "404 Not Found" if available)

2. Create NPM organization (if needed):
   - Go to https://www.npmjs.com/org/create
   - Create "realvest" organization
   - Set to public packages

## Publishing Steps

1. **Test the package locally:**
   ```bash
   cd mcp-server
   npm test
   npm pack --dry-run
   ```

2. **Verify package contents:**
   ```bash
   npm pack
   tar -tf realvest-mcp-server-0.1.0.tgz
   ```

3. **Publish to NPM:**
   ```bash
   npm publish --access public
   ```

   For the first publish of a scoped package:
   ```bash
   npm publish --access public --registry https://registry.npmjs.org/
   ```

4. **Verify publication:**
   ```bash
   npm view @realvest/mcp-server
   ```

## Version Management

1. **Update version for patches:**
   ```bash
   npm version patch  # 0.1.0 -> 0.1.1
   ```

2. **Update version for features:**
   ```bash
   npm version minor  # 0.1.0 -> 0.2.0
   ```

3. **Update version for breaking changes:**
   ```bash
   npm version major  # 0.1.0 -> 1.0.0
   ```

4. **Publish new version:**
   ```bash
   npm publish
   ```

## Post-Publication

1. **Create GitHub release:**
   - Go to https://github.com/sigaihealth/realvestmcp/releases
   - Click "Create a new release"
   - Tag: `v0.2.0`
   - Title: "MCP Server v0.2.0"
   - Copy changelog entries

2. **Update documentation:**
   - Update README badges
   - Add to RealVest.ai website
   - Announce in Discord

## Troubleshooting

- **403 Forbidden:** Check npm login status and organization permissions
- **402 Payment Required:** Ensure organization allows public packages
- **Package name taken:** Use a different scope or name

## NPM Commands Reference

```bash
# View package info
npm view @realvest/mcp-server

# List published versions
npm view @realvest/mcp-server versions

# Deprecate a version
npm deprecate @realvest/mcp-server@0.1.0 "Critical bug, use 0.1.1"

# Unpublish (within 72 hours)
npm unpublish @realvest/mcp-server@0.1.0
```