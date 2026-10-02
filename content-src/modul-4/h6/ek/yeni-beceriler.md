# Modül 4 Hafta 6: yeni beceri kimlikleri

Bu hafta `apps/web/src/lib/skills.ts` içinde olmayan kimlikler kullanır. `build.mjs` bilinmeyen kimlikte durur; bu yüzden aşağıdaki girdiler `SKILLS` dizisine ve `LESSON_SKILLS` eşlemesine eklenmelidir (koordinatör tarafından).

## SKILLS girdileri
```
{ id: 'ir-nec', label: 'IR ve NEC protokolü', area: 'Haberleşme', description: 'IR kumandanın süreyle kodladığı NEC mesajını (ön darbe, 32 bit, ters kopya) ve alıcının ters çıkışını anlar.' },
{ id: 'bit-ops', label: 'Bit işlemleri', area: 'Programlama', description: 'Bit kaydırma (<<), |= ve veri türü genişliğiyle (int 16, uint32_t 32 bit) bir sayıyı bit bit oluşturur.' },
{ id: 'keypad-matrix', label: 'Matris tuş takımı', area: 'Girdi', description: 'Satır-sütun taramasıyla az pinle çok tuş okumayı ve getKey() davranışını bilir.' },
{ id: 'c-strings', label: 'Karakter dizileri', area: 'Programlama', description: "C yazılarını ('\\0' ile biten char dizileri) biriktirir, boyutlandırır ve strcmp/memcmp ile karşılaştırır." },
{ id: 'rfid-spi', label: 'RFID ve SPI', area: 'Haberleşme', description: 'RFID kartın UID ile okunmasını, SPI hattının dört telini ve RC522 modülünün 3,3 V gereksinimini bilir.' },
{ id: 'pin-budget', label: 'Pin bütçesi', area: 'Tasarım', description: 'Projedeki parçaların pin ihtiyacını toplar ve kartın pin sayısıyla karşılaştırır.' },
{ id: 'access-security', label: 'Erişim güvenliği', area: 'Tasarım', description: 'UID/PIN sınırlarını, master PIN, deneme sınırı ve ortak hata sayacının neden gerekli olduğunu bilir.' },
{ id: 'eeprom-store', label: 'EEPROM ile kalıcı veri', area: 'Programlama', description: 'EEPROM haritası çıkarır, kurulum işareti ve update kullanır, sayacı en son yazarak güç kesintisine dayanır.' },
{ id: 'prog-millis', label: 'Bloklamayan zamanlama', area: 'Programlama', description: 'millis() ile bitiş anı hesaplar ve taşmaya dayanıklı karşılaştırmayla delay kullanmadan süre yönetir.' },
{ id: 'state-machine', label: 'Durum makinesi', area: 'Programlama', description: 'Durumları ve geçişleri tabloya döker, tek bir durum değişkeniyle yönetir.' },
{ id: 'servo-control', label: 'Servo kontrolü', area: 'Donanım', description: 'Servoyu write(açı) ile sürer, açı-darbe ilişkisini ve gerçek devredeki ayrı besleme gereğini bilir.' }
```

## LESSON_SKILLS girdileri (modül slug: sensorler-ve-projeler)
```
'sensorler-ve-projeler:6:1': ['ir-nec', 'bit-ops', 'prog-debug'],
'sensorler-ve-projeler:6:2': ['keypad-matrix', 'c-strings', 'prog-debug'],
'sensorler-ve-projeler:6:3': ['rfid-spi', 'pin-budget', 'c-strings', 'access-security', 'prog-debug'],
'sensorler-ve-projeler:6:4': ['eeprom-store', 'access-security', 'prog-loops-arrays', 'prog-debug'],
'sensorler-ve-projeler:6:5': ['prog-millis', 'state-machine', 'access-security', 'circuit-wiring', 'servo-control', 'prog-debug'],
```
Not: `prog-debug`, `prog-loops-arrays` ve `circuit-wiring` mevcut kimliklerdir. Başka haftalar aynı kimlikleri (örneğin `prog-millis`, `state-machine`, `c-strings`) tanımlıyorsa tekilleştirin.

## Formül testi önerisi (platform-icerik.test.ts)
- `m4h6d1-q3`: 9 + 2.25 + 0.5625 = 11.8125 ms
- `m4h6d2-q1`: 3 + 4 = 7 pin
- `m4h6d3-q1`: (3 + 2) + 1 + 1 + 2 = 9 pin
- `m4h6d4-q1`: 10 + 2 * 4 = 18; `m4h6d4-q5`: 100000 / 50 = 2000
- `m4h6d5-q1`: Math.floor((30000 - 12300 + 999) / 1000) = 18; `m4h6d5-q5`: 544 + (2400 - 544) / 2 = 1472
