$ErrorActionPreference = "Stop"

# Get token from git credential manager
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
        ForEach-Object { $_ -replace "^password=", "" } | Select-Object -First 1).Trim()

if (-not $TOKEN) { Write-Error "No GitHub token found"; exit 1 }

$headers = @{
    Authorization  = "token $TOKEN"
    Accept         = "application/vnd.github+json"
    "Content-Type" = "application/json"
}

$notes = "Patch release. Fixes the 403 error on scan --target without a cloud API key.`n`nWhat Changed:`n- scan --target routes to http://127.0.0.1:45444 (local agent) by default`n- Clear pre-flight error if local agent is not running`n- Cloud SaaS users unaffected (set ASAF_API_URL=https://agent.souhimbou.org)`n`nSovereign workflow:`n  Terminal 1:  .\adinkhepra-windows-amd64.exe run`n  Terminal 2:  .\adinkhepra-windows-amd64.exe scan --target <host>`n`nSHA-256: 487EFDC95BC83E002CD1F91BEF9A8B670CC6E07043EB985537CD528B64860BDB"

$body = @{
    tag_name   = "v0.1.1"
    name       = "ASAF v0.1.1 - Fix: scan defaults to sovereign local agent"
    body       = $notes
    draft      = $false
    prerelease = $false
} | ConvertTo-Json -Depth 5

$rel = Invoke-RestMethod `
    -Uri "https://api.github.com/repos/nouchix/Adinkhepra-ASAF/releases" `
    -Method Post -Headers $headers -Body $body -UseBasicParsing

Write-Host "Release created: $($rel.id) -- $($rel.html_url)"

# Upload binary
$BIN = "C:\Users\intel\blackbox\Adinkhepra-ASAF\bin\adinkhepra-windows-amd64.exe"
$uploadUrl = "https://uploads.github.com/repos/nouchix/Adinkhepra-ASAF/releases/$($rel.id)/assets?name=adinkhepra-windows-amd64.exe"
$upHeaders = @{
    Authorization  = "token $TOKEN"
    Accept         = "application/vnd.github+json"
    "Content-Type" = "application/octet-stream"
}

Write-Host "Uploading 180MB binary..."
$asset = Invoke-RestMethod -Uri $uploadUrl -Method Post -Headers $upHeaders -InFile $BIN -UseBasicParsing
Write-Host "Done: $($asset.browser_download_url)"
    draft      = $false
    prerelease = $false
} | ConvertTo-Json -Depth 3

$rel = Invoke-RestMethod `
    -Uri "https://api.github.com/repos/nouchix/Adinkhepra-ASAF/releases" `
    -Method Post -Headers $headers -Body $body -UseBasicParsing
Write-Host "Release: $($rel.html_url)"

# Upload binary
$BIN = "C:\Users\intel\blackbox\Adinkhepra-ASAF\bin\adinkhepra-windows-amd64.exe"
$up = "https://uploads.github.com/repos/nouchix/Adinkhepra-ASAF/releases/$($rel.id)/assets?name=adinkhepra-windows-amd64.exe"
$upH = @{ Authorization="token $TOKEN"; Accept="application/vnd.github+json"; "Content-Type"="application/octet-stream" }
Write-Host "Uploading 180MB binary..."
$asset = Invoke-RestMethod -Uri $up -Method Post -Headers $upH -InFile $BIN -UseBasicParsing
Write-Host "Done: $($asset.browser_download_url)"
