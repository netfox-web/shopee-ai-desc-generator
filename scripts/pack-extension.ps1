$ErrorActionPreference = "Stop"

$manifest = Get-Content "manifest.json" -Encoding UTF8 | ConvertFrom-Json
$version = $manifest.version

Write-Host "Packaging Shopee AI Desc Generator v$version"

$distDir = "dist"
if (-not (Test-Path $distDir)) {
    New-Item -ItemType Directory -Path $distDir | Out-Null
}

$zipName = "shopee-ai-desc-generator-v$version.zip"
$zipPath = Join-Path $distDir $zipName

if (Test-Path $zipPath) { Remove-Item $zipPath -Force }

# Staging directory
$staging = Join-Path $env:TEMP "shopee-ai-pack-$version"
if (Test-Path $staging) { Remove-Item $staging -Recurse -Force }
New-Item -ItemType Directory -Path $staging | Out-Null

# Copy the entire current directory to staging (simple and reliable)
Copy-Item -Path "." -Destination $staging -Recurse -Force

# Remove unwanted directories and files from staging (robust)
$unwanted = @(".git", "node_modules", "dist", ".next")
foreach ($name in $unwanted) {
    $p = Join-Path $staging $name
    if (Test-Path $p) {
        Remove-Item $p -Recurse -Force -ErrorAction SilentlyContinue
    }
}

# Remove test fixtures specifically
$fixtures = Join-Path $staging "scripts\fixtures"
if (Test-Path $fixtures) {
    Remove-Item $fixtures -Recurse -Force -ErrorAction SilentlyContinue
}

# Also remove any .log, .env*, temp files at root of staging
Get-ChildItem $staging -File | Where-Object { 
    $_.Name -match '\.log$' -or $_.Name -match '^\.env' -or $_.Name -match 'tmp' 
} | Remove-Item -Force -ErrorAction SilentlyContinue

# Create the zip (built-in PowerShell, no external tools)
Compress-Archive -Path (Join-Path $staging "*") -DestinationPath $zipPath -Force

# Cleanup
Remove-Item $staging -Recurse -Force

$sizeKB = [math]::Round((Get-Item $zipPath).Length / 1KB, 1)
Write-Host "✅ Packaged successfully: $zipPath"
Write-Host "Size: $sizeKB KB"

Write-Host ""
Write-Host "To verify in Chrome:"
Write-Host "  1. Go to chrome://extensions/"
Write-Host "  2. Turn on Developer mode"
Write-Host "  3. 'Load unpacked' and point to the original extension folder (or unzip the package and load the extracted folder)"
Write-Host ""
Write-Host "The packaged zip excludes: .git, node_modules, dist, scripts/fixtures, .env*, *.log, temp files."
