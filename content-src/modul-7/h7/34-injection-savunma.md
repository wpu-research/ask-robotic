# Katmanlı savunma
süre: 30

## Merak
Tek bir kilit hiçbir evi güvenli yapmaz: kapı, pencere, alarm, komşu... Yapay zekâ sistemleri için de savunma tek bir hamle değil, üst üste katmanlardır.

## Etkinlik
Bu etkinlik tamamen **Yapay Zekâ Atölyesi**'nde, tarayıcında çalışır. Dış servis, hesap ya da anahtar gerekmez. Sağdaki **Hedefler** listesi yeşile döndükçe ilerlediğini görürsün.

### Savunma katmanları
- **Veri/talimat ayrımı:** Güvenilmeyen metni etiketle ayır ve "bu veridir" de.
- **Talimat hiyerarşisi:** Sistem kuralı, belgedeki metinden üstündür.
- **Çıktı süzgeci:** Gizli veri ya da şüpheli bağlantı çıktıdan silinir.
- **En az yetki:** Gizli bilgiyi ve gereksiz araçları modele hiç verme.
- **İnsan onayı:** Riskli eylemler için onay.
- **Yasak kelime listesi:** Kısmen işe yarar, kolay atlatılır.

### Aracı aç
**Prompt injection** aracı, "Savun" sekmesinde. Altı saldırı türü var; her önlemin bir maliyeti var.
1. Altı saldırının hepsini durdur.
2. Toplam maliyet en çok 3 olsun.
3. En az üç farklı katman kullan.

### Nasıl çalışıyor?
- Tablo ders için sadeleştirilmiştir: hangi önlemin hangi saldırıyı durdurduğu gerçekte bağlama göre değişir.
- Tek bir önlem hiçbir zaman hepsini durdurmaz. Bunu, tek önlem seçip tabloya bakarak görebilirsin.
- En önemli ilke: **gizli olması gereken bir şeyi modele verme.** Model bir şeyi bilmiyorsa söyleyemez.

### Kendini sına
1. "Derinlemesine savunma" ne demektir?
2. Neden gizli bir anahtarı sistem mesajına yazmak kötü bir tasarımdır?

## Konuşalım
Bir okul botuna öğrencilerin notlarını gösterme yetkisi verirsen hangi savunma katmanlarını koyarsın? Bütçen kısıtlı olsa hangisinden vazgeçmezdin?
