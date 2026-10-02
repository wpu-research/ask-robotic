# Modül 11 Hafta 5: yeni beceri kimlikleri

`apps/web/src/lib/skills.ts` içindeki `SKILLS` listesine EKLENMEDİ (görev gereği o dosyaya dokunulmadı). Koordinatörün eklemesi gerekir; eklenmezse `node tools/content/build.mjs modul-11` "bilinmeyen beceri" hatasıyla durur. Kimlikler `oyun-` önekiyle başlar; başka haftalarla çakışma olursa aynı anlama geleni birleştirin.

## SKILLS'e eklenecek (id | etiket | alan | açıklama)
- `oyun-hiz-ivme` | Hız ve ivme | Oyun fiziği | Hız ile ivmenin farkını bilir; hız = ivme x süre hesabını yapar.
- `oyun-yercekimi` | Yerçekimi kurma | Oyun fiziği | Sprite'a aşağı yönlü ivme verir; sağa-sola hareket biçiminin yerçekimini neden serbest bıraktığını bilir.
- `oyun-y-ekseni` | Ekran koordinatları | Oyun fiziği | y'nin aşağı doğru arttığını, yukarının eksi ve küçük y olduğunu bilir.
- `oyun-ziplama` | Zıplama | Oyun fiziği | Zıplamayı eksi y hızı olarak kurar; tepe süresini (hız / ivme) hesaplar; yatay hızı korur.
- `oyun-karo-olay` | Karo olayları | Oyun mantığı | Geçilebilir karolarla (altın, diken, kapı) olay kurar; olay karosunun sütunu/satırı ile karoyu boşaltır.
- `oyun-olay-kenar` | Kenar tetikleme | Oyun mantığı | Karo ve çarpışma olaylarının girişte bir kez çalıştığını, çıkıp girince yeniden çalıştığını bilir.
- `oyun-harita-olcu` | Harita ve karo ölçüleri | Oyun mantığı | Karo numarasını piksele çevirir (x 16 + 8); harita ve kamera payını hesaplar.
- `oyun-mantik-kosul` | Koşul ve mantık | Oyun mantığı | `eğer/değilse` ve `ve` ile bileşik koşul kurar ve sonucunu değerlendirir.
- `oyun-carpisma-yon` | Çarpışma yönü | Oyun mantığı | Düşüş hızı ve konumla üstten (ezme) ve yandan çarpmayı ayırır; bu/diğer sprite'ı doğru kullanır.
- `oyun-seviye-tasarimi` | Seviye ve kural tasarımı | Oyun tasarımı | Oyunu kural tablosuyla planlar; skor ve kazanma kurallarının açıklarını ve zorluk dengesini değerlendirir.
- `oyun-hata-ayiklama` | Blok hatası bulma | Oyun mantığı | Blok programındaki tek bir yanlış değeri, sırayı ya da sprite seçimini bulur.

## LESSON_SKILLS eşlemesi (anahtar: modül-slug:hafta:ders)
```
'oyun-atolyesi:5:1': ['oyun-hiz-ivme', 'oyun-yercekimi', 'oyun-y-ekseni', 'oyun-hata-ayiklama'],
'oyun-atolyesi:5:2': ['oyun-ziplama', 'oyun-hiz-ivme', 'oyun-y-ekseni', 'oyun-mantik-kosul', 'oyun-hata-ayiklama'],
'oyun-atolyesi:5:3': ['oyun-karo-olay', 'oyun-olay-kenar', 'oyun-harita-olcu', 'oyun-hiz-ivme', 'oyun-hata-ayiklama'],
'oyun-atolyesi:5:4': ['oyun-carpisma-yon', 'oyun-mantik-kosul', 'oyun-y-ekseni', 'oyun-hata-ayiklama'],
'oyun-atolyesi:5:5': ['oyun-seviye-tasarimi', 'oyun-karo-olay', 'oyun-harita-olcu', 'oyun-mantik-kosul', 'oyun-ziplama', 'oyun-hata-ayiklama'],
```
