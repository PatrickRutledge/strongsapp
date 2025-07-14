# Microsoft Store Preparation Guide

## Current Status
The Strong's Dictionary Analyzer Electron app is working and we have:
- ✅ ZIP distribution package ready
- ✅ Basic AppX configuration started  
- ✅ Placeholder structure for Microsoft Store assets
- 🔄 MSIX packaging in progress (file lock issues to resolve)

## Next Steps for Microsoft Store Submission

### 1. Create Required Assets

#### App Icons (PNG format)
Create the following icon sizes and place them in `store-assets/icons/`:
- `icon-16.png` (16x16)
- `icon-20.png` (20x20) 
- `icon-24.png` (24x24)
- `icon-30.png` (30x30)
- `icon-32.png` (32x32)
- `icon-40.png` (40x40)
- `icon-44.png` (44x44) - Square44x44Logo
- `icon-48.png` (48x48)
- `icon-71.png` (71x71) - StoreLogo
- `icon-150.png` (150x150) - Square150x150Logo
- `icon-310.png` (310x310) - Square310x310Logo

#### Store Logos (PNG format)
Create these specific store logos in `store-assets/store-logos/`:
- `StoreLogo50x50.png` (50x50)
- `StoreLogo71x71.png` (71x71)
- `StoreLogo150x150.png` (150x150)
- `StoreLogo310x150.png` (310x150) - Wide tile
- `StoreLogo310x310.png` (310x310) - Large tile

#### Screenshots
Take 3-5 screenshots of the app in action and place them in `store-assets/screenshots/`:
- Show the main interface
- Show text analysis in progress
- Show results table
- Show single word lookup
- Show PDF export feature

### 2. Icon Creation Methods

#### Option A: Use the provided SVG with image editor
1. Open `store-assets/app-icon.svg` in any image editor (GIMP, Photoshop, etc.)
2. Export to PNG at the required sizes
3. Ensure transparent background for non-square icons

#### Option B: Use the HTML generator
1. Open `store-assets/icon-generator.html` in a web browser
2. Right-click on each canvas and "Save image as" PNG
3. Rename files to match the required naming convention

#### Option C: Install ImageMagick and run script
1. Install ImageMagick from https://imagemagick.org/script/download.php#windows
2. Run `store-assets/generate-icons.ps1` in PowerShell
3. This will auto-generate all required sizes

### 3. App Store Metadata

Complete the following information for the Microsoft Store listing:

#### Required Information:
- **App Name**: Strong's Dictionary Text Analyzer
- **Description**: See draft in `store-assets/AppxManifest.xml`
- **Category**: Education > Reference
- **Age Rating**: Everyone
- **Keywords**: biblical, dictionary, hebrew, greek, strongs, text analysis, concordance
- **Privacy Policy URL**: (create and host a simple privacy policy)
- **Support Contact**: Your email address

#### Store Description (Detailed):
```
Analyze biblical text with Strong's numbers to discover word usage patterns, meanings, and original Hebrew/Greek definitions.

Features:
• Complete offline Strong's Hebrew and Greek dictionaries
• Text analysis with Strong's number recognition (H1234, G5678 format)
• Word frequency counting and usage statistics
• Single word lookup for quick reference
• PDF export for analysis reports
• Beautiful, modern interface
• Works completely offline - no internet required

Perfect for:
• Bible students and scholars
• Pastors preparing sermons
• Hebrew and Greek language learners
• Anyone studying biblical texts with Strong's numbers

The app includes the complete Strong's Concordance data for both Hebrew (Old Testament) and Greek (New Testament) words, allowing for deep word study and analysis without requiring an internet connection.
```

### 4. Technical Requirements

#### Publisher Certificate
To publish on Microsoft Store, you'll need:
1. Microsoft Developer account ($19 one-time fee for individuals)
2. Publisher certificate for code signing
3. Package identity from Microsoft Partner Center

#### Build Process Fix
The current file lock issue with electron-builder can be resolved by:
1. Restarting the computer to clear file locks
2. Using a different output directory
3. Running the build from a different terminal session

### 5. Testing Before Submission

1. Test MSIX package installation locally
2. Verify all app functionality works in packaged mode
3. Test on different Windows 10/11 versions if possible
4. Ensure all assets display correctly

### 6. Microsoft Store Submission Process

1. Create Microsoft Partner Center account
2. Reserve app name "Strong's Dictionary Text Analyzer"
3. Upload MSIX package
4. Fill in store listing details
5. Upload screenshots and assets
6. Submit for certification

## Files Ready
- ✅ `AppxManifest.xml` - Basic manifest structure
- ✅ `app-icon.svg` - Source icon file
- ✅ `icon-generator.html` - Browser-based icon creator
- ✅ `generate-icons.ps1` - Automated icon generator
- 📁 Placeholder directories for all required assets

## Estimated Timeline
- Asset creation: 2-4 hours
- MSIX packaging fix: 30 minutes
- Store account setup: 1 hour
- Submission and review: 1-3 business days (Microsoft's review process)

The app is fully functional and ready for distribution. The main remaining work is creating the visual assets and resolving the packaging build issue.
