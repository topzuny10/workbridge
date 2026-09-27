# WorkBridge user guide

WorkBridge is a desktop app for moving selected Codex, Claude Code, Cursor, and ChatGPT conversations between operating systems. Ubuntu/Linux and macOS are the primary targets.

## Supported data

- Local Codex tasks
- Local Claude Code tasks (`~/.claude/projects`)
- Cursor agent conversations (`~/.cursor/projects/*/agent-transcripts`)
- ChatGPT data exports (`ZIP`, `JSON`)
- Git commit history and staged/unstaged changes (optional)

Login tokens and cookies are excluded. Secrets already committed to Git may still be included in the repository history.

## Install on Linux

Download `WorkBridge-version-linux-x64.sh` from GitHub Releases, then run:

```bash
chmod +x WorkBridge-*-linux-x64.sh
./WorkBridge-*-linux-x64.sh
```

The installer asks for administrator access once to configure Electron's security sandbox. WorkBridge is installed in `${XDG_DATA_HOME:-$HOME/.local/share}/workbridge`. An existing installation is moved to a timestamped backup.

## Install on macOS

Use the `arm64.dmg` on Apple Silicon or the `x64.dmg` on an Intel Mac.

1. Open the DMG.
2. Move WorkBridge to Applications.
3. If macOS blocks the first launch, allow it in System Settings → Privacy & Security.

Automated builds are currently unsigned and not notarized. A public release should use an Apple Developer ID and notarization.

## Export conversations

1. On the Export screen, load Codex, Claude Code, Cursor, or a ChatGPT export.
2. Select the conversations to move. Select all chooses every visible item.
3. Scroll through the preview on the right to verify the conversation.
4. Optionally enable Include Git projects.
5. Select Export selected and save the `.workbridge` file.

## Import on another OS

1. Copy the `.workbridge` file to the destination computer.
2. Select Import bundle in WorkBridge.
3. Review the conversations and restore the project when needed.
4. Select Continue in Codex to create a new task in the detected Codex installation.

## Configure the Codex executable

Open Settings → Codex location:

- Auto-detect checks the bundled desktop executable first, then regular CLIs, and Snap last.
- Enter opens a dialog where you can provide the full executable path.

A common Linux desktop path is `/usr/lib/chatgpt/resources/codex`.

## Permanently delete Codex tasks

Select tasks in the Export list and choose Delete. Confirming the warning permanently deletes them. Permanent source deletion currently supports Codex tasks only.

## WorkBridge Cloud

Bundles are encrypted on the device with AES-256-GCM before upload. The server cannot read the conversation or encryption password. The same encryption password is required on another OS and cannot be recovered if lost.

The included server is a personal self-hosted MVP. The default `http://127.0.0.1:8787` address is for local testing and requires the server to be started separately:

```bash
npm run cloud:start
```

A remote server must use HTTPS. See the [cloud server guide](cloud/README.md).

## Development and builds

```bash
npm ci
npm run check

# Linux
npm run dist:linux
npm run package:linux

# Run only on macOS
./scripts/build-mac.sh
```

Push a `v*` tag such as `v0.3.2` to build the Linux installer and both DMGs and attach them to a GitHub Release.

## Current limitations

- Regular ChatGPT conversations are not inserted into the original ChatGPT sidebar.
- Claude Code and Cursor detection may need updates when their local formats change.
- The bundled Cloud server is not hardened for a public multi-tenant service.
- Windows installers are not supported yet.
