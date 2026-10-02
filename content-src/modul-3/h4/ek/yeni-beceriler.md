# Modül 3 Hafta 4: yeni beceri kimlikleri

`apps/web/src/lib/skills.ts` dosyasına eklenmesi gereken kimlikler (bu hafta yazan ajan o dosyayı DEĞİŞTİRMEDİ). `NN.json` içindeki `skills` etiketleri bu kimlikleri ve mevcut kimlikleri kullanır. Eklenmezse `node tools/content/build.mjs modul-3` "bilinmeyen beceri" hatası verir.

## SKILLS
| id | label | area | description |
|---|---|---|---|
| `pwm-output` | PWM ve analogWrite | Programlama | analogWrite (0-255) ile doluluk oranını ve ortalama gerilimi hesaplar; PWM pinlerini (~) bilir. |
| `rgb-color` | RGB renk karışımı | Elektrik | Ortak katot/anot RGB LED'i bağlar; (R, G, B) değerleriyle renk üretir. |
| `sound-tone` | Frekans ve tone | Programlama | Frekans, periyot ve oktav ilişkisini bilir; tone/noTone ile nota çalar; aktif/pasif buzzer farkını ve Timer2 çakışmasını (D3, D11) bilir. |
| `prog-functions` | Fonksiyonlar | Programlama | Parametreli ve dönüş değerli fonksiyon yazar, çağırır ve işi fonksiyonlara böler. |
| `prog-scope` | Kapsam | Programlama | Yerel ve global değişken farkını ve parametrenin kopya olarak geçtiğini bilir. |

## LESSON_SKILLS
```ts
'arduino-temelleri:4:1': ['pwm-output', 'prog-timing', 'prog-loops-arrays', 'prog-debug'],
'arduino-temelleri:4:2': ['rgb-color', 'pwm-output', 'circuit-wiring', 'prog-loops-arrays', 'prog-debug', 'elec-led-resistor', 'elec-ohm'],
'arduino-temelleri:4:3': ['sound-tone', 'pwm-output', 'prog-timing', 'prog-debug', 'circuit-wiring'],
'arduino-temelleri:4:4': ['prog-functions', 'prog-scope', 'prog-timing', 'prog-debug'],
'arduino-temelleri:4:5': ['prog-planning', 'prog-functions', 'prog-scope', 'prog-timing', 'prog-debug', 'sound-tone', 'pwm-output', 'rgb-color'],
```
