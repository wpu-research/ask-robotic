# Simgeler ve kendi desenin
süre: 20

## Merak
Mesajlaşırken bir yüz çizip gülümsetmek, kelime yazmaktan çok daha hızlı. Kartın ekranı da küçük bir tuval: yüzler, oklar, kalpler çizebilir. Hazır çizimleri kullanmak kolay. Peki hiç olmayan bir şeyi, mesela bir robotu çizmek için ne yapmalı?

## Etkinlik
### Hazır simgeler
**Temel** kategorisindeki **simgeyi göster [kalp]** bloğunun içinde hazır küçük çizimler bulunur. Kutuya tıklayınca liste açılır: kalp, küçük kalp, mutlu yüz, üzgün yüz, şaşkın yüz, uyuyan yüz, evet, hayır, oklar, kare, elmas, üçgen, ev, hedef, hayalet, kuru kafa, kelebek, kedi, nota, güneş.

Simge, ekrana anında çizilir ve sen silene ya da başka bir şey gösterene kadar orada kalır.

### Kendi desenin: LED'leri göster
**Temel** kategorisindeki **LED'leri göster** bloğunun içinde 5x5 küçük kutular vardır. Bir kutuya tıklayınca o LED yanar, tekrar tıklayınca söner. Ne çizersen kart onu ekranda gösterir.

Bu derste bir **robot başı** çizeceksin. Kutuları şöyle işaretle (1 yanık, 0 sönük):

| Satır | Desen |
|---|---|
| 1. satır | 0 0 1 0 0 |
| 2. satır | 0 1 1 1 0 |
| 3. satır | 1 0 1 0 1 |
| 4. satır | 1 1 1 1 1 |
| 5. satır | 1 0 1 0 1 |

### Program: üç yüz
1. **başlangıçta** bloğunun içine **simgeyi göster** bloğunu koy ve listeden **mutlu yüz** seç.
2. Altına **bekle [1000] ms** bloğunu tak.
3. Altına ikinci bir **simgeyi göster** bloğu ekle ve **üzgün yüz** seç.
4. Yine **bekle 1000 ms** ekle.
5. En alta **LED'leri göster** bloğunu tak. Kutulara tıklayarak robot başını çiz.
6. ▶ **Çalıştır**.

### Beklenen sonuç
Önce mutlu yüz, bir saniye sonra üzgün yüz, bir saniye sonra robot başı görünür. Robot başı ekranda kalır. Dört hedef de ✓ olmalı.

### Nasıl çalışıyor?
- İkisi de ekrana anında çizer ama farklı çalışır: **simgeyi göster** hazır bir çizimi seçer, **LED'leri göster** senin çizdiğini kullanır.
- Ekrandaki 25 LED aslında 25 küçük "aç/kapat" anahtarıdır. Desen bu 25 anahtarın o anki durumudur.
- Blok bir şey çizince önceki çizimi tamamen siler. Üst üste binmez.

### Dene
1. **LED'leri göster** bloğunda kendi yüzünü çiz: gözler, ağız, burun. Bir arkadaşının çizimiyle karşılaştır.
2. İlk **LED'leri göster** bloğunun altına ikinci bir tane ekle ve desenin biraz değişmiş halini çiz (robotun gözlerini kapatmak gibi). Aralarına **bekle 500 ms** koy: bir animasyon oldu!
3. Hazır simgelerden ikisini seç, bekleme süresini değiştir. Çok kısa bekleme (100 ms) nasıl görünüyor?

### Sık yapılan hatalar
- **Bekle koymamak.** İki simgeyi art arda koyup bekleme koymazsan yalnızca sonuncusunu görürsün. Birincisi çok kısa göründüğü için fark etmezsin.
- **Kutuları ters işaretlemek.** Satırlar yukarıdan aşağıya, sütunlar soldan sağadır. Çizimine bir kenardan bak ve doğru olduğundan emin ol.
- **LED'leri göster ile yazı yazmaya çalışmak.** Bu blok yalnızca senin çizdiğin deseni gösterir; yazı için **yazıyı göster** bloğunu kullan.

## Konuşalım
Hazır simgeleri kullanmak mı, kendi desenini çizmek mi daha eğlenceli? 25 ışıkla anlatabileceğin bir duygu ya da nesne düşün: onu çizmek için kaç ışığa ihtiyaç duyarsın?
