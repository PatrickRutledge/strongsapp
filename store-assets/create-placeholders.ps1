# Simple icon creation script - creates basic colored squares as placeholders
# These can be replaced with proper icons later

# Create basic placeholder icons
$iconSizes = @(16, 20, 24, 30, 32, 36, 40, 44, 48, 60, 64, 71, 72, 96, 128, 150, 256, 310)

# Create a simple colored rectangle as base64 for a 1x1 blue pixel
$bluePixel = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="

Write-Host "Creating placeholder icon files..." -ForegroundColor Cyan

# Create directories if they don't exist
if (!(Test-Path "icons")) { New-Item -ItemType Directory -Name "icons" }
if (!(Test-Path "store-logos")) { New-Item -ItemType Directory -Name "store-logos" }

foreach ($size in $iconSizes) {
    $filename = "icons\icon-$size.png"
    # For now, we'll create text files as placeholders that indicate the required sizes
    "Placeholder for ${size}x${size} icon - Replace with actual PNG file" | Out-File -FilePath $filename -Encoding ASCII
    Write-Host "Created placeholder: $filename" -ForegroundColor Yellow
}

# Create specific store logo placeholders
@(
    "store-logos\StoreLogo50x50.png",
    "store-logos\StoreLogo71x71.png", 
    "store-logos\StoreLogo150x150.png",
    "store-logos\StoreLogo310x150.png",
    "store-logos\StoreLogo310x310.png"
) | ForEach-Object {
    "Placeholder store logo - Replace with actual PNG file" | Out-File -FilePath $_ -Encoding ASCII
    Write-Host "Created placeholder: $_" -ForegroundColor Yellow
}

Write-Host "`nPlaceholder files created. To complete the setup:" -ForegroundColor Green
Write-Host "1. Replace placeholder files with actual PNG icons" -ForegroundColor White
Write-Host "2. You can use the icon-generator.html file in a browser to create icons" -ForegroundColor White
Write-Host "3. Or use any image editor to create PNG files from the SVG" -ForegroundColor White
