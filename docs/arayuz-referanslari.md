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
