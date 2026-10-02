# Logo, uzun basış ve gizli düğmeler
süre: 20

## Merak
Bazı oyuncaklarda gizli bir düğme vardır; yalnızca doğru yere dokunduğunda ya da bir süre bastığında açılır. Kartın üstündeki yıldız şeklindeki logo da dokunmaya duyarlı bir düğmedir. Bu derste kartına gizli kapılar ekleyeceksin.

## Etkinlik
### Logo: dokunmatik yıldız
Kartın üstündeki yıldız şekilli logo bir **dokunmatik düğmedir**. Sanal kartta fareyle üzerine basıp basılı tutarsan "dokunulmuş" olur, bırakırsan "bırakılmış" olur.

**Giriş** kategorisinde şu blok var:

- **logoya [dokununca]:** logo dokunulduğu an çalışır. Listeden **bırakılınca** seçersen parmağını çektiğin an çalışır.

### Uzun basış
Daha önce **düğme [A] [basılınca]** bloğunun ikinci listesine bakmıştın. Bu listede üç seçenek vardı: **basılınca**, **bırakılınca**, **uzun basılınca**. **uzun basılınca** seçeneği, düğmeyi **1 saniye boyunca basılı** tuttuğunda çalışır.

### Program: gizli düğmeler
Editörde üç olay bloğu hazır: biri **logoya dokununca**, biri **logoya bırakılınca**, biri **düğme A uzun basılınca**.

1. **logoya dokununca** bloğunun içine **Temel** kategorisinden **simgeyi göster** koy ve **kalp** seç.
2. **logoya bırakılınca** bloğunun içine **Temel** kategorisinden **ekranı temizle** bloğunu koy.
3. **düğme A uzun basılınca** bloğunun içine **simgeyi göster** koy ve **uyuyan yüz** seç.
4. ▶ **Çalıştır**.
5. Sanal kartta logonun üzerine fareyle bas, basılı tut: kalp görünecek. Bırak: ekran sönecek.
6. A düğmesini 1 saniye ya da daha uzun süre basılı tut.

### Beklenen sonuç
Logoya dokununca kalp görünür, çekince ekran söner. A'ya bir saniyeden uzun basınca uyuyan yüz çıkar. Dört hedef de ✓ olmalı.

### Nasıl çalışıyor?
- Logo da bir olay kaynağıdır, tıpkı A ve B düğmeleri gibi: dokunulunca ve bırakılınca iki ayrı olay doğurur.
- A düğmesine kısa basarsan bu programda hiçbir şey olmaz. Çünkü sadece **uzun basılınca** bloğu yazdık.
- Uzun basış, düğmeye bastığın andan **1 saniye** sonra tetiklenir. Bir saniye dolmadan bırakırsan uzun basış olmaz.
- Aynı düğme için **basılınca** ve **uzun basılınca** blokları bir arada olabilir. Uzun basarsan ikisi de çalışır: önce kısa, bir saniye sonra uzun.

### Dene
1. Logoya dokununca **mutlu yüz**, bırakınca **üzgün yüz** göster. Logo bir ruh hali düğmesi gibi.
2. A'nın **basılınca** bloğunu da ekle: bir yüz göstersin. Uzun basınca iki farklı şey görüyor musun?
3. B için de bir **uzun basılınca** bloğu yap: ekranı temizlesin. Kartı sıfırlayan gizli bir düğme olsun.

### Sık yapılan hatalar
- **Logo bloğundaki listeyi değiştirmemek.** İkisinde de **dokununca** seçili kalırsa **ekranı temizle** bloğu çalışmaz.
- **Uzun basış için çok kısa basmak.** Tam 1 saniye basılı tutman gerekir. Sanal düğmeyi basılı tut, çabuk bırakma.
- **Logoyu tıklayıp hemen bırakmak.** Kalp bir anlığına görünür ve söner. Basılı tutarsan kalp ekranda durur.

## Konuşalım
Telefonlarda ya da oyuncaklarda uzun basmak hangi işlere yarar? Kısa basış ile uzun basışa neden farklı görevler vermek isteriz?
