# RELEASE_CHECKLIST.md

## Shopee AI 描述生成器 Release Checklist

Use this checklist before every release / packaging.

### Pre-release
- [ ] All manual smoke tests pass (`node scripts/smoke-test.js`)
- [ ] All previous phase verification items confirmed (see README)
- [ ] No console red errors in Side Panel / options / popup (after reload)
- [ ] No raw provider keys or secrets in source (grep for sk-, AIza, etc.)
- [ ] manifest.json version bumped (semantic)
- [ ] CHANGELOG.md updated with date and changes
- [ ] README.md current version and update date refreshed

### Packaging
- [ ] Run packaging script: `powershell -File scripts/pack-extension.ps1`
- [ ] Verify zip name contains version (e.g. shopee-ai-desc-generator-vX.Y.Z.zip)
- [ ] Zip size reasonable (no node_modules, no .git, no fixtures, no secrets)
- [ ] Extract zip and confirm key files present: manifest.json, *.js, *.html, README, etc.
- [ ] No excluded paths leaked into the archive

### Installation Package Verification (chrome://extensions)
- [ ] Load unpacked (point to the source folder) works
- [ ] Or: unzip the packaged zip and load the extracted folder
- [ ] No "Invalid value for 'content_scripts[0].matches'" or icon errors
- [ ] Side Panel opens (click the extension icon or use command)
- [ ] Options page opens from chrome://extensions
- [ ] Popup opens
- [ ] Basic smoke: open on a shopee.tw page, status area shows correct pageType, run 2-3 features, check result area + CSV download if applicable

### Post-pack
- [ ] Tag the release in git (optional for now)
- [ ] Update any external docs / 教學文件.md if needed
- [ ] **Do NOT deploy / merge to main unless explicitly approved**

### Common Issues & Fixes
- Wildcard matches error → already fixed in manifest (explicit domains)
- Missing icons → icons/ folder + manifest cleaned in previous phases
- Large zip → re-run pack script (exclusions are applied in staging)
- Tests fail → fix before bumping version

Last updated: 2026-06-10 (v2.5.0 packaging)
