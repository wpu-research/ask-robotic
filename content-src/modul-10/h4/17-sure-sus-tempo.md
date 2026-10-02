# Süre, sus ve tempo
süre: 20

## Merak
Aynı şarkıyı yavaş ve hızlı çalarsan başka bir şarkı gibi olur. Şarkıyı bir ninni mi, bir marş mı yapan şey, notalardan çok süreleridir. Kartın içinde bir "metronom" yani tempo ayarı var. Onu değiştirince bütün notaların süresi aynı anda değişir.

## Etkinlik
### Vuruş ve tempo
Müzikte süre **vuruş** ile ölçülür. Kartta **tempo**, bir dakikada kaç vuruş çalındığını söyler. Başlangıç değeri 120'dir.

Kart bir "1/4 vuruş"un süresini şöyle hesaplar: 60 000 ms ÷ tempo.

| Tempo | 1/4 vuruş | 1/8 vuruş | 1/2 vuruş |
|---|---|---|---|
| 60 | 1000 ms | 500 ms | 2000 ms |
| 120 | 500 ms | 250 ms | 1000 ms |
| 240 | 250 ms | 125 ms | 500 ms |

Tempo büyüdükçe notalar kısalır, müzik hızlanır. Nota listesindeki **1/16, 1/8, 1/4, 1/2, 1, 2** değerleri, o notanın kaç "çeyrek vuruş birimi" süreceğini seçer. 1/4 vuruş bir birimdir; 1/2 vuruş iki birim, 1 vuruş dört birimdir.

### Yeni bloklar
- **Müzik** kategorisindeki **tempoyu [120] yap (vuruş/dk)** bloğu tempoyu ayarlar.
- **[1/4] vuruş sus** bloğu müzikte sessizlik bırakır. Bir nota kadar bekler ama ses çıkarmaz.
- **tempo** bloğu şu anki tempoyu bir sayı olarak verir. Bunu ekranda göstermek için **sayıyı göster** içine koyabilirsin.

### Adım adım
Editörde **düğme [A] [basılınca]** hazır. Bu etkinlikte yavaş ve hızlı bir "ta ta ta" çalacaksın.

1. **düğme [A] [basılınca]** içine sırayla şunları koy:
   - **tempoyu [60] yap (vuruş/dk)**
   - **[Sol] notasını [1/4] vuruş çal**
   - **[1/4] vuruş sus**
   - **tempoyu [240] yap (vuruş/dk)**
   - **[Sol] notasını [1/4] vuruş çal**
   - **[1/4] vuruş sus**
   - **[Sol] notasını [1/4] vuruş çal**
2. ▶ **Çalıştır**, sonra kartın **A** düğmesine bas.

### Beklenen sonuç
İlk Sol yavaş ve uzundur: tam bir saniye. Sonra iki Sol hızlı ve kısadır: her biri çeyrek saniye, aralarında çeyrek saniyelik sessizlik. Hoparlör bölümünde **çalan: 392 Hz** yazıp kaybolduğunu görürsün. Üç hedefin hepsinde ✓ olmalı.

### Nasıl çalışıyor?
- **tempoyu ... yap** bloğu bir kez çalışır ama ondan sonra gelen bütün notaların süresini etkiler. Yeni bir tempo bloğu gelene kadar geçerli kalır.
- **sus** bloğu da tempoya uyar. Tempo 60 iken 1/4 vuruş sus, 1 saniye susar.
- Aynı notayı peş peşe çalarken aralarına sus koymazsan notaları birbirinden ayırmak zorlaşır.

### Dene
1. Tempoyu 20 ile 400 arasında farklı değerlere ayarla. Kart bu aralığın dışındaki değerleri kendiliğinden bu sınıra çeker.
2. Bir **sayıyı göster** bloğuna **tempo** bloğunu koyup ekranda hangi tempoda olduğunu göster.
3. 1/8 vuruşluk iki nota ile 1/4 vuruşluk bir notanın aynı süreyi doldurduğunu dene.

### Sık yapılan hatalar
- **Vuruş değerleriyle milisaniyeyi karıştırmak.** **bekle [500] ms** gerçek süre verir, tempoyu hiç dinlemez. Nota ve **sus** blokları ise tempoya göre değişir.
- **Tempoyu çok düşük bırakıp "program takıldı" sanmak.** Tempo 20'de bir çeyrek vuruş 3 saniyedir.
- **Susmayı unutmak.** Ritim notalar kadar boşluklardan da oluşur.

## Konuşalım
Bir ninniyi 240 tempoda çalsan nasıl olur? Bir marşı 40 tempoda çalsan? Tempo, bir şarkıdaki duyguyu nasıl değiştiriyor?
