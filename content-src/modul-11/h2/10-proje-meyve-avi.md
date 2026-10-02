# Proje: Meyve avı
süre: 35

## Merak
Bu haftanın bütün parçalarını bir araya getirip eksiksiz bir oyun yapacaksın: çarpışma, skor, can, rastgele düşen nesneler ve bir de zamana karşı yarış. İyi bir oyunun bir amacı, bir riski ve bir sonu olur. Meyve avında amaç 8 meyve toplamak, risk bombalar, son ise kazanmak ya da kaybetmek.

## Etkinlik
Projenin yarısı hazır: sepet kediyi sağa sola yürütüyor, meyveler ve bombalar düşüyor, meyve yakalayınca skor artıyor. Eksik olanlar: bomba cezası, geri sayım, kazanma ve kaybetme kuralları.

### Oyunun kuralları
- Başlangıçta 5 canın ve 45 saniyen var.
- Meyve yakalarsan skor 1 artar. Skor 8 olunca kazanırsın.
- Bombaya değersen 1 can kaybedersin ve ekran sallanır.
- Canın biterse ya da süre dolarsa kaybedersin.

### Önce incele
1. ▶ düğmesine basıp oyunu çalıştır. Neler çalışıyor, neler eksik?
2. Blokları oku: kaç tane olay bloğu var? Her biri ne zaman çalışıyor?

### Bomba cezası
1. `bir [Oyuncu] sprite'ı bir [Düşman] sprite'ına çarpınca` olayını koy.
2. İçine sırayla `canı [-1] değiştir`, `ekranı [250] ms salla`, `[patlama] melodisini çal` ve `[diğer sprite] sprite'ını sil` bloklarını tak.

### Geri sayım
1. `oyun başlayınca` bloğunun içine **Oyun** kategorisinden `geri sayımı [30] saniyeden başlat` bloğunu ekle. Sayıyı 45 yap.
2. `süre bitince` olay bloğunu getir. İçine `ekranda [Süre doldu!] yaz, [2] saniye`, `[kayıp] melodisini çal` ve `oyunu bitir: [kaybettin]` bloklarını tak.

### Kazanma
1. Meyve olayının (`bir [Oyuncu] sprite'ı bir [Yiyecek] sprite'ına çarpınca`) en altına `eğer [koşul] ise` bloğu ekle.
2. Koşul olarak **Mantık** kategorisindeki karşılaştırma bloğunu kullan: `skor` bloğu **≥** 8.
3. İçine `ekranda [Kazandın!] yaz, [2] saniye`, `[zafer] melodisini çal` ve `oyunu bitir: [kazandın]` bloklarını koy.

### Kaybetme
`can bitince` olay bloğunu getir. İçine `ekranda [Canların bitti!] yaz, [2] saniye`, `[kayıp] melodisini çal` ve `oyunu bitir: [kaybettin]` bloklarını koy.

### Çalıştır ve dene
1. ↺ düğmesine bas ve oyunu baştan sona oyna. Bir kez kazan, bir kez bilerek kaybet.
2. Hedefler panelindeki yedi maddenin hepsi yeşil mi?

Beklenen sonuç: Üstte skor, kalp ve kalan süre görünür. 8 meyve toplarsan kazanırsın. Canların biterse ya da süre dolursa kaybedersin.

### Nasıl çalışıyor?
- Oyunun parçaları birbirinden bağımsız **olaylara** bölünmüştür: sahne kurulumu, meyve düşürme, bomba düşürme, çarpışmalar, can bitince, süre bitince. Her olay yalnız kendi işiyle uğraşır.
- Oyun tek bir sonla bitmeli. Kazanma ya da kaybetme bloğu çalıştığı anda oyun biter ve diğer olaylar durur.
- `kalan süre (sn)` bloğu geri sayımda ne kadar zaman kaldığını verir. Kazanma mesajına eklemek için `birleştir` bloğuyla kullanabilirsin.

### Kendi dokunuşunu kat
Aşağıdakilerden en az ikisini dene:
1. Kazanma skorunu 12 yap ve süreyi 60 saniyeye çıkar. Oyun dengeli mi?
2. Meyve düşme hızını artır. Hangi hız eğlenceli, hangisi imkânsız?
3. Meyveyi yakalayınca kedi `ekranda [Nefis!] yaz, [1] saniye` mesajını göstersin.
4. Arka plan rengini değiştir ya da başka bir oyuncu resmi seç.

### Sık yapılan hatalar
- Kazanma koşulunu **=** ile yazarsan ve skor 8'i atlarsa kazanamazsın. **≥** kullanmak daha güvenlidir.
- Geri sayım bloğunu hiçbir olayın içine koymazsan çalışmaz. Onu `oyun başlayınca` içine koy.
- `can bitince` ve `süre bitince` bloklarında oyunu bitirmeyi unutma. Bu blokları yazınca oyunun bitip bitmemesi sana kalır.
- Meyve ve bomba için iki ayrı çarpışma olayı yaz. Türü yanlış seçersen olay beklediğin sprite için çalışmaz.

## Konuşalım
Oyunun amacı, riski ve sonu ne? Arkadaşın oynarken en çok nerede zorlandı? Oyunu daha eğlenceli yapmak için bir şeyi değiştirmen gerekse neyi değiştirirdin?
