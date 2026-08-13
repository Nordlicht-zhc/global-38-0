# Windows Desktop Build

The desktop edition uses Tauri 2 and keeps the existing browser edition unchanged. The game remains fully offline after installation.

## Prerequisites

- Windows 10 or Windows 11 with WebView2
- Visual Studio 2022 C++ build tools
- Rust stable MSVC toolchain
- Tauri CLI 2

Install the Rust toolchain and Tauri CLI once:

```powershell
rustup toolchain install stable-x86_64-pc-windows-msvc --profile minimal
cargo install tauri-cli --version '^2' --locked
```

## Build

Open the `desktop` directory:

```powershell
cd desktop
cargo tauri build
```

The build automatically runs `prepare-assets.ps1`. That script creates a temporary `dist/` directory containing only the browser assets needed at runtime. The browser source files in the parent directory are only read and are never modified.

Build outputs:

- Portable application: `src-tauri/target/release/global-38-0.exe`
- Windows installer: `src-tauri/target/release/bundle/nsis/Global 38-0_1.0.0_x64-setup.exe`
- Ready-to-use copies: `release/`

The desktop edition stores IndexedDB and localStorage data in its own WebView2 profile. Existing saves from the browser edition are not imported automatically.
