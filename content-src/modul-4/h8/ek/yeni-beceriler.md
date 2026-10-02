# Modül 4 Hafta 8: yeni beceri kimlikleri (koordinatör: apps/web/src/lib/skills.ts'e eklenecek)

apps/web/src/lib/skills.ts değiştirilmedi. `node tools/content/build.mjs modul-4`, bu kimlikler SKILLS listesine eklenene kadar "bilinmeyen beceri" hatası verir.
Modül slug'ı: `sensorler-ve-projeler`. Ders anahtarı biçimi `modül-slug:hafta:ders` (hafta içi sıra 1-5).

## Yeni SKILLS girdileri (id | label | area | description)
- sens-sim-limits | Laboratuvarın sınırları | Sensör | Laboratuvarın hangi gerçek dünya etkilerini modellediğini ve hangilerini modellemediğini ayırt eder.
- sens-adc | ADC çözünürlüğü | Sensör | ADC basamağını (5 V / 1023) ve değerin gerilime çevrilmesini hesaplar.
- sens-noise | Gürültü ve ortalama | Sensör | Gürültüyü tanır; N okumanın ortalamasıyla yaklaşık karekök(N) kat azaltılacağını bilir.
- sens-hysteresis | Histerezis | Sensör | İki eşikle (açma ve kapama) kararlı karar verir; boşluğu gürültüden büyük seçer.
- sens-debounce | Buton sıçraması | Sensör | Sıçramayı kararlı kalma süresiyle yutar ve bu sürenin bedelini bilir.
- sens-nonblocking | Bloklamayan okuma | Sensör | delay() içinde pinin okunmadığını ve millis() ile tepkinin hızlandığını bilir.
- sens-supply | Besleme ve yük | Sensör | Analog çıkışın besleme gerilimiyle orantılı olduğunu ve pin iç direncinin etkisini hesaplar.
- sens-calibration | Kalibrasyon | Sensör | map ve constrain ile iki nokta kalibrasyonu yapar; koşul değişince yenilenmesi gerektiğini bilir.
- sens-failsafe | Güvenli varsayılan | Sensör | Sensör cevap vermediğinde ya da geçersizken tehlikeli çıkışı kapalı bırakır.
- dbg-layers | Katmanlı hata ayıklama | Hata ayıklama | Hatayı fiziksel, adres, kimlik ve veri katmanlarında alttan üste arar.
- dbg-plausibility | Değer makullüğü | Hata ayıklama | Okunan değerin fiziksel olarak makul aralıkta olup olmadığını denetler ve kontrolün geçerli olduğu koşulu bilir.
- dbg-checksum | XOR checksum | Hata ayıklama | Bir çerçevenin XOR sağlama baytını hesaplar ve bozuk çerçeveyi yakalar.
- proj-statemachine | Durum makinesi tasarımı | Proje | Girdi, durum ve çıkışı ayıran bir durum makinesi tasarlar.
- proj-integration | Sensör entegrasyonu | Proje | Birden çok sensörü tek programda birleştirir; eşikleri ve güvenli varsayılanları seçer.

## LESSON_SKILLS eşlemesi (mevcut kimlikler dahil)
- 'sensorler-ve-projeler:8:1': ['sens-sim-limits', 'sens-adc', 'sens-noise', 'sens-hysteresis', 'prog-debug']
- 'sensorler-ve-projeler:8:2': ['sens-debounce', 'sens-nonblocking', 'prog-timing', 'prog-debug']
- 'sensorler-ve-projeler:8:3': ['sens-sim-limits', 'sens-adc', 'sens-supply', 'sens-calibration', 'sens-failsafe', 'prog-debug']
- 'sensorler-ve-projeler:8:4': ['dbg-layers', 'dbg-plausibility', 'dbg-checksum', 'prog-debug']
- 'sensorler-ve-projeler:8:5': ['sens-hysteresis', 'sens-failsafe', 'proj-statemachine', 'proj-integration', 'prog-timing', 'prog-debug', 'elec-ohm']
