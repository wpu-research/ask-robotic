# Üç meyveyi topla, oyunu kazan
süre: 22

## Merak
Oyunlarda puan toplarız. Ama bilgisayar puanı nerede saklar? Ve "Üç meyve topladın, kazandın!" diyebilmesi için hangi soruyu sorması gerekir? Bu derste sayıları sayan bir oyun yapacaksın.

## Etkinlik
Sahnede kedi ve üç meyve (elma, portakal, kiraz) var. Hepsinin türü **Yiyecek**. Skor sıfırdan başlıyor ama hiçbir şey onu artırmıyor.

### Skor
Oyunda **skor** adlı hazır bir sayı vardır. Üst köşede gösterilir. Üç blok işini görür:
- `skoru [0] yap`: skoru belirlediğin sayıya ayarlar.
- `skoru [1] değiştir`: skora ekler. Eksi sayı verirsen çıkarır.
- `skor`: skoru sayı olarak verir; bunu bir koşulda kullanabilirsin.

### Blokları kur
1. **Sprite** kategorisinden `bir [Oyuncu] sprite'ı bir [Yiyecek] sprite'ına çarpınca` olayını koy.
2. İçine **Oyun** kategorisinden `skoru [1] değiştir` bloğunu tak.
3. Altına `[diğer sprite] sprite'ını sil` ekle (`bu sprite` yerine `diğer sprite`).
4. **Ses** kategorisinden `[puan] melodisini çal` bloğunu ekle.
5. ▶ düğmesine bas ve üç meyveyi topla. Skor 3 oluyor.
6. Şimdi kazanmayı ekleyelim. **Mantık** kategorisinden `eğer [koşul] ise` bloğunu al ve olayın en altına tak.
7. Koşul yuvasına **Mantık** kategorisinden **=** karşılaştırma bloğunu bırak. Sol yuvaya **Oyun** kategorisinden `skor` bloğunu, sağ yuvaya **Matematik** kategorisinden 3 sayısını koy.
8. `eğer` bloğunun içine sırayla şunları tak: `ekranda [Hepsini topladın!] yaz, [2] saniye`, `[zafer] melodisini çal`, `oyunu bitir: [kazandın]`.
9. ↺ düğmesine bas ve oyunu bitir. Ekranda KAZANDIN! yazısı çıkar.

Beklenen sonuç: Her meyve skoru 1 artırır ve melodi çalar. Üçüncü meyveden sonra mesaj çıkar, zafer melodisi çalar ve oyun kazanılır.

### Nasıl çalışıyor?
- Olay her çarpışmada baştan çalışır. Birinci meyvede skor 1 olur, `eğer` sorusu "skor 3 mü?" diye sorar ve cevap hayırdır. Üçüncüde cevap evettir ve içindeki bloklar çalışır.
- `eğer [koşul] ise` bloğu bir **soru** sorar. Cevap evetse içindeki bloklar çalışır, hayırsa atlanır.
- **=** bloğu iki sayıyı karşılaştırır. Açılır listeden başka işaretler de seçebilirsin: büyüktür, küçüktür gibi.
- Oyun bitince Oyun Atölyesi bir bitiş ekranı gösterir. A düğmesi oyunu yeniden başlatır.

### Dene
1. Karşılaştırmayı **=** yerine **≥** yap. Üçüncü meyveden sonra da çalışıyor mu? Peki neden bazen **≥** daha güvenlidir?
2. Her meyve 10 puan versin, kazanmak için skor 30 olsun. Hangi iki sayıyı değiştirmelisin?
3. `[kedi] [Tamam!] desin, [1] saniye` bloğunu meyveyi yutunca kedi söylesin diye ekle.

### Sık yapılan hatalar
- `skoru [1] yap` ile `skoru [1] değiştir` aynı şey değildir. İlki skoru 1'e sabitler, ikincisi 1 ekler. Skor hiç artmıyorsa bunu kontrol et.
- Koşulun sağ tarafına 3 yerine metin yazarsan karşılaştırma çalışmaz. Matematik kategorisindeki sayı bloğunu kullan.
- Skoru sıfırlamayı unutma: `oyun başlayınca` içinde `skoru [0] yap` bulunsun.

## Konuşalım
Oyunlarda puan neden önemlidir? Skorun artışı oyuncuya nasıl bir his verir? "Hepsini topla" yerine "30 saniyede mümkün olduğu kadar topla" desen oyun nasıl değişirdi?
