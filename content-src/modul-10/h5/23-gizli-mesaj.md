# Gizli mesaj
süre: 22

## Merak
Eski Roma'da Jül Sezar'ın gizli mektuplarında harfleri kaydırdığı anlatılır: her harfin yerine alfabede birkaç sıra sonraki harf yazılır. Mesajı yakalayan kişi anlamsız harfler görür; ama kaydırma sayısını bilen arkadaşı mesajı kolayca çözer. Bu derste aynı fikri sayılarla yapacaksın: göndermeden önce sayıya bir **anahtar** eklenecek, alan kart bu anahtarı çıkaracak.

## Etkinlik
### Şifreleme ve anahtar
- **Düz mesaj**: göndermek istediğin gerçek bilgi (örneğin rakam 3).
- **Anahtar**: iki tarafın da bildiği gizli sayı (örneğin 7).
- **Şifreli mesaj**: düz mesaj + anahtar = 3 + 7 = 10. Radyoyla bu 10 gider.
- **Çözme**: alan taraf 10 − 7 = 3 hesaplar ve gerçek rakamı bulur.

Bu çok basit bir şifredir ve gerçek hayatta kolayca kırılır. Ama şifrelemenin temel fikrini öğrenmek için çok iyidir: **bilgi yolda değişir, doğru anahtarı bilen eski haline getirir.**

### Yeni bloklar
- **Matematik** kategorisinde toplama ve çıkarma yapan aritmetik blok: iki sayı kutusu ve ortada bir işaret var. İşareti listeden **+** ya da **−** seç.
- **Değişken** kategorisinde **[gizli] değerine [1] ekle** bloğu.

### Adım adım
Editörde **başlangıçta**, iki düğme ve **radyo mesajı alınınca** hazır.

1. **Değişken** kategorisinde iki değişken oluştur: **gizli** ve **anahtar**.
2. **başlangıçta** içine sırayla: **radyo grubunu [1] yap**, **gizli değerini [0] yap**, **anahtar değerini [7] yap**.
3. **düğme [A] [basılınca]** içine **gizli değerine [1] ekle** ve **sayıyı göster [gizli]** koy. (Gösterilecek sayı olarak **gizli** değişkenini tak.)
4. **düğme [B] [basılınca]** içine **radyoyla sayı gönder** koy. Sayı yerine toplama bloğunu tak: **gizli** **+** **anahtar**.
5. **radyo mesajı alınınca** içine **sayıyı göster** koy. Sayı yerine çıkarma bloğunu tak: **alınan [sayı]** **−** **anahtar**.
6. ▶ **Çalıştır**. Kart 1'de **A**'ya üç kez bas (ekranda 1, 2, 3 görünür). Sonra **B**'ye bas.

### Beklenen sonuç
Kart 1 radyoyla 10 gönderir. Radyo bölümünde Kart 2'nin **Son alınan:** kutusu **10** gösterir. Ama Kart 2'nin ekranında **3** görünür: anahtar çıkarılmış, gerçek rakam bulunmuş. Dört hedefin hepsinde ✓ olmalı.

### Nasıl çalışıyor?
- Yolda giden sayı 10'dur. Mesajı duyan biri 3'ü bilemez; anahtarı (7) bilmesi gerekir.
- İki kart aynı programı çalıştırdığı için ikisinin de anahtarı 7'dir. Yani aynı anahtarı paylaşıyorlar.
- Anahtar bir değişkende saklandığı için yalnız tek yerde değiştirirsin; hem şifreleme hem çözme kendiliğinden uyar.

### Dene
1. Radyo bölümünden Kart 2'ye elle **sayı** mesajı olarak **10** yolla. Kart 2'de 3 görürsün.
2. Şimdi elle **5** yolla. Kart 2'nin ekranında ne görünüyor? (5 − 7 = −2.) Bu, anahtarı bilmeyenin yanlış sonuç alması gibidir.
3. Anahtarı **başlangıçta** içinde 7 yerine 12 yap. Çözülen rakam değişti mi? Neden değişmedi?
4. Düşün: Anahtar her seferinde rastgele olsaydı alan kart onu nasıl bilirdi? Anahtarı da radyoyla göndermek güvenli olur muydu?

### Sık yapılan hatalar
- **Anahtarı unutmak.** Alan kartta anahtar değişkenini **başlangıçta** ayarlamadıysan değişken sıfır kalır; çözme işe yaramaz.
- **Toplama yerine çıkarma koymak** (ya da tersini). Gönderen toplarsa alan çıkarmalı.
- **Gösterilecek sayıyı yanlış yere koymak.** **sayıyı göster** içinde çıkarma bloğu olmalı, **alınan [sayı]** doğrudan kalmamalı.

## Konuşalım
Bu şifreyi birisi yolda yakalasa 7'yi tahmin edebilir mi? Kaç denemede bulur? Daha zor bir şifre yapmak için ne eklerdin?
