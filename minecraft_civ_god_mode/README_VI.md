# Minecraft Civilization AI — GOD MODE (Local Pack)

Pack này cung cấp:
- 🧠 Story Engine (Stone Age → Modern Age) đọc event + tạo shot plan
- 🎥 Camera cinematic tự chạy (orbit/follow)
- 🔴 OBS auto record + marker
- 🎬 Auto edit highlight bằng FFmpeg

## 1) Cài đặt
```powershell
npm install
copy .env.example .env
notepad .env
```

## 2) OBS WebSocket
OBS → Tools → WebSocket Server Settings → Enable → đặt password giống .env  
Test:
```powershell
npm run obs:test
```

## 3) OP cho bot (GÕ TRONG CONSOLE SERVER PAPER, không phải PowerShell)
```
op CivilizationBot
op CameraBot
```

## 4) Chạy
3 cửa sổ terminal:
```powershell
npm run bot:cam
npm run bot:civ
npm run story
```

## 5) Auto edit (cần FFmpeg trong PATH)
```powershell
python tools/auto_edit.py --input "recordings/your.mp4" --markers "markers/markers_session_xxx.json"
```

### Lưu ý quan trọng
- Muốn có footage đẹp để up YouTube: bạn vẫn cần Minecraft **client** để render, và OBS quay màn hình client.
- Nếu bot bị kick `unverified_username`: server đang `online-mode=true` → bot phải dùng account premium.
