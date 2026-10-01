# Toprak nemi, yağmur ve su seviyesi (analog)
süre: 25

## Merak
Evdeki sardunya haftada bir sulanıyor, ama bazı haftalar toprak hâlâ ıslakken sulanıyor, bazı haftalar da kuruyup sararıyor. Toprağa parmağını sokup bakmak yerine bir sensör nemi sayıya çevirebilir. Aynı yöntem yağmuru ve bir deponun doluluğunu da ölçer. Üçü de analog sensördür: 11. derste potansiyometreyle yaptığın gibi `analogRead` ile okursun. Asıl iş, ham sayıyı anlamlı bir yüzdeye çevirmek.

## Etkinlik
### Devre
Parçaları laboratuvarda **Parça ekle** menüsünden seç, pinleri kablo çekerek bağla.

| Parça | Bağlantı |
|---|---|
| Toprak nemi modülü | VCC → 5V, GND → GND, AO → **A2** |
| İkinci Toprak nemi modülü (yağmur yerine) | VCC → 5V, GND → GND, AO → **A0** |
| Ses modülü (su seviyesi yerine) | VCC → 5V, GND → GND, AO → **A1** |

**Laboratuvarda yağmur ve su seviyesi sensörü yok.** Çıkış yönleri aynı olduğu için yerlerine şunları kullanıyoruz:
- **Yağmur:** ikinci bir Toprak nemi modülü. Sağ paneldeki **Toprak nemi** kaydırıcısı "yüzey ne kadar ıslak" gibi düşünülür; ıslandıkça AO düşer (kuruda yüksek, ıslakta düşük), yağmur sensörü örneğimizle aynı yönde.
- **Su seviyesi:** Ses modülü. **Ses şiddeti** kaydırıcısı "su seviyesi" gibi düşünülür; arttıkça AO yükselir, su seviyesi örneğimizle aynı yönde.

Kaydırıcılar 0 ile 1 arasındadır; ham sayıları aşağıda ölçülmüş olarak vereceğiz. Modüllerin DO çıkışlarını bu derste kullanmıyoruz.

### İki tür toprak nemi sensörü
- **Dirençli (resistive) sensör:** Toprağa gömülen iki açık metal uç vardır. Toprak nemliyse uçlar arasındaki direnç değişir ve bunu okursun. Ucundan sürekli akım geçtiği için metal zamanla **aşınır, paslanır**; bu tür sensörler ömürlü değildir. Akımı azaltmak için sensörü sürekli beslemek yerine yalnız ölçüm anında beslemek yaygın bir yöntemdir; modülün besleme akımı için veri sayfasına bak.
- **Kapasitif sensör:** Uçlar bir yalıtkanla kaplıdır, toprakla doğrudan akım geçirmez. Toprağın neminin sığa (kapasite) üzerindeki etkisini ölçer. Genelde daha uzun ömürlüdür.

**Çıkış yönü modüle göre değişir.** Çoğu hazır modül kuruda yüksek, ıslakta düşük değer verir; ama bazılarında tersi olabilir ve üreticiden üreticiye sayılar farklıdır. Bu yüzden "ıslak = büyük sayı" diye bir kural yoktur. Yönü ve sayıları her sensör için kuru ve ıslak durumda ölçerek öğrenmelisin. Laboratuvardaki Toprak nemi modülünde kaydırıcı 0 (kuru) iken ham değer yaklaşık 921, 1 (ıslak) iken yaklaşık 307 çıkar; yani kuruda yüksek, ıslakta düşük. Bu derste de bu yönü varsayıyoruz; kodu ters yönlü bir sensöre de uyarlayacağız.

### Program 1: kuru/ıslak ucu ile yüzde
Kalibrasyon (14. ders) fikri: iki uç değeri ölç, `map` ile yüzdeye çevir, `constrain` ile 0-100 arasında tut. `map` ters sıralı uçlarla da çalışır: `KURU` ıslaktan büyükse de küçükse de aynı kod doğru yüzdeyi verir.

```cpp
// sketch: toprak_yuzde
const int KURU = 800;                 // sensör havada/kuru toprakta okunan ham değer
const int ISLAK = 350;                // sensör suda okunan ham değer

int ortalamaOku(int pin) {
  long toplam = 0;
  for (int i = 0; i < 8; i++) {
    toplam += analogRead(pin);
  }
  return toplam / 8;
}

void setup() {
  Serial.begin(9600);
}

void loop() {
  int ham = ortalamaOku(A2);
  int yuzde = map(ham, KURU, ISLAK, 0, 100);
  yuzde = constrain(yuzde, 0, 100);

  Serial.print("Toprak ham=");
  Serial.print(ham);
  Serial.print(" nem=%");
  Serial.println(yuzde);
  delay(500);
}
```

Laboratuvarda **Toprak nemi** kaydırıcısını gezdirerek şunu ölçtük:

| Kaydırıcı | Ham değer | Seri monitörde |
|---|---|---|
| 0 (en kuru) | 921 | %0 (kuru uçtan da kuru: sınırlanır) |
| 0,2 | 798 | %0 (KURU = 800'e yakın) |
| 0,4 | 675 | %27 |
| 0,6 | 552 | %55 |
| 0,8 | 430 | %82 |
| 1 (en ıslak) | 307 | %100 (ıslak uçtan da ıslak: sınırlanır) |

`KURU = 800` ve `ISLAK = 350` seçtik; modülün ulaştığı uçlar (921 ve 307) bunların dışında kaldığı için `constrain` uçlarda %0 ve %100'de tutuyor. `constrain` olmasaydı kaydırıcı 0 iken yaklaşık %-26 görürdün.

Sensör ters yönlüyse (kuruda düşük, ıslakta yüksek) yalnız iki sabiti değiştirirsin; örneğin `KURU = 300`, `ISLAK = 700`. Aynı kod, `map` ters sıralı uçlarla da çalıştığı için bu sensörde de doğru yüzdeyi verir. Laboratuvardaki modül hep aynı yönde çalışır; bu yüzden ters yönlü durumu burada denemek için `KURU` ve `ISLAK` değerlerini yer değiştirmen yeter (aşağıdaki "Dene").

### Program 2: kalibrasyonu seri porttan yap
Sabitleri kodun içine gömmek yerine sensörü kuru ve ıslak koşulda ölçüp kaydetmek daha güvenilirdir. Bu programda seri monitörden `k` gönderirsen o anki ham değer **kuru** uç olarak kaydedilir, `i` gönderirsen **ıslak** uç olarak. İki uç birbirine çok yakınsa yüzde hesaplanmaz, çünkü `map` bölme yapar ve fark sıfıra yaklaştığında sonuç anlamsızlaşır.

```cpp
// sketch: toprak_kalibre
int kuru = 800;
int islak = 350;

unsigned long sonYazi = 0;

int ortalamaOku(int pin) {
  long toplam = 0;
  for (int i = 0; i < 8; i++) {
    toplam += analogRead(pin);
  }
  return toplam / 8;
}

void setup() {
  Serial.begin(9600);
  Serial.println("k: kuru uc, i: islak uc");
}

void loop() {
  while (Serial.available() > 0) {
    char komut = Serial.read();
    if (komut == 'k') {
      kuru = ortalamaOku(A2);
      Serial.print("Kuru kaydedildi: ");
      Serial.println(kuru);
    } else if (komut == 'i') {
      islak = ortalamaOku(A2);
      Serial.print("Islak kaydedildi: ");
      Serial.println(islak);
    }
  }

  unsigned long simdi = millis();
  if (simdi - sonYazi >= 500) {
    sonYazi = simdi;
    int ham = ortalamaOku(A2);
    if (abs(kuru - islak) < 50) {
      Serial.println("Kalibrasyon gecersiz: uclar cok yakin");
    } else {
      int yuzde = constrain(map(ham, kuru, islak, 0, 100), 0, 100);
      Serial.print("nem=%");
      Serial.println(yuzde);
    }
  }
}
```

Laboratuvarda kaydırıcı 0 iken `k` (Kuru kaydedildi: 921), kaydırıcı 1 iken `i` gönderdik (Islak kaydedildi: 307); sonra kaydırıcıyı 0,5 yapınca `nem=%50` yazdı. Kaydırıcı 0,5 iken hem `k` hem `i` gönderince (iki uç da 614) "Kalibrasyon gecersiz: uclar cok yakin" yazdı.

### Program 3: yağmur ve su seviyesi
Yağmur modülünde ıslak yüzey okumayı değiştirir; su seviyesi sensöründe ise su çıplak izleri kapattıkça değer büyür. Yönler modüle göre değişir. Bu örnekte yağmur sensörü **kuruda yüksek, ıslakta düşük**, su seviyesi sensörü **su arttıkça yüksek** değer verir. Eşikleri gerçek bir sensörde ölçerek belirlemelisin; laboratuvarda ikinci Toprak nemi modülü (A0) yağmuru, Ses modülü (A1) su seviyesini temsil eder.

```cpp
// sketch: yagmur_su
const int YAGMUR_ESIK = 600;          // altı: yagmur var
const int SEVIYE_ORTA = 300;          // bunun altı: bos
const int SEVIYE_DOLU = 600;          // bunun ustu: dolu

void setup() {
  Serial.begin(9600);
}

void loop() {
  int yagmur = analogRead(A0);
  int seviye = analogRead(A1);

  Serial.print("Yagmur: ");
  Serial.print(yagmur < YAGMUR_ESIK ? "VAR" : "YOK");
  Serial.print("  Su: ");
  if (seviye < SEVIYE_ORTA) {
    Serial.print("BOS");
  } else if (seviye < SEVIYE_DOLU) {
    Serial.print("ORTA");
  } else {
    Serial.print("DOLU");
  }
  Serial.print("  (A0=");
  Serial.print(yagmur);
  Serial.print(" A1=");
  Serial.print(seviye);
  Serial.println(")");
  delay(500);
}
```

Laboratuvarda yağmur modülünün **Toprak nemi** kaydırıcısını 0 yaptık (A0 yaklaşık 921), sonra 0,8 yaptık (A0 yaklaşık 430); çıktı `YOK`, sonra `VAR` oldu. Seviye modülünün **Ses şiddeti** kaydırıcısını 0 (A1 yaklaşık 255), 0,2 (yaklaşık 399) ve 0,6 (yaklaşık 686) yaptık; çıktı sırasıyla `BOS`, `ORTA` ve `DOLU` oldu.

### Nasıl çalışıyor?
1. Üç sensör de gerilim üretir ve `analogRead` bunu 0-1023 arası sayıya çevirir (11. ders).
2. Toprak sensöründe `map` ham sayıyı yüzdeye taşır; `constrain` uç taşmalarını keser. 8 ölçümün ortalaması gürültüyü azaltır (14. ders).
3. Yağmur ve su seviyesi basit eşiklerle karşılaştırılır. Sınır değerlerine yakın okumalarda durum hızla gidip gelebilir; bunun çaresi 35. dersteki termostatta kullandığın histerezistir.
4. Yön ve sayılar sensörden sensöre değiştiği için bu sayılar başka bir sensör için doğru olmayabilir. Kalibrasyonu hep kullandığın sensörle yap.

### Dene
- `toprak_yuzde` programında `KURU` ve `ISLAK` değerlerini yer değiştir. Yüzde ne oluyor? Bir sensörün hangi yönde olduğunu kaydırıcıyı 0'dan 1'e çekip ham sayının nasıl değiştiğine bakarak nasıl anlarsın?
- `toprak_kalibre` programını çalıştırırken kaydırıcı 0 iken `k`, kaydırıcı 1 iken `i` gönder. Sonra kaydırıcıyı 0,3 yap: yüzde kaç çıkıyor?
- Sensörün yönü tersse (kuruda düşük) `yagmur_su` programındaki yağmur karşılaştırmasını nasıl değiştirirsin?

### Sık yapılan hatalar
- Sensörün yönünü bilmeden "büyük sayı = ıslak" varsaymak.
- `constrain` unutmak: kalibrasyon aralığının dışındaki okumalar %-20 ya da %130 gibi saçma değerler verir.
- Dirençli sensörü sürekli toprakta ve sürekli açık bırakmak: uçlar paslanır, okuma zamanla kayar (laboratuvar bunu modellemez; gerçek dünya bilgisi).
- Sensör çıktısını tek bir ölçüme bakarak yorumlamak: gürültü yüzünden ortalama al.

## Konuşalım
Dirençli bir toprak nemi sensörünü bir yıl toprakta bıraktın ve okumalar yavaş yavaş kaydı. Bunun nedeni ne olabilir? Kalibrasyonu ne sıklıkla yenilersin, bunu otomatik yapmanın bir yolu olabilir mi?
