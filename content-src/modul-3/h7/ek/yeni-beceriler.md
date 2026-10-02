# Modül 3 Hafta 7: yeni beceri kimlikleri

Bu dosya koordinatör içindir (build.mjs onu okumaz). H7 soruları aşağıdaki kimlikleri kullanır; `apps/web/src/lib/skills.ts` içinde henüz tanımlı değillerse `node tools/content/build.mjs modul-3` "bilinmeyen beceri" hatası verir. Başka hafta ajanları aynı kavramı farklı kimlikle tanımlamış olabilir (özellikle `prog-fsm` ve `sensor-ntc`); çakışmada tek kimlik seçilip `NN.json` dosyalarında değiştirilmeli.

## SKILLS'e eklenecek girdiler
```
{ id: 'bits-bytes', label: 'Bit, bayt ve onaltılık', area: 'Programlama', description: 'Bir baytın bitlerini çubuk/çıkışlarla eşler; 0b ve 0x yazımını ondalığa çevirir.' },
{ id: 'shift-register', label: '74HC595 ve shiftOut', area: 'Donanım', description: 'Üç pinle sekiz çıkış sürer; veri, saat ve mandal görevlerini ve bit sırasını bilir.' },
{ id: 'lcd-display', label: 'LCD 16x2 ekran', area: 'Donanım', description: 'LiquidCrystal pin sırası, begin, setCursor, print ve kontrast ayarını kullanır.' },
{ id: 'i2c-bus', label: 'I2C ve Wire', area: 'Haberleşme', description: 'SDA/SCL pinlerini, cihaz adresini ve adres taramasını bilir; adres uyuşmazlığını bulur.' },
{ id: 'mem-eeprom', label: 'EEPROM', area: 'Bellek', description: 'read, update, put/get kullanır; boş hücre (255) ve yazma ömrünü (yaklaşık 100.000) hesaba katar.' },
{ id: 'mem-sram', label: 'SRAM ve String', area: 'Bellek', description: 'Flash, SRAM ve EEPROM farkını bilir; String ve F() kullanımının SRAM etkisini açıklar.' },
{ id: 'ctl-hysteresis', label: 'Histerezis', area: 'Kontrol', description: 'Açma ve kapama için iki eşik kullanarak rölenin titremesini önler.' },
{ id: 'prog-fsm', label: 'Durum makinesi', area: 'Programlama', description: 'Durumları, geçiş koşullarını ve durumdan türetilen çıkışı tasarlar (Hafta 6 ile ortak olabilir).' },
{ id: 'sensor-ntc', label: 'NTC ile sıcaklık', area: 'Sensör', description: 'NTC gerilim bölücüsünden ADC değerini dirence ve sıcaklığa çevirir (Hafta 3 ile ortak olabilir).' },
```

## LESSON_SKILLS'e eklenecek eşlemeler
Soruların `skills` etiketleri bu kümelerin alt kümesidir.
```
'arduino-temelleri:7:1': ['shift-register', 'bits-bytes', 'digital-out', 'circuit-wiring', 'prog-debug'],
'arduino-temelleri:7:2': ['lcd-display', 'circuit-wiring', 'prog-debug'],
'arduino-temelleri:7:3': ['i2c-bus', 'bits-bytes', 'circuit-wiring', 'lcd-display', 'prog-debug'],
'arduino-temelleri:7:4': ['mem-eeprom', 'mem-sram', 'bits-bytes', 'prog-debug'],
'arduino-temelleri:7:5': ['ctl-hysteresis', 'prog-fsm', 'mem-eeprom', 'sensor-ntc', 'lcd-display', 'i2c-bus', 'prog-planning', 'prog-timing', 'prog-debug', 'circuit-wiring'],
```

## Sayısal cevapların doğrulaması (Node ile)
- m3h7d31-q1: 1 + 8 + 64 = 73. q4: 3 × 8 = 24. predict: sim ile 0b00000101 baytı çözüldü (bit 0 = QA, bit 2 = QC).
- m3h7d33-q1: 0x3F = 63. q3: println(byte) ondalık yazar (sim: cihazsız sketch derlenir).
- m3h7d34-q1: 100000 × 30 / 86400 = 34,72 gün. q2, q3, q5: sim ile çalıştırıldı (12 ve 255; 300 → 44; struct 7 bayt, 20-26 dolu, sonraki 27).
- m3h7d35-q1: 10000 × 600 / 423 = 14184,4 Ω. q2: histerezis dizisi Node ile 0 1 1 1 0 0. q4: ADC 1022 için -77,4 °C. q5: 22 → 25 → 22, update yazmaz.
