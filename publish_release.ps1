$ErrorActionPreference = "Stop"

# ── Get GitHub token from git credential manager ──────────────────────────────
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
$TOKEN = ($out -split "`n" | Where-Object { $_ -match "^password=" } |
    ForEach-Object { $_ -replace "^password=", "" } | Select-Object -First 1).Trim()
if (-not $TOKEN) { Write-Error "No GitHub token found"; exit 1 }

# ── Copy binary ───────────────────────────────────────────────────────────────
$SRC  = "C:\Users\intel\blackbox\khepra protocol\bin\adinkhepra.exe"
$DEST = "C:\Users\intel\blackbox\Adinkhepra-ASAF\bin\adinkhepra-windows-amd64.exe"
Copy-Item $SRC $DEST -Force
Write-Host "Binary copied"

$HASH = (Get-FileHash $DEST -Algorithm SHA256).Hash
$SIZE = (Get-Item $DEST).Length
Write-Host "SHA-256: $HASH ($SIZE bytes)"

# ── Write CHECKSUMS ───────────────────────────────────────────────────────────
$TS = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
$CHECKSUMS = "# ASAF Release Checksums -- v0.1.3`n# Generated: $TS`n# Fix: scan --target fully sovereign`n`n$HASH  bin/adinkhepra-windows-amd64.exe  ($SIZE bytes)`n"
[System.IO.File]::WriteAllText(
    "C:\Users\intel\blackbox\Adinkhepra-ASAF\bin\CHECKSUMS.txt",
    $CHECKSUMS,
    [System.Text.UTF8Encoding]::new($false)
)

# ── Commit + tag + push ───────────────────────────────────────────────────────
Set-Location "C:\Users\intel\blackbox\Adinkhepra-ASAF"
git add bin/CHECKSUMS.txt
git commit -m "release: v0.1.3 -- scan --target fully sovereign" 2>&1 | Write-Host
git tag -a v0.1.3 -m "v0.1.3 scan --target fully sovereign" 2>&1 | Write-Host
git push origin main --tags 2>&1 | Write-Host
Write-Host "Tagged and pushed v0.1.3"

# ── Create GitHub release ─────────────────────────────────────────────────────
$apiHeaders = @{
    Authorization  = "token $TOKEN"
    Accept         = "application/vnd.github+json"
    "Content-Type" = "application/json"
}

$releaseBody = @{
    tag_name   = "v0.1.3"
    name       = "ASAF v0.1.3 - scan --target fully sovereign"
    body       = "v0.1.3 - scan --target now fully sovereign (no cloud, no API key, no license).`n`nFixes:`n- ServeMux prefix route for GET /api/v1/onboarding/scan/<id>`n- Risky-port-only scan completes in <5s`n- controlsPassed calculation corrected`n`nWorkflow: run in T1, scan --target in T2.`n`nSHA-256: $HASH"
    draft      = $false
    prerelease = $false
} | ConvertTo-Json -Depth 3

$release = Invoke-RestMethod `
    -Uri "https://api.github.com/repos/nouchix/Adinkhepra-ASAF/releases" `
    -Method Post -Headers $apiHeaders -Body $releaseBody -UseBasicParsing
Write-Host "Release: $($release.html_url)"

# ── Upload binary ─────────────────────────────────────────────────────────────
$uploadUrl = "https://uploads.github.com/repos/nouchix/Adinkhepra-ASAF/releases/$($release.id)/assets?name=adinkhepra-windows-amd64.exe"
$uploadHeaders = @{
    Authorization  = "token $TOKEN"
    Accept         = "application/vnd.github+json"
    "Content-Type" = "application/octet-stream"
}
Write-Host "Uploading 180MB binary..."
$asset = Invoke-RestMethod -Uri $uploadUrl -Method Post -Headers $uploadHeaders -InFile $DEST -UseBasicParsing
Write-Host "Done: $($asset.browser_download_url)"
