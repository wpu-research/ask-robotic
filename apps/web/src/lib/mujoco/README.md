# MuRoKo çalışma alanı

`components/mujoco/mujoco-lab.tsx`, CAD, montaj, elektronik ve programlama
panellerini aynı Three.js sahnesi ve MuJoCo WASM motoruna bağlar.

## Montaj ve elektronik

- `mikro/assembly.ts`: en çok 24 parçalık, döngüsüz montaj ağacı. Konumlar
  metre cinsinden üst parçanın montaj noktasına göredir.
- `mikro/assembly-mjcf.ts`: servo mafsalları, konum eyleyicileri ve HC-SR04
  mesafe kanalları. Servo altındaki parçalar gerçek fizik gövdesiyle döner.
- `assembly-circuit.ts`: Uno, servo ve ultrasonik sensörün devre karşılıkları,
  boş pin tahsisi, fizik eşlemeleri ve mevcut kablolamaya göre Arduino örneği.
  Elle kesilen kablolar sonraki eşitlemede geri eklenmez.
- `electronics-models.ts`, `mechanical-models.ts`: uygulamanın ürettiği ayrıntılı
  görseller. USB, pinler, yongalar, jant ve lastik sırtları görsel ayrıntıdır;
  çarpışma geometrileri basit MuJoCo ilkelleri olarak kalır.

## Kayıt ve dosyalar

Tasarım `ask:tasarim:current:v1`, devre, eşlemeler ve Arduino kodu
`ask:muroko:electronics:v1` anahtarına tarayıcıda kaydedilir. Sunucuda proje
depolaması yoktur. Dosya menüsü bunları birlikte `.muroko.json` olarak taşır.
Dosya biçimi `macademia.muroko.project`, sürüm 1; en fazla 4 MB.
Blockly/Python çalışma alanı bu proje dosyasına dahil değildir.

## Destek sınırları

- ESP32 montaj ve 3B model olarak desteklenir; ESP32 firmware emülasyonu yoktur.
- Boolean işlemleri yalnız eksen hizalı kutularda çalışır. Sonuç parçaları
  düzenleyicinin kalınlık ve boyut sınırlarına sığmıyorsa işlem reddedilir.
- Blockly doğrudan MuJoCo motor/sensör programıdır; Arduino C++ blok üreticisi değildir.
- Hazır MuJoCo robot paketleri katalogda korunur ancak çalışma alanından gizlidir.

## Doğrulama

```sh
pnpm --filter web exec tsc --noEmit
pnpm --filter web exec vitest run src/components/mujoco src/lib/mujoco src/lib/mikro
```

`assembly-mjcf.test.ts`, gerçek WASM motorunda eklem ve bağlı parça hareketini;
`wiring-integration.test.ts`, derlenmiş Arduino kodundan fizik kontrolüne giden
bağlantıyı sınar.
