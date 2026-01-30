Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run bot:cam"
Start-Sleep -Seconds 2
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run bot:civ"
Start-Sleep -Seconds 2
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run story"
