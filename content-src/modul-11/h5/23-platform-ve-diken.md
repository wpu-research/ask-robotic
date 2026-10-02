# Platformlar, altınlar ve dikenler
süre: 25

## Merak
Platform oyunlarının tadı, zıplayıp bir sonraki yere ulaşmaktır. Yolda altınlar toplarsın; dikenler ise seni tuzağa düşürmek ister. Bu derste haritadaki özel karoların kahramanla konuşmasını sağlayacaksın: "altına değdim", "dikene değdim".

## Etkinlik
Hazır bir harita yüklü: 20 karo genişliğinde, yerde dikenler, havada iki platform ve platformların üstünde birer altın var. Kahraman yürüyor, zıplıyor ve kamera onu izliyor. Skor 0, can 3. Henüz altın toplanmıyor, dikenler zarar vermiyor.

### Haritayı tanı
**Harita** sekmesinde haritayı inceleyebilirsin. Sütun ve satır numaraları sol üstten 0'dan başlar. Altın (nesne) ve diken (tuzak) karoları **duvar değildir**: kahraman içlerinden geçer. Ama kahramanın o karoya değdiğini oyun fark eder ve bir olay tetikler.

### Blokları kur: altın
1. ▶ bas. Kahraman altından geçiyor ama hiçbir şey olmuyor.
2. **Sahne / Harita** kategorisinden `bir [Oyuncu] sprite'ı [Altın] karosuna dokununca` olayını al. Tür olarak **Oyuncu**'yu, resim olarak **Altın**'ı seç.
3. İçine **Sahne / Harita** kategorisinden `sütun [0] satır [0] karosunu boşalt` bloğunu koy. Sütun kutusuna `olay karosunun [sütunu]`, satır kutusuna `olay karosunun [satırı]` bloklarını tak. Bu bloklar dokunduğun altının yerini bilir.
4. Altına **Oyun** kategorisinden `skoru [1] değiştir` ve **Ses** kategorisinden `[puan] melodisini çal` ekle.
5. ↺ bas. Altınlara dokun: altın kayboluyor, skor 1 artıyor.

### Blokları kur: diken
6. Yeni bir `bir [Oyuncu] sprite'ı [Dikenler] karosuna dokununca` olayı al. Resim olarak **Dikenler**'i seç.
7. İçine sırayla: `canı [-1] değiştir`; `ekranı [250] ms salla`; **Sahne / Harita** kategorisinden `[bu sprite] sprite'ını sütun [2] satır [5] karosuna koy` (`bu sprite` kahraman olur); **Hareket** kategorisinden `[bu sprite] hızı x [0] y [0]`.
8. ↺ bas. Dikene değince can azalıyor, ekran sallanıyor ve kahraman başlangıç karosuna dönüyor.

Beklenen sonuç: Altınlar toplanınca kayboluyor ve skor artıyor; dikene değince can azalıp kahraman başa dönüyor. Beş hedefin hepsi ✓.

### Nasıl çalışıyor?
- `karosuna dokununca` olayı kenar tetiklemelidir: kahraman karoya girdiği anda bir kez çalışır. Aynı karoda durduğun sürece sürekli çalışmaz.
- `olay karosunun sütunu / satırı` yalnızca bu olayın içinde anlamlıdır.
- Altını boşaltmak (silmek) önemli: aksi hâlde altın haritada kalır ve gözle görünür biçimde toplanmamış olur.
- Kahramanı başa koyarken hızını da sıfırladık: aksi hâlde başa dönse bile düşme hızıyla zemine çarpıp zıplayabilir.

### Dene
1. Platformun üstündeki altına zıplayarak ulaş. Yetmiyorsan zıplama hızını -300 yap.
2. Dikene değince can almak yerine anında oyunu kaybet: `oyunu bitir: [kaybettin]` bloğunu dene.
3. Altın başına 5 puan ver. Skor hedefini 10 yapıp 2 altın toplayınca kazanmayı ekle.

### Sık yapılan hatalar
- Altına dokununca karoyu boşaltmamak: altın kaybolmaz.
- `olay karosunun` bloklarını yerine 0 yazmak: hep sol üst köşedeki karo boşalır.
- Kahramanı başa koyarken sütun/satır yerine piksel koordinatı yazmak: o blok karo numarası ister, piksel değil.
- Diken olayında türü yanlış seçmek: **Oyuncu** yerine **Düşman** seçersen kahraman dokununca olay çalışmaz.

## Konuşalım
Neden diken ve altın karolarını duvar yapmadık? Duvar olsalardı kahraman onlara dokunmadan önce ne olurdu? Hangi karoların duvar, hangilerinin geçilebilir olması gerekir?
