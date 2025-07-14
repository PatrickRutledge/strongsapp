# Strong's Dictionary Analyzer - Desktop App

This is the desktop version of the Strong's Dictionary Analyzer, built with Electron for cross-platform compatibility.

## Desktop Features

- **Standalone Application**: No need for a web browser
- **Cross-Platform**: Works on Windows, macOS, and Linux
- **Native Menus**: Platform-specific application menus
- **File Association**: Can be associated with text files containing Strong's numbers
- **Print Support**: Enhanced printing capabilities for analysis reports

## Development

### Prerequisites

- Node.js (v18 or higher)
- npm

### Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Running in Development

To run the app in development mode with hot reload:

```bash
npm run electron:dev
```

This will start the Vite dev server and launch Electron with live reloading.

### Building for Production

To build the Vue app and run Electron in production mode:

```bash
npm run build
npm run electron
```

### Creating Distributables

To create installer packages for different platforms:

```bash
# Build for current platform
npm run dist

# Build for all platforms (requires platform-specific setup)
npm run electron:pack
```

### Built Packages

The built packages will be located in the `dist-electron` directory:

- **Windows**: `.exe` installer and portable `.exe`
- **macOS**: `.dmg` disk image
- **Linux**: `.AppImage` package

## Project Structure

```
├── src/                 # Vue.js source code
├── electron/           # Electron main process files
│   ├── main.cjs        # Main Electron process
│   └── preload.cjs     # Preload script for security
├── dist/               # Built Vue app (generated)
├── dist-electron/      # Built Electron packages (generated)
└── build/              # Icon resources for packaging
```

## Configuration

### Electron Configuration

The Electron configuration is in `package.json` under the `build` section. Key configurations:

- **App ID**: `com.patrickrutledge.strongs-dictionary-analyzer`
- **Product Name**: "Strong's Dictionary Analyzer"
- **Output Directory**: `dist-electron`

### Icon Requirements

Place your app icons in the `build/` directory:

- **Windows**: `icon.ico` (256x256 pixels)
- **macOS**: `icon.icns` (512x512 pixels recommended)
- **Linux**: `icon.png` (512x512 pixels)

## Platform-Specific Notes

### Windows

- The installer uses NSIS and allows custom installation directory
- Code signing requires a valid certificate

### macOS

- App is categorized under "Education"
- Notarization required for distribution outside App Store
- Code signing requires Apple Developer certificate

### Linux

- Uses AppImage format for broad compatibility
- Can also be built as deb, rpm, or other formats

## Security

The app uses Electron security best practices:

- **Context Isolation**: Enabled
- **Node Integration**: Disabled in renderer
- **Preload Script**: Used for safe API exposure
- **Content Security Policy**: Implemented

## Troubleshooting

### Common Issues

1. **"require is not defined"**: Make sure Electron files use `.cjs` extension
2. **Port conflicts**: Vite dev server port is configured to 5173
3. **Build failures**: Ensure all dependencies are installed with `npm install`

### Debug Mode

In development, the app opens with DevTools for debugging. You can also:

- Use `console.log()` in the renderer process (Vue app)
- Use `console.log()` in the main process (check terminal output)
- Access `window.electronAPI` in the browser console for API information

## License

Same as the main project license.
