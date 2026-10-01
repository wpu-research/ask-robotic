# Arayüz referansları (kullanıcı, 2026-10-01)

Kullanıcı dört referans ekran görüntüsü verdi. Aşağıda görselde **gördüklerimiz** yazılıdır; ürünlerin iç işleyişi, lisansları ya da özellik listeleri hakkında bilgi içermez. Marka, logo ve görseller kopyalanmaz; yalnız düzen ve etkileşim fikirleri alınır.

## 1. Scratch 3 (blok editörü referansı)
- Sol uçta dikey kategori sütunu: renkli yuvarlak simge + etiket (Motion, Looks, Sound, Events, Control, Sensing, Operators, Variables, My Blocks).
- Yanında seçili kategorinin blok listesi (flyout), sonra çalışma alanı; sağda sahne.
- Sahne üstünde yeşil bayrak ve kırmızı dur düğmesi; altında karakter bilgi paneli (ad, x, y, görünürlük, boyut, yön) ve karakter listesi.
- Blok şekilleri: başlık (kubbeli), yığın, C biçimli; yuvarlak beyaz sayı alanları; çalışma alanında yakınlaştırma düğmeleri.
- Üst sekmeler: Kod / Kostümler / Sesler.
→ Uygulama: Modül 1 editörü (Blockly zelos) bu düzene yaklaştırılıyor; Modül 2 için de temel.

## 2. Wokwi (Arduino simülatörü referansı)
- Solda kod düzenleyici (dosya sekmeleri: sketch, diagram, libraries), sağda simülasyon tuvali.
- Tuvalde gerçekçi Uno kartı, HC-SR04 ve LCD; renkli, eğrili kablolar.
- Üstte yeşil Başlat, Dur, Duraklat düğmeleri; sağda benzetim süresi sayacı ve hız yüzdesi.
→ Uygulama: devre laboratuvarı düzeni ve gerçekçi parça çizimleri.

## 3. Tinkercad Circuits (blok + devre referansı)
- Tuvalde gerçekçi Uno; sağda "Kod" paneli: blok kategorileri (Output, Input, Notation, Control, Math, Variables), blok çalışma alanı, altta seri monitör.
- Üstte "Simülasyonu başlat".
→ Uygulama: kod panelinde sonradan "Bloklar | Metin" geçişi (Scratch'ten Arduino'ya köprü); seri monitör altta şerit.

## 4. Virtual Breadboard (parça paleti referansı)
- Solda ikon ızgarası halinde parça paleti, kartlar (Uno, Mega, Nano) ve breadboard.
→ Uygulama: ikonlu, aranabilir parça paleti.

## Ortak sonuç
Üç ürün de "gerçekçi çizim + sürükle-bırak + canlı geri bildirim" ilkesinde buluşuyor. Bizim ek şartımız: tamamen sanal eğitim, dersle bütünleşik hedefler ve Türkçe.

## 5. Scratch "Başlarken" öğreticisi (kullanıcı bağlantısı, 2026-10-01)
Sayfa gerçek bir tarayıcıda yalnızca açılıp görüntülendi; içeriği kopyalanmadı. Görselde gördüğümüz:
- Çalışma alanının üstünde **yüzen öğretici kartı**: adım noktaları, "Küçült", "Kapat", sağda "sonraki" oku.
- Sahne üstünde bayrak/dur; sağ üstte sahne boyutu düğmeleri (küçük/büyük/tam ekran).
- Sahne altında karakter bilgi paneli (ad, x, y, göster/gizle, boyut, yön); sağ altta yüzen "karakter ekle" düğmeleri.
→ **Yapılacak (öneri):** ders hedeflerini yüzen bir **adım kartına** çevir: her hedef bir adım, yapılınca ✓ ve otomatik sonraki adım; Küçült/Kapat. Özellikle Modül 1 (5-7 yaş) için. Sahne boyutu anahtarı da eklenebilir.

## 6. Scratch palet, Kostümler ve Sesler ekran görüntüleri (kullanıcı, 2026-10-01; 19 dosya)
Gördüklerimiz (ürünün iç işleyişi hakkında bilgi içermez):
- **Palet tek uzun kaydırılan listedir;** kategoriler başlıklarla (Motion, Looks, Sound, Events, Control, Sensing, Operators, Variables, My Blocks) ayrılır, soldaki sütun bölüme kaydırır ve görünen bölümü vurgular.
- **Altı blok şekli:** başlık (kubbeli), yığın, C, kapak, **yuvarlak "rapor" (değer) bloğu** ve **altıgen "koşul" bloğu**. Sayı/metin alanları beyaz hap; menü alanları koyu hap; renk örnekleri yuvarlak.
- **Değişkenler:** "Değişken oluştur" ve "Liste oluştur" düğmeleri; değişkenin yanında sahnede göster onay kutusu; "Bloğumu oluştur".
- **Kostümler sekmesi:** soldaki numaralı kostüm listesi; çizim editörü (seç, yeniden şekillendir, fırça, silgi, doldur, metin, çizgi, daire, dikdörtgen), grupla/öne-arkaya, dolgu ve kontur rengi, kopyala/yapıştır/sil, yatay/dikey çevir, bitmap'e çevir, yakınlaştırma, geri al/yinele.
- **Sesler sekmesi:** dalga biçimi görüntüsü ve efektler (hızlı, yavaş, yüksek, alçak, sessiz, giderek artan/azalan, ters, robot).
- Sahne altında karakter bilgi paneli; sağ altta yüzen "karakter ekle", "arka plan ekle" düğmeleri.
Diğer ekran görüntüleri (LiteWing, Wokwi, Tinkercad, Virtual Breadboard) önceki maddelerin aynısıdır. Bir dosya (16-04-41) konuyla ilgisiz bir görseldi, kullanılmadı.

→ **Modül 2 editörü için sonuçlar:** Blockly (zelos) altı şeklin hepsini destekler (rapor = `output` bağlantısı, koşul = `Boolean` çıkış, altıgen). Palet "kategoriye kaydır" davranışı için flyout tek liste ayarlanabilir. Kostüm ve ses sekmeleri Modül 1'de kapsam dışıdır (çizim aracı yok); Modül 2 için "Kostümler" (hazır kostüm seçimi ve basit vektör çizim) ve "Sesler" (hazır sesler + basit efektler) ayrı bir iş olarak planlanmalı.

## 7. Cirkit Designer arayüzü ve örnek proje galerisi (kullanıcı, 2026-10-01; 20 ekran görüntüsü)
Ekran görüntüleri incelendi (canlı site açılmadı); ürünün iç işleyişi hakkında bilgi içermez.
- **Dört mod:** Tasarım | Kod | Simüle et | Yükle. (Bizde "Yükle" yok: fiziksel kart yok.)
- **Parça kitaplığı:** arama kutusu, "Diyagram parçaları / Simülasyon parçaları" sekmeleri, küçük resimli ızgara; 80+ parça (Uno, Mega, Pico, ESP32, röle, LCD'ler, 7-segment, 74HC595, keypad, DHT11/22, DS1307/DS3231, joystick, transistör, adım motoru, nem, gaz sensörleri…).
- **Sağ üstte "Bileşen özellikleri" paneli**, tuvalde yüzen "Kodu düzenle" ve "Yapay zekâyla kablola" düğmeleri; araç çubuğunda metin, kablo, ızgara, döndür, sığdır, yakınlaştır, sil.
- **Alt ortada yüzen yapay zekâ sohbet çubuğu:** "Devreyi değiştir / Kod yaz / Hata ayıkla" kipleri, "Proje hedefleri ekle".
- **Kod sekmesi:** mikrodenetleyici seçici, Doğrula, `sketch.ino` + `documentation.txt` sekmeleri, kitaplıklar, "Yapay zekâ araç kutusu" (otomatik kod üret, hata ayıkla, kodu gözden geçir, kod hakkında soru sor), alt kısımda doğrulama çıktısı.
- **Simüle sekmesi:** Başlat ve Hata ayıkla düğmeleri, "Simülasyon konsolu".
- **Öne çıkan simülasyon projeleri galerisi:** hazır, kablolanmış çalışan devreler (Hotel Safe, Pong/OLED, DHT11 + LCD, DS1307 saat + LCD, 74HC595, L298N'li robot, röle, RGB PWM, HC-SR04, PIR, MPU6050, joystick, keypad, 7-segment, RC522…). "Projeyi aç" ile incelenir, çalıştırılır, uyarlanır.

→ **Uygulama notları**
1. **"Hazır devre / çözümü incele"**: derslerde, öğrenci denedikten sonra çalışan çözümü laboratuvarda açıp inceleyebilsin (çözülmüş örnek etkisi). Etkinlik `solution()` verisi zaten var.
2. **Yapay zekâ öğretmen yardımı** (Claude tabanlı) — "ipucu iste" (hazır cevap vermeden), "kodumu gözden geçir", "bu hatayı açıkla". Cirkit'in AI araç kutusuna benzer; AI hattı ve Modül 7 ile bağlanır. Maliyet, güvenlik ve çocuk verisi (KVKK) kararları ayrıca verilmeli.
3. **Sanal ölçüm** (multimetre karşılığı): parçaya tıklayınca uç gerilimi/akımı. Çekirdek sözleşmesine `PartRuntime.meas` eklendi.
4. Galerideki proje adları (Hotel Safe, DHT11 + LCD, DS1307 saat, L298N robot) müfredattaki proje dersleriyle örtüşüyor; kapsam makul.
