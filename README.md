# WorkBridge

Move selected AI conversations and project context between macOS and Linux.

- [한국어 사용 설명서](README_KR.md)
- [English user guide](README_EN.md)
- [Download website](docs/index.html)
- [Cloud server guide](cloud/README.md)
- [Download Website / 다운로드 웹사이트](https://topzuny10.github.io/workbridge/)

Supported sources: Codex, Claude Code, Cursor, and ChatGPT data exports.

## Development

```bash
npm ci
npm run check
npm start
```

## Release builds

```bash
# Linux standalone installer
npm run dist:linux
npm run package:linux

# macOS only: Intel and Apple Silicon DMGs
./scripts/build-mac.sh
```

Pushing a `v*` tag runs [.github/workflows/release.yml](.github/workflows/release.yml), builds all installers, and attaches them to a GitHub Release. The Pages workflow publishes `docs/`.

Licensed under the [MIT License](LICENSE).
