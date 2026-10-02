# Modül 5 Hafta 2: yeni beceri kimlikleri (koordinatör için)

`ek/*.json` içindeki testler aşağıdaki YENİ kimlikleri kullanır. `apps/web/src/lib/skills.ts` içindeki `SKILLS` listesine eklenene kadar `node tools/content/build.mjs modul-5` "bilinmeyen beceri" hatası verir. Mevcut kimlikler (prog-debug, prog-timing, prog-loops-arrays) olduğu gibi kullanılmıştır.

## SKILLS'e eklenecekler
```ts
  { id: 'rob-bumper', label: 'Tampon sensörü', area: 'Robotik', description: 'Tampon anahtarını INPUT_PULLUP ile okur (basılı = LOW), sol/sağ/ön çarpmayı ayırır ve engelin tersine dönüş seçer.' },
  { id: 'rob-ultrasonic', label: 'Ultrasonik mesafe', area: 'Robotik', description: 'HC-SR04 yankı süresini mesafeye çevirir (süre / 58) ve yankı gelmeme durumunu doğru yorumlar.' },
  { id: 'rob-noise', label: 'Ölçüm gürültüsü ve medyan', area: 'Robotik', description: 'Ölçümün neden oynadığını bilir; medyan filtreyi uygular ve ortalamadan farkını açıklar.' },
  { id: 'rob-threshold', label: 'Eşik ve fren payı', area: 'Robotik', description: 'Dur eşiğini sensör konumu ve fren payını hesaba katarak seçer.' },
  { id: 'rob-scan', label: 'Servo tarama', area: 'Robotik', description: 'Servo açısını bakış yönüne çevirir, en uzak yönü bulur ve açıyı dönüş süresine dönüştürür.' },
  { id: 'rob-fsm', label: 'Robot durum makinesi', area: 'Robotik', description: 'Davranışı durumlar ve geçişlerle tarif eder; millis() tabanlı süre kontrolü ve gec() ile durum değiştirir.' },
  { id: 'rob-measure', label: 'Robot başarısını ölçme', area: 'Robotik', description: 'Yol ve çarpma sayısı gibi ölçülebilir ölçütler koyar, olayı kenar algılamayla sayar, eşiği ölçümden türetir.' },
```

## LESSON_SKILLS'e eklenecekler (test: soru becerileri bu listelerin alt kümesi olmalı)
```ts
  'robotik:2:1': ['rob-bumper', 'rob-threshold', 'prog-debug', 'prog-timing'],
  'robotik:2:2': ['rob-ultrasonic', 'rob-noise', 'rob-threshold', 'prog-debug'],
  'robotik:2:3': ['rob-scan', 'rob-ultrasonic', 'prog-loops-arrays', 'prog-timing', 'prog-debug'],
  'robotik:2:4': ['rob-fsm', 'rob-bumper', 'rob-scan', 'prog-timing', 'prog-debug'],
  'robotik:2:5': ['rob-measure', 'rob-fsm', 'rob-threshold', 'prog-planning', 'prog-timing', 'prog-debug'],
```
Not: 2:5 eşlemesinde `prog-planning` testte kullanılmıyor, yalnız dersin hedef becerisi olarak listelendi. Mini testler ders dosyalarındaki ek/NN.json içindedir (NN = 81...85).
