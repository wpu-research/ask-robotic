# İlk odan: duvarlı bir harita
süre: 22

## Merak
Şimdiye kadar oyunlarımız boş bir ekranda geçti. Gerçek oyunlarda ise odalar, labirentler, koridorlar vardır. Bir sprite duvardan neden geçemez? Ve bir odayı bloklarla tek tek koymak yerine nasıl çizerek yapabiliriz?

## Etkinlik
Bu derste ilk haritanı çizeceksin. Harita, küçük kare resimlerin (karoların) ızgara hâlinde dizilmesidir. Karolar duvar da olabilir, sadece süs de.

### Harita ve karo
- **Karo:** 16 x 16 piksellik bir kare resim.
- **Harita:** Karolardan oluşan ızgara. Bu derste "oda" haritası 10 sütun ve 7 satırdır. Yani 160 x 112 piksel eder.
- **Duvar:** Duvar işaretli karoya sprite giremez. Karo takımında bunun için bir "duvar" kutusu vardır.
- Sütun ve satırlar **0'dan** sayılır. Sol üst karo sütun 0, satır 0'dır.

### Önce incele
1. Etkinliği aç ve ▶ düğmesine bas. Kedi odanın ortasında duruyor.
2. **Harita** sekmesine geç. "oda" adlı boş bir harita ve altında bir **Karo takımı** göreceksin. Takımda üç karo var: taş duvar, çimen ve su.
3. Taş duvar ve su karolarının altındaki **duvar** kutusu işaretli. Çimen işaretli değil. Yani çimenin üstünden yürünür, taş duvar ve sudan geçilmez.
4. Haritadaki kırmızı kesikli çerçeve, oyunun ilk ekranını gösterir.

### Haritayı çiz
1. Karo takımındaki **taş duvar** karosuna tıkla. Seçili karo vurgulanır.
2. Araçlardan **Boya**'yı seç.
3. Haritanın en üst satırını soldan sağa tıklayıp sürükleyerek boya. Sonra en alt satırı, sol sütunu ve sağ sütunu boya. Çevresi tamamen duvarla çevrili bir oda olmalı.
4. İstersen **Çimen** karosunu seçip **Doldur** aracıyla odanın içini yeşile boya. Çimen yalnız süslemedir.
5. Yanlış boyadıysan **Sil** aracını kullan.

### Kediyi yürüt
1. **Bloklar** sekmesine geç. Çalışma alanında `oyun başlayınca` bloğunun içinde `haritayı yükle: [oda]`, bir kedi oluşturma ve kedinin yerleştirilmesi var.
2. **Denetleyici** kategorisinden `[kedi] oyuncu tuşlarıyla [dört yöne] hareket etsin, hız [60]` bloğunu en alta ekle (`bu sprite` yerine `kedi`).
3. ▶ düğmesine bas ve kediyi dört yöne yürüt. Duvara çarpınca durmalı.

Beklenen sonuç: Kedi odanın içinde yürür ama duvarlardan geçemez. Hedeflerin dördü de yeşil.

### Nasıl çalışıyor?
- `haritayı yükle: [oda]` bloğu Harita sekmesinde çizdiğin haritayı oyuna koyar. Bu blok olmazsa harita görünmez.
- `[kedi] sprite'ını sütun [5] satır [3] karosuna koy` bloğu kediyi karonun tam ortasına yerleştirir. Haritada koordinat vermek, piksel saymaktan kolaydır.
- Duvar karoları sprite'ı durdurur. Bunun için ayrıca blok yazmana gerek yok. Karoyu duvar yapman yeter.
- Bir duvarda tek bir boşluk kalırsa kedi oradan çıkar. Çevre tam kapalı olmalı.

### Dene
1. Odanın ortasına birkaç taş duvar karosu çiz ve kedinin etrafından dolanmasını izle.
2. Haritanın bir köşesine **Su** karosunu boya. Kedi suya girebiliyor mu?
3. Çimen karosunun **duvar** kutusunu işaretle. Kedi çimene girebiliyor mu?
4. **Sütun** ve **Satır** kutularını değiştirerek haritayı büyüt. Yeni karoları boya.

### Sık yapılan hatalar
- Karoyu boyadın ama **duvar** kutusu işaretli değilse kedi içinden geçer.
- `haritayı yükle: [oda]` bloğu `oyun başlayınca` bloğunun içinde olmalı. Dışında kalırsa harita gelmez.
- Haritaya eklediğin karoyu silmek için **Sil** aracını kullan. Karo takımından karo çıkarırsan haritadaki bütün örnekleri de silinir.
- Haritanın adı bir yerde değişirse blokta da aynı ad seçilmelidir. Bu derste "oda" adını değiştirme.

## Konuşalım
Bir oyunda neden çoğu duvarı tek tek blokla değil de bir harita çizerek yaparız? Gerçek hayattaki bir odayı (kendi odan ya da sınıfın) bir ızgaraya dökseydin ne kadar büyük olurdu?
