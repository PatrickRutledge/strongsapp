# PowerShell script to generate Microsoft Store icons
# This script requires ImageMagick to be installed
# Install from: https://imagemagick.org/script/download.php#windows

$svgFile = "app-icon.svg"
$iconsDir = "icons"
$storeLogosDir = "store-logos"

# Check if ImageMagick is available
try {
    magick -version | Out-Null
    Write-Host "ImageMagick found, proceeding with icon generation..." -ForegroundColor Green
} catch {
    Write-Host "ImageMagick not found. Please install ImageMagick from https://imagemagick.org/script/download.php#windows" -ForegroundColor Red
    Write-Host "Alternative: You can manually convert the SVG file to PNG files using any image editor" -ForegroundColor Yellow
    exit 1
}

# App icon sizes for Windows apps
$iconSizes = @(16, 20, 24, 30, 32, 36, 40, 48, 60, 64, 72, 96, 128, 256)

# Store logo sizes for Microsoft Store
$logoSizes = @(
    @{size=50; name="StoreLogo50x50"},
    @{size=71; name="StoreLogo71x71"},
    @{size=150; name="StoreLogo150x150"},
    @{size=310; name="StoreLogo310x150"; width=310; height=150},
    @{size=310; name="StoreLogo310x310"}
)

Write-Host "Generating app icons..." -ForegroundColor Cyan

foreach ($size in $iconSizes) {
    $outputFile = "$iconsDir\icon-$size.png"
    magick convert -background transparent -size "$size`x$size" $svgFile $outputFile
    Write-Host "Created: $outputFile" -ForegroundColor Green
}

Write-Host "`nGenerating store logos..." -ForegroundColor Cyan

foreach ($logo in $logoSizes) {
    if ($logo.width -and $logo.height) {
        # Wide logo (310x150)
        $outputFile = "$storeLogosDir\$($logo.name).png"
        # For wide logo, we'll create a centered version
        magick convert -background transparent -size "$($logo.width)x$($logo.height)" xc:transparent ( $svgFile -resize "150x150" ) -gravity center -composite $outputFile
    } else {
        $outputFile = "$storeLogosDir\$($logo.name).png"
        magick convert -background transparent -size "$($logo.size)x$($logo.size)" $svgFile $outputFile
    }
    Write-Host "Created: $outputFile" -ForegroundColor Green
}

# Create the main app icon as ICO file
Write-Host "`nCreating Windows ICO file..." -ForegroundColor Cyan
magick convert $svgFile -define icon:auto-resize=256,128,96,64,48,32,16 "icons\app-icon.ico"
Write-Host "Created: icons\app-icon.ico" -ForegroundColor Green

Write-Host "`nIcon generation complete!" -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Take screenshots of your app for the store listing" -ForegroundColor White
Write-Host "2. Update the AppxManifest.xml with proper metadata" -ForegroundColor White
Write-Host "3. Test the MSIX package build" -ForegroundColor White
