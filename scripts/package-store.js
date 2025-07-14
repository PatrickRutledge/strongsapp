import pkg from 'electron-windows-store';
const { windowsStore } = pkg;

async function packageApp() {
  try {
    await windowsStore({
      inputDirectory: 'dist-electron/win-unpacked',
      outputDirectory: 'windows-store',
      packageVersion: '1.0.0.0',
      packageName: 'StrongsDictionaryAnalyzer',
      packageDisplayName: "Strong's LexiCount",
      packageDescription: "A modern tool for analyzing biblical text with Strong's numbers",
      publisher: 'CN=PatrickRutledge',
      assets: 'store-assets',
      manifest: 'AppxManifest.xml',
      deploy: false,
      identityName: 'StrongsDictionaryAnalyzer',
      makeappx: true,
      sign: true
    });
  } catch (error) {
    console.error('Packaging failed:', error);
  }
}

packageApp();
