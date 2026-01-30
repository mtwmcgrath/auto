# START_GOD_MODE.ps1 (Fixed - Windows)
# 1-click: Server + OBS + Bots + Story + AutoEdit

$PROJECT_DIR = "D:\minecraft_server\minecraft_civ_god_mode"

# ---- EDIT THESE 2 LINES TO YOUR REAL SERVER PATH/JAR ----
$SERVER_DIR  = "D:\minecraft_server\versions\1.20.1"
$SERVER_JAR  = "paper-1.20.1.jar"

$JAVA_EXE    = "java"
$JAVA_XMS    = "2G"
$JAVA_XMX    = "6G"

# OBS path (change if different)
$OBS_EXE     = "C:\Program Files\obs-studio\bin\64bit\obs64.exe"

# Minecraft Launcher path (optional - script can run without it)
$MC_LAUNCHER_EXE = "C:\Program Files (x86)\Minecraft Launcher\MinecraftLauncher.exe"

# Python
$PYTHON_EXE  = "python"

function Start-NewPSWindow([string]$title, [string]$command) {
  $arg = "-NoExit -Command `"`$Host.UI.RawUI.WindowTitle='$title'; $command`""
  Start-Process -FilePath "powershell.exe" -ArgumentList $arg
}

Write-Host "=== START GOD MODE ==="
Write-Host "Project: $PROJECT_DIR"

# go project
Set-Location $PROJECT_DIR

# sanity checks
if (!(Test-Path "$PROJECT_DIR\package.json")) { Write-Host "ERROR: package.json not found in project dir"; exit 1 }

# create folders
foreach ($d in @("recordings","markers","outputs","runtime")) {
  if (!(Test-Path "$PROJECT_DIR\$d")) { New-Item -ItemType Directory -Path "$PROJECT_DIR\$d" | Out-Null }
}

# 1) Start MC Server
Write-Host "Starting Minecraft Server..."
if (!(Test-Path $SERVER_DIR)) { Write-Host "ERROR: SERVER_DIR not found: $SERVER_DIR"; exit 1 }
if (!(Test-Path (Join-Path $SERVER_DIR $SERVER_JAR))) { Write-Host "ERROR: SERVER_JAR not found: $SERVER_JAR"; exit 1 }

$serverCmd = "cd `"$SERVER_DIR`"; $JAVA_EXE -Xms$JAVA_XMS -Xmx$JAVA_XMX -jar `"$SERVER_JAR`" nogui"
Start-NewPSWindow "MC SERVER" $serverCmd
Start-Sleep -Seconds 8

# 2) Start OBS
Write-Host "Starting OBS..."
if (Test-Path $OBS_EXE) {
  Start-Process -FilePath $OBS_EXE
  Start-Sleep -Seconds 5
} else {
  Write-Host "WARN: OBS exe not found. Update OBS_EXE in script."
}

# 3) Start Minecraft Launcher (optional)
if (Test-Path $MC_LAUNCHER_EXE) {
  Start-Process -FilePath $MC_LAUNCHER_EXE
  Write-Host "NOTE: Please click PLAY and join server (localhost). Keep Minecraft open."
} else {
  Write-Host "NOTE: Launcher path not found. Open Minecraft manually."
}

# 4) Start bots (3 windows)
Write-Host "Starting bots..."
Start-NewPSWindow "BOT CAMERA"   "cd `"$PROJECT_DIR`"; npm run bot:cam"
Start-Sleep -Seconds 2
Start-NewPSWindow "BOT CIV"      "cd `"$PROJECT_DIR`"; npm run bot:civ"
Start-Sleep -Seconds 2
Start-NewPSWindow "BOT DIRECTOR" "cd `"$PROJECT_DIR`"; npm run bot:director"
Start-Sleep -Seconds 2

# 5) Test OBS websocket (in this window)
Write-Host "Testing OBS websocket..."
npm run obs:test

# 6) Run story (in this window)
Write-Host "Running story..."
npm run story

# 7) Pick newest markers + recording
$markerFile = Get-ChildItem "$PROJECT_DIR\markers" -Filter "markers_session_*.json" | Sort-Object LastWriteTime -Desc | Select-Object -First 1
if (-not $markerFile) { Write-Host "ERROR: No markers found"; exit 1 }

$recFile = Get-ChildItem "$PROJECT_DIR\recordings" -Filter "*.mp4" | Sort-Object LastWriteTime -Desc | Select-Object -First 1
if (-not $recFile) { Write-Host "ERROR: No recordings mp4 found"; exit 1 }

Write-Host "Newest markers: $($markerFile.Name)"
Write-Host "Newest recording: $($recFile.Name)"

# 8) Auto edit
Write-Host "Auto editing..."
& $PYTHON_EXE "tools\auto_edit.py" --input "recordings\$($recFile.Name)" --markers "markers\$($markerFile.Name)"

Write-Host "DONE -> outputs\final_youtube.mp4"
