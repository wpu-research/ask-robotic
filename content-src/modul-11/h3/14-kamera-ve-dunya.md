# Büyük bir dünya, kayan kamera
süre: 25

## Merak
Bazı oyun dünyaları ekrandan çok daha büyüktür. Ekran 160 piksel geniştir ama dünya 480 piksel olabilir. O zaman ekranda ne görürüz? Kamera. Kamera dünyanın bir parçasını gösterir ve oyuncu yürüdükçe kayar.

## Etkinlik
"Ova" haritası 30 karo geniş, yani 480 piksel. Ekranın üç katı! Kedi ok tuşlarıyla yürüyor ama kamera sabit, bu yüzden kedi sağa gidince ekrandan çıkıp kayboluyor. Haritada ayrıca 7 elma işareti var: bunlar elma resimli karolar. Onları toplanabilir elmalara çevireceksin.

### Kamera
- `kamera [kedi] sprite'ını takip etsin` bloğu kamerayı kediye bağlar. Kedi yürüdükçe görüntü kayar. Dünya ekrandan küçükse kamera kaymaz.
- `kamera sabit kalsın` bloğu takibi bırakır.
- Haritanın büyüklüğünü `harita [genişliği] (karo)` bloğu söyler.

### Karoyu sprite'a çevirmek
Haritadaki elma karoları sadece resimdir. Toplanabilmesi için gerçek sprite olmaları gerekir. `tüm [Elma] karolarını [Yiyecek] sprite'ına çevir` bloğu haritadaki bütün elma karolarını boşaltır ve her birinin yerine bir **Yiyecek** sprite'ı koyar.

### Blokları kur
1. **Harita** sekmesine geç ve ovayı incele. Kırmızı kesikli çerçeve oyunun ilk ekranını gösterir: haritanın çok küçük bir bölümü. Ağaçlar duvar.
2. **Bloklar** sekmesine dön. `oyun başlayınca` içindeki bloklara bak: harita yüklenmiş, kedi 1. sütun 4. satıra konmuş ve tuşlarla yürüyor. Toplama olayı da hazır: kedi bir Yiyecek'e değince skor 1 artıyor ve yiyecek siliniyor.
3. **Sahne / Harita** kategorisinden `kamera [bu sprite] sprite'ını takip etsin` bloğunu `oyun başlayınca` içinin en altına tak. `bu sprite` yerine `kedi` değişkenini koy.
4. Aynı yere `tüm [Elma] karolarını [Yiyecek] sprite'ına çevir` bloğunu ekle. Karo olarak **Elma**, tür olarak **Yiyecek** seç.
5. ▶ düğmesine bas. Kediyi sağa yürüt. Görüntü kayar ve yolda elma toplarsın.

Beklenen sonuç: Kamera kediyi izler. Haritadaki 7 elma, toplanabilen sprite'lara dönüşür. Elma toplayınca skor artar.

### Nasıl çalışıyor?
- Kamera, takip ettiği sprite'ı ekranın ortasında tutmaya çalışır. Dünyanın kenarına yaklaşınca durur, boşluk göstermez.
- Harita dünyadır; ekran bu dünyaya açılan bir penceredir. Sen kamerayla bu pencerenin yerini seçersin.
- Çevirme bloğundan sonra haritada elma karosu kalmaz. Elmalar sprite olmuştur. Sprite'lar hareket edebilir ve çarpışma olayına katılabilir. Karolar katılamaz.
- Çevrilen her sprite için `bir [Yiyecek] sprite'ı oluşunca` olayı çalışır. Bunu kullanarak elmalara hareket, ses ya da başka özellik verebilirsin.

### Dene
1. Elmalara hız ver: `bir [Yiyecek] sprite'ı oluşunca` olayını yaz ve içine `[bu sprite] hızı x [0] y [20]` koy. Elmalar aşağı kayar mı?
2. Kamerayı kedi yerine sabit bırak: `kamera sabit kalsın` kullan. Ne değişti?
3. Harita sekmesinde ovaya yeni elma karoları ya da ağaçlar ekle. Çalışıyor mu?

### Sık yapılan hatalar
- Kamerayı eklemeyi unutursan kedi ekrandan çıkar.
- Elma karolarını çevirmezsen kedi onlara değse bile bir şey olmaz. Çünkü olay Yiyecek **sprite'ı** bekler.
- Çevirme bloğunda tür olarak yanlış seçim yaparsan elmalar toplanamaz. Tür **Yiyecek** olmalı.
- Kamera bloğunu çevirme bloğundan sonra koyup `bu sprite` olarak bırakırsan kamera en son oluşan elmayı izler. Kameraya her zaman `kedi` değişkenini ver.

## Konuşalım
Büyük dünyalı oyunlar neden ekranın tamamını göstermez? Kamerasız bir oyun nasıl bir şey olurdu? Hangi oyunlarda kamera hiç kaymaz, ekran sabittir?
