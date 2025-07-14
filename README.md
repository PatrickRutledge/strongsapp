# Strong's Dictionary Text Analyzer

A modern web application for analyzing biblical text containing Strong's numbers. This tool helps scholars, students, and enthusiasts analyze word usage patterns and discover original Hebrew and Greek meanings.

## 📱 Desktop Application

The Strong's Dictionary Analyzer is now available as a **cross-platform desktop application** built with Electron! This means you can run it as a standalone app on Windows, macOS, and Linux without needing a web browser.

### Desktop Features:
- **🖥️ Native Desktop App**: Runs independently without a browser
- **⌨️ Keyboard Shortcuts**: Native application menus and shortcuts
- **🖨️ Enhanced Printing**: Better PDF generation and printing support
- **📁 File Associations**: Can be associated with text files containing Strong's numbers
- **⚡ Faster Performance**: Optimized for desktop use

### Download & Installation:
1. **Development Version**: Clone the repository and run `npm run electron:dev`
2. **Built Version**: Run `npm run dist` to create a distributable package
3. **Portable Version**: The built app in `dist-electron/win-unpacked/` can be run directly

### Development Commands:
```bash
# Run in development mode with hot reload
npm run electron:dev

# Build for production and run
npm run build && npm run electron

# Create distributable package
npm run dist
```

---

## 🌐 Web Application Features

### 📖 Text Analysis
- **Paste Text with Strong's Numbers**: Enter biblical text containing Strong's numbers (H1234, G5678 format)
- **Word Usage Statistics**: See how many times each word appears in your text
- **Comprehensive Results Table**: View Strong's numbers, usage counts, Hebrew/Greek words, and definitions
- **Summary Analytics**: Quick overview of total and unique words in your passage

### 🔍 Single Word Lookup
- **Quick Reference**: Look up individual Strong's numbers instantly
- **Detailed Definitions**: Access complete Hebrew and Greek word definitions
- **Clean Interface**: Simple, focused design for efficient study

### 📄 PDF Export
- **Print to PDF**: Generate professional PDF reports with perfect formatting
- **Letter-Size Pages**: Tables automatically fit standard 8.5"×11" pages
- **Text Wrapping**: Long definitions wrap properly within table cells
- **Professional Styling**: Clean, readable output with proper margins

### 📊 Analysis Results
For each Strong's number found in your text, see:
1. **Count**: Number of times the word appears
2. **Strong's Number**: Reference number (H1234 or G5678)
3. **Language**: Hebrew or Greek designation
4. **Original Word**: Hebrew/Greek transliteration
5. **Definition**: Complete meaning and usage

## Perfect For

- **Bible Study**: Analyze passages to understand original meanings
- **Academic Research**: Study word usage patterns in biblical texts
- **Personal Portfolio**: Showcase technical and biblical scholarship
- **Educational Tool**: Teach about biblical languages and interpretation

## Technology Stack

- **Vue 3** with Composition API
- **Vite** for fast development
- **Modern CSS** with responsive design
- **Strong's Dictionary Data** in JSON format
- **Browser Print API** for PDF generation

## Quick Start

```bash
npm install
npm run dev
```

## Data Sources

This application uses Strong's Hebrew and Greek dictionaries, processed into clean JSON format for optimal performance.

---

*Built with ❤️ for biblical scholarship and study*
