$PROJECT = "D:\minecraft_server\minecraft_civ_god_mode"

Write-Host "🚀 START MINECRAFT AI GOD MODE..."

# Civilization Bot
Start-Process powershell -ArgumentList "cd $PROJECT; npm run bot:civ"

Start-Sleep -Seconds 2

# Camera Bot
Start-Process powershell -ArgumentList "cd $PROJECT; npm run bot:cam"

Start-Sleep -Seconds 2

# Director Bot
Start-Process powershell -ArgumentList "cd $PROJECT; npm run bot:director"

Start-Sleep -Seconds 2

# Story Engine (auto cinematic + OBS)
Start-Process powershell -ArgumentList "cd $PROJECT; npm run story"

Write-Host "✅ ALL BOTS + STORY STARTED!"
