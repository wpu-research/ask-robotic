# Yerçekimi: kahraman yere insin
süre: 20

## Merak
Bir elmayı bıraktığında elma önce yavaş, sonra gittikçe hızlanarak düşer. Ona "git" diyen yoktur; yalnızca her an biraz daha hızlanır. Platform oyunları işte bu yüzden hissedilir: kahramana yerçekimi verirsin ve o kendiliğinden düşer. Bu derste Oyun Atölyesi'nin yerçekimini kuracaksın.

## Etkinlik
Sahnede açık mavi bir gökyüzü ve altta iki sıra zemin karosu (çimenli toprak ve toprak) var. Kahraman havada, ekranın üst yarısında asılı duruyor ve "ekranda kalsın" ayarıyla başlıyor. Başlangıç projesi hazır gelir; harita ve kahraman oluşturuluyor, ama hareket yok.

### Hız ve ivme
- **Hız**, sprite'ın saniyede kaç piksel gittiğidir.
- **İvme**, hızın saniyede ne kadar arttığıdır. Aşağı yönlü bir ivme yerçekimi gibi davranır: kahraman her saniye biraz daha hızlı düşer.

### Blokları kur
1. Etkinliği aç ve ▶ düğmesine bas. Kahraman havada asılı duruyor.
2. **Hareket** kategorisinden `[bu sprite] ivmesi x [0] y [300]` bloğunu al ve `oyun başlayınca` bloğunun en altına tak. `bu sprite` yerine `kahraman` değişkenini koy. y kutusuna 520 yaz.
3. ↺ bas. Kahraman düşüyor ve zeminin üstünde duruyor.
4. **Denetleyici** kategorisinden `[kahraman] oyuncu tuşlarıyla [sağa-sola] hareket etsin, hız [70]` bloğunu alıp ivme bloğunun altına tak. Listede **sağa-sola** seçili olsun.
5. ↺ bas. Sağ ve sol tuşlarla yürü. Kahraman zeminde kalıyor ve haritanın kenarına gelince duruyor.

Beklenen sonuç: Kahraman havadan inip zeminde duruyor ve sağa-sola yürüyebiliyor. Üç hedef de ✓.

### Nasıl çalışıyor?
- İvme, her karede hıza eklenir. Kahraman 0 hızla başlar; yarım saniye sonra hızı yaklaşık 260 pikselle düşmektedir.
- Kahraman zemine inince durur: zemin karoları "duvar"dır ve duvarlar sprite'ı durdurur. Duvara değen kahramanın y hızı sıfırlanır.
- Kahraman zemindeyken yerçekimi hâlâ çalışır; yalnız duvar onu tutar. Bu, bir sonraki derste "zeminde miyim?" sorusunu sormamıza yarayacak.
- 520 değeri dikkatle seçilmiş bir sayıdır: Çok küçük olursa kahraman aya çıkmış gibi yavaş düşer, çok büyük olursa taş gibi düşer.

### Dene
1. İvmeyi 200 yap (hafif, ay gibi) ve 1000 yap (ağır). Hangisi platform oyunu için daha iyi?
2. İvmeye eksi bir sayı ver (-300). Kahramana ne oluyor? Bunu hangi oyunda kullanırdın?
3. Kahramanı başlangıçta ekranın en üstüne koy (`konumu x 80 y 10`) ve düşmesini izle. Kaç saniyede iniyor?

### Sık yapılan hatalar
- Hareket biçimini **dört yöne** seçmek: oyun her karede y hızını yukarı-aşağı tuşlarına göre sıfırlar ve yerçekimi etkisiz kalır. Platform oyunlarında **sağa-sola** seç.
- İvme yerine `hızı x 0 y 100` yazmak: kahraman düşer ama hep aynı hızla; yani "hızlanarak düşme" hissi yoktur.
- İvme bloğunu `oyun başlayınca` dışında bırakmak: blok çalışmaz, kahraman asılı kalır.
- Kahramanı başlangıçta zeminin içine yerleştirmek: kahraman duvarın içinde sıkışır. Gökyüzünde bir yere koy.

## Konuşalım
Oyunda yerçekimi sabit 520, ama gerçek hayatta Ay'da yerçekimi Dünya'dakinden çok daha azdır. Ay'da geçen bir oyun yapsan ivmeyi nasıl seçerdin ve kahramanın zıplaması nasıl farklı olurdu?
