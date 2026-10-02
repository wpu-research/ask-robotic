# Sıcaklık: ihtiyatlı mı, maceracı mı?
süre: 25

## Merak
Aynı soruyu bir yapay zekâ asistanına iki kez sorarsın ve iki farklı cevap alırsın. Neden? Çünkü model her adımda kelimeleri olasılıklarla sıralar ve birini seçer. Bu seçimin ne kadar "cesur" olacağını bir ayar belirler: sıcaklık.

## Etkinlik
Bu etkinlik tamamen **Yapay Zekâ Atölyesi**'nde, tarayıcında çalışır. Dış servis, hesap ya da anahtar gerekmez. Sağdaki **Hedefler** listesi yeşile döndükçe ilerlediğini görürsün.

### Sıcaklık ne yapar?
Model her aday için bir puan hesaplar. Bu puanlar **softmax** denen bir işlemle olasılığa çevrilir. Sıcaklık, softmax'tan önce puanlar bölünerek uygulanır:
- **Düşük sıcaklık (0'a yakın):** En olası aday daha da baskın olur. Çıktı tutarlı ve tekrarlanabilir olur, ama sıkıcı olabilir.
- **Yüksek sıcaklık:** Olasılıklar düzleşir. Nadir adayların şansı artar; çıktı çeşitlenir ama dağılabilir.

Elle bir örnek: iki aday var, sayımları 3 ve 1. Sıcaklık 1 iken olasılıklar 0,75 ve 0,25'tir. Sıcaklık düşünce 0,75 büyür; yükselince 0,5'e yaklaşır.

### Aracı aç
1. **Sonraki kelime ve sıcaklık** aracında bağlam "robot" olsun.
2. Sıcaklığı 0,3'ün altına indir ve çubuklara bak: ilk aday baskın.
3. Sıcaklığı 1,8'in üstüne çıkar: çubuklar eşitlenmeye yaklaşır. Belirsizlik (entropi) artar.
4. En az dört kelime ürettir.

### Nasıl çalışıyor?
- Çubuklar gerçekten softmax(log(sayım) / sıcaklık) ile hesaplanır.
- Sıcaklık 0'da en olası kelime her zaman seçilir. Gerçek servislerde bu ayar "yaratıcılık" gibi adlandırılabilir; aslında olasılık dağılımının keskinliğidir.
- Düşük sıcaklık "doğruluk" garantisi değildir: model yanlışı da tutarlı biçimde söyleyebilir.

### Dene
1. Aynı bağlamı sıcaklık 0'da üç farklı tohumla üret. Sonuçlar aynı mı?
2. Sıcaklığı 3'e çıkar ve üretimi izle.

### Kendini sına
1. Bir veri çıkarma işi için hangi sıcaklığı seçerdin, şiir için hangisini?
2. Sıcaklık yüksekse en olası kelime hiç seçilmez mi?

## Konuşalım
Bir robotun komut yorumlayıcısında sıcaklığın yüksek olması neden tehlikeli olabilir? Hangi işlerde çeşitlilik istersin, hangilerinde istemezsin?
