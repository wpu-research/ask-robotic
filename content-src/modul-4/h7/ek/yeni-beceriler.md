# Modül 4 Hafta 7: yeni beceri kimlikleri

`apps/web/src/lib/skills.ts` değiştirilmedi. Mini testler aşağıdaki YENİ kimlikleri kullanıyor; build.mjs bunları SKILLS içinde bulamazsa hata verir. Koordinatör bunları SKILLS dizisine eklemeli ve LESSON_SKILLS eşlemesini yazmalı.

## SKILLS'e eklenecek satırlar
```
{ id: 'rtc-time', label: 'RTC ve gerçek zaman', area: 'Zaman ve veri', description: 'RTC modülünden tarih ve saati okur, kurar (adjust, lostPower) ve RTC ile alarm yazar.' },
{ id: 'sd-storage', label: 'SD kart ve dosya', area: 'Zaman ve veri', description: 'SD kartı SPI ile bağlar; dosya açma, yazma, close/flush ve 8.3 ad kuralını bilir.' },
{ id: 'data-logging', label: 'Veri kaydı (CSV)', area: 'Zaman ve veri', description: 'Zaman damgalı CSV satırı üretir; sütun, ondalık ayırıcı ve boş (NaN) alan kurallarını bilir.' },
{ id: 'serial-protocols', label: 'UART, I2C, SPI', area: 'Zaman ve veri', description: 'Üç protokolü hat sayısı, hız ve cihaz seçimi bakımından karşılaştırır; bit sayısından aktarım süresini hesaplar.' },
```

## LESSON_SKILLS eşlemesi (mevcut kimlikler de kullanılıyor: prog-timing, prog-debug, prog-planning, circuit-wiring)
```
'sensorler-ve-projeler:7:1': ['rtc-time', 'prog-timing', 'prog-debug', 'circuit-wiring'],
'sensorler-ve-projeler:7:2': ['sd-storage', 'serial-protocols', 'prog-debug', 'circuit-wiring'],
'sensorler-ve-projeler:7:3': ['data-logging', 'rtc-time', 'prog-debug', 'prog-planning'],
'sensorler-ve-projeler:7:4': ['serial-protocols', 'prog-debug', 'circuit-wiring'],
'sensorler-ve-projeler:7:5': ['data-logging', 'rtc-time', 'prog-timing', 'prog-planning', 'prog-debug'],
```
