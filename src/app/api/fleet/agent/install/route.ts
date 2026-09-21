import { NextRequest, NextResponse } from 'next/server'

const ENROLLMENT_SECRET = process.env.KHEPRA_FLEET_SECRET || 'sec-khepra-msp-lab-2026'

export async function GET(req: NextRequest) {
  const osType = req.nextUrl.searchParams.get('os') || 'windows'
  const hubUrl = req.nextUrl.origin

  if (osType.toLowerCase() === 'windows') {
    const psScript = `# ==============================================================================
# NouchiX-Fleet — Sovereign Agent Deployment (Windows)
# Enclave: Groff-MSP-Enclave | USPTO #73565085
# ==============================================================================
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$ErrorActionPreference = "Stop"

$HubUrl = "${hubUrl}"
$Token = "${ENROLLMENT_SECRET}"
$Hostname = $env:COMPUTERNAME
$IP = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -notmatch "Loopback|vEthernet" } | Select-Object -First 1).IPAddress
if (-not $IP) { $IP = "127.0.0.1" }
$OS = (Get-CimInstance Win32_OperatingSystem).Caption
$Arch = $env:PROCESSOR_ARCHITECTURE
$Kernel = (Get-CimInstance Win32_OperatingSystem).Version

Write-Host ">>> [NouchiX-Fleet] Enrolling $Hostname ($IP) into Sovereign Enclave..." -ForegroundColor Cyan

$EnrollPayload = @{
    action = "enroll"
    token = $Token
    hostname = $Hostname
    ip = $IP
    os = $OS
    arch = $Arch
    kernelVersion = $Kernel
    enclave = "Groff-MSP-Enclave"
} | ConvertTo-Json

try {
    $Response = Invoke-RestMethod -Uri "$HubUrl/api/fleet/agent" -Method Post -Body $EnrollPayload -ContentType "application/json"
    Write-Host ">>> [NouchiX-Fleet] Enrolled successfully!" -ForegroundColor Green
    Write-Host ">>> Agent ID: $($Response.agentId)" -ForegroundColor Yellow
    Write-Host ">>> DAG Node: $($Response.dagNodeId)" -ForegroundColor Yellow
    Write-Host ">>> Signature: $($Response.signature)" -ForegroundColor Yellow
} catch {
    Write-Error "Failed to enroll with ASAF Hub: $_"
}
`
    return new NextResponse(psScript, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': 'inline; filename="asaf-agent-install.ps1"'
      }
    })
  }

  // Default to Linux / macOS Bash
  const shScript = `#!/usr/bin/env bash
# ==============================================================================
# NouchiX-Fleet — Sovereign Agent Deployment (Linux / macOS)
# Enclave: Groff-MSP-Enclave | USPTO #73565085
# ==============================================================================
set -euo pipefail

HUB_URL="${hubUrl}"
TOKEN="${ENROLLMENT_SECRET}"
HOSTNAME=$(hostname)
IP=$(hostname -I 2>/dev/null | awk '{print $1}' || echo "127.0.0.1")
OS=$(uname -s -r)
ARCH=$(uname -m)

echo ">>> [NouchiX-Fleet] Enrolling \${HOSTNAME} (\${IP}) into Sovereign Enclave..."

PAYLOAD=$(cat <<EOF
{
  "action": "enroll",
  "token": "\${TOKEN}",
  "hostname": "\${HOSTNAME}",
  "ip": "\${IP}",
  "os": "\${OS}",
  "arch": "\${ARCH}",
  "kernelVersion": "\${OS}",
  "enclave": "Groff-MSP-Enclave"
}
EOF
)

RESPONSE=$(curl -s -X POST "\${HUB_URL}/api/fleet/agent" \\
  -H "Content-Type: application/json" \\
  -d "\${PAYLOAD}")

echo ">>> [NouchiX-Fleet] Enrollment response: \${RESPONSE}"
`
  return new NextResponse(shScript, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Content-Disposition': 'inline; filename="asaf-agent-install.sh"'
    }
  })
}
