# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.5.0] - 2026-06-10

### Added
- Release packaging infrastructure (scripts/pack-extension.ps1)
- CHANGELOG.md for tracking versions after v2.4
- RELEASE_CHECKLIST.md with full release process
- Version bump to 2.5.0 with controllable manifest versioning
- README section for release/packaging workflow
- Support for clean zip output excluding .git, fixtures, secrets, temp files

### Changed
- Updated project status and development priority in README to reflect Phase 9 (Release)

### Notes
- This release focuses on making the extension deliverable (zip packaging + docs).
- No new user-facing features; prepares for future phases (Analytics, Pro, etc.).
- All previous Phase 1-8 work (MVP, Parser, Mock, Batch/CSV, UX, Gateway, QA) included.
