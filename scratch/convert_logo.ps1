Add-Type -AssemblyName System.Drawing
$filePath = Join-Path (Get-Location) "assets\app_logo.png"
$outputPath = Join-Path (Get-Location) "assets\app_logo_real.png"
$img = [System.Drawing.Image]::FromFile($filePath)
$img.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
$img.Dispose()
Remove-Item $filePath -Force
Rename-Item $outputPath "app_logo.png"
Write-Host "Converted app_logo.png to valid PNG successfully"
