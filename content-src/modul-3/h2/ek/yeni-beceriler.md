# Modül 3 Hafta 2: yeni beceri kimlikleri (koordinatör için)

`ek/*.json` içindeki testler aşağıdaki YENİ kimlikleri kullanır. `apps/web/src/lib/skills.ts` içindeki `SKILLS` listesine eklenene kadar `node tools/content/build.mjs modul-3` "bilinmeyen beceri" hatası verir. Mevcut kimlikler (digital-out, prog-timing, prog-debug, prog-loops-arrays, circuit-wiring, elec-ohm, prog-planning) olduğu gibi kullanılmıştır.

## SKILLS'e eklenecekler
```ts
  { id: 'digital-in', label: 'Dijital giriş', area: 'Programlama', description: 'Bir pini INPUT_PULLUP ile giriş yapar, digitalRead ile okur ve "basılı = LOW" mantığını yorumlar.' },
  { id: 'prog-conditions', label: 'Koşullar', area: 'Programlama', description: 'if, else if, else ve switch ile programa karar verdirir; == ile = farkını bilir.' },
  { id: 'prog-logic', label: 'Mantık işleçleri', area: 'Programlama', description: '&&, || ve ! ile koşulları birleştirir; bool değişkenlerle doğruluk tablosunu yorumlar.' },
  { id: 'input-debounce', label: 'Debounce ve kenar', area: 'Programlama', description: 'Buton sıçramasını, seviye ile kenar farkını ve debounce yöntemini bilir.' },
  { id: 'serial-io', label: 'Seri haberleşme', area: 'Programlama', description: 'Serial ile değer yazdırır, komut okur (available, read) ve sayı ayrıştırır (parseInt).' },
  { id: 'prog-state', label: 'Durum ve değişken', area: 'Programlama', description: 'Program durumunu loop() dışındaki değişkenlerde tutar (sayaç, önceki durum); genel ve yerel değişken farkını bilir.' },
```

## LESSON_SKILLS'e eklenecekler (test: soru becerileri bu listelerin alt kümesi olmalı)
```ts
  'arduino-temelleri:2:1': ['digital-in', 'digital-out', 'circuit-wiring', 'prog-debug', 'elec-ohm'],
  'arduino-temelleri:2:2': ['prog-conditions', 'prog-logic', 'digital-in', 'digital-out', 'prog-debug'],
  'arduino-temelleri:2:3': ['input-debounce', 'digital-in', 'digital-out', 'prog-timing', 'prog-debug', 'prog-state', 'prog-conditions'],
  'arduino-temelleri:2:4': ['serial-io', 'prog-loops-arrays', 'prog-timing', 'prog-debug', 'prog-conditions'],
  'arduino-temelleri:2:5': ['prog-state', 'input-debounce', 'serial-io', 'prog-conditions', 'prog-logic', 'digital-out', 'prog-timing', 'circuit-wiring', 'prog-planning', 'prog-debug'],
```
Not: 2:1 eşlemesinde `circuit-wiring`, 2:3'te `prog-conditions` yalnız bazı sorularda kullanılır; test yalnız alt küme denetler.
