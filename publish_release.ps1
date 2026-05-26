$ErrorActionPreference = "Stop"

# Get token
$proc = [System.Diagnostics.Process]::new()
$proc.StartInfo.FileName = "git"
$proc.StartInfo.Arguments = "credential fill"
$proc.StartInfo.UseShellExecute = $false
$proc.StartInfo.RedirectStandardInput = $true
$proc.StartInfo.RedirectStandardOutput = $true
$proc.Start() | Out-Null
$proc.StandardInput.WriteLine("protocol=https")
$proc.StandardInput.WriteLine("host=github.com")
$proc.StandardInput.WriteLine("")
$proc.StandardInput.Close()
$out = $proc.StandardOutput.ReadToEnd()
$proc.WaitForExit()
$TOKEN = ($out -split "`n" | Where-Object { $_ -match "^password=" } | `
    ForEach-Object { $_ -replace "^password=","" } | Select-Object -First 1).Trim()
if (-not $TOKEN) { Write-Error "No token"; exit 1 }

# Copy binary
Copy-Item "C:\Users\intel\blackbox\khepra protocol\bin\adinkhepra.exe" `
          "C:\Users\intel\blackbox\Adinkhepra-ASAF\bin\adinkhepra-windows-amd64.exe" -Force
Write-Host "Binary copied"

$HASH = (Get-FileHash "C:\Users\intel\blackbox\Adinkhepra-ASAF\bin\adinkhepra-windows-amd64.exe" -Algorithm SHA256).Hash
$SIZE = (Get-Item "C:\Users\intel\blackbox\Adinkhepra-ASAF\bin\adinkhepra-windows-amd64.exe").Length
Write-Host "SHA-256: $HASH ($SIZE bytes)"

# Write CHECKSUMS
$cs  = "# ASAF Release Checksums -- v0.1.3`n"
$cs += "# Generated: $(Get-Date -Format 'yyyy-MM-ddTHH:mm:ssZ' -AsUTC)`n"
$cs += "# Fix: scan --target fully sovereign (ServeMux prefix route, fast port scan)`n`n"
$cs += "$HASH  bin/adinkhepra-windows-amd64.exe  ($SIZE bytes)`n"
[System.IO.File]::WriteAllText("C:\Users\intel\blackbox\Adinkhepra-ASAF\bin\CHECKSUMS.txt", $cs, [System.Text.UTF8Encoding]::new($false))

# Commit + tag + push
Set-Location "C:\Users\intel\blackbox\Adinkhepra-ASAF"
git add bin/CHECKSUMS.txt
git commit -m "release: v0.1.3 -- scan --target fully sovereign" 2>&1
git tag -a v0.1.3 -m "v0.1.3 scan --target fully sovereign" 2>&1
git push origin main --tags 2>&1
Write-Host "Pushed v0.1.3"

# GitHub release + upload
$headers = @{ Authorization="token $TOKEN"; Accept="application/vnd.github+json"; "Content-Type"="application/json" }
$notes = "v0.1.3 - scan --target now fully sovereign (no cloud, no API key, no license).`n`nFixes: ServeMux prefix route for GET poll (/api/v1/onboarding/scan/), risky-port-only scan completes in <5s, controlsPassed calculation corrected.`n`nWorkflow:`n  Terminal 1: .\adinkhepra-windows-amd64.exe run`n  Terminal 2: .\adinkhepra-windows-amd64.exe scan --target 127.0.0.1`n`nSHA-256: $HASH"
$body = @{ tag_name="v0.1.3"; name="ASAF v0.1.3 - scan --target fully sovereign"; body=$notes; draft=$false; prerelease=$false } | ConvertTo-Json -Depth 3
$rel = Invoke-RestMethod -Uri "https://api.github.com/repos/nouchix/Adinkhepra-ASAF/releases" -Method Post -Headers $headers -Body $body -UseBasicParsing
Write-Host "Release: $($rel.html_url)"

$BIN = "C:\Users\intel\blackbox\Adinkhepra-ASAF\bin\adinkhepra-windows-amd64.exe"
$up = "https://uploads.github.com/repos/nouchix/Adinkhepra-ASAF/releases/$($rel.id)/assets?name=adinkhepra-windows-amd64.exe"
$upH = @{ Authorization="token $TOKEN"; Accept="application/vnd.github+enn"; "Content-Type"="application/octet-stream" }
$upH["Accept"] = "application/vnd.github+json"
Write-Host "Uploading 180MB binary..."
$asset = Invoke-RestMethod -Uri $up -Method Post -Headers $upH -InFile $BIN -UseBasicParsing
Write-Host "Done: $($asset.browser_download_url)"
