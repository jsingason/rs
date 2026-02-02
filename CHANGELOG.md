# Changelog

All notable changes to RS will be documented in this file.

## [1.5.1] - 2026-02-02

### Fixed
- Reverting to inquirer v8.2.6 for increased legacy node support

### Changed
- Reverted from @inquirer/prompts v8 to inquirer v8 for broader compatibility

## [1.5.0] - 2026-02-01

### Added
- **Verbose mode** (`--verbose`): Shows package manager detection, config file location, working directory, and script resolution path for troubleshooting
- **Config export/import**: Backup and sync your scripts across machines with `--export` and `--import` flags
- **Replace mode**: Use `--import --replace` to completely replace config instead of merging
- **Improved error messages**: When a script isn't found, RS now shows available scripts and falls back gracefully

### Changed
- Non-quoted script values now work with `-a` and `--add-dir` (extra arguments are joined)
- Updated dependencies: commander v14, jest v30, typescript v5.9, @types/node v25, @inquirer/prompts v8

### Fixed
- Fixed broken test suite - tests now import from correct module paths
- Replaced deprecated TSLint with ESLint

### Developer
- Added comprehensive unit and integration tests
- Added CI/CD workflow for automated testing and publishing

## [1.4.1] - Previous

### Added
- Directory-specific scripts with `--add-dir` and `--delete-dir`
- Interactive mode with `-i`
- Deno package manager support

### Changed
- Updated selection library
- Improved README documentation
