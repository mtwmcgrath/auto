@echo off
cd /d D:\minecraft_server\minecraft_civ_god_mode

echo START CIV BOT...
start cmd /k npm run bot:civ
timeout /t 2

echo START CAMERA BOT...
start cmd /k npm run bot:cam
timeout /t 2

echo START DIRECTOR BOT...
start cmd /k npm run bot:director
timeout /t 2

echo START STORY...
start cmd /k npm run story

echo ALL SYSTEM RUNNING!