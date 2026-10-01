# Toprak nemi, yağmur ve su seviyesi (analog)
süre: 25

## Merak
Evdeki sardunya haftada bir sulanıyor, ama bazı haftalar toprak hâlâ ıslakken sulanıyor, bazı haftalar da kuruyup sararıyor. Toprağa parmağını sokup bakmak yerine bir sensör nemi sayıya çevirebilir. Aynı yöntem yağmuru ve bir deponun doluluğunu da ölçer. Üçü de analog sensördür: 11. derste potansiyometreyle yaptığın gibi `analogRead` ile okursun. Asıl iş, ham sayıyı anlamlı bir yüzdeye çevirmek.

## Etkinlik
### Devre
| Parça | Bağlantı |
|---|---|
| Toprak nemi sensörü | VCC → 5 V, GND → GND, analog çıkış (AO) → **A2** |
| Yağmur sensörü modülü | VCC → 5 V, GND → GND, analog çıkış (AO) → **A0** |
| Su seviyesi sensörü | + → 5 V, − → GND, S (sinyal) → **A1** |

Sensörleri ve modül kartlarını gerilim aralıkları için kontrol et. Elektronik kısımları sudan uzak tut: yalnızca sensörün tasarlanmış ucunu toprağa ya da suya sok, kartı ıslatma.

### İki tür toprak nemi sensörü
- **Dirençli (resistive) sensör:** Toprağa gömülen iki açık metal uç vardır. Toprak nemliyse uçlar arasındaki direnç değişir ve bunu okursun. Ucundan sürekli akım geçtiği için metal zamanla **aşınır, paslanır**; bu tür sensörler ömürlü değildir. Akımı azaltmak için sensörü sürekli beslemek yerine yalnız ölçüm anında beslemek yaygın bir yöntemdir; modülün besleme akımı için veri sayfasına bak.
- **Kapasitif sensör:** Uçlar bir yalıtkanla kaplıdır, toprakla doğrudan akım geçirmez. Toprağın neminin sığa (kapasite) üzerindeki etkisini ölçer. Genelde daha uzun ömürlüdür.

**Çıkış yönü modüle göre değişir.** Dirençli ve kapasitif sensörlerin çıkışı çoğunlukla ters yöndedir: biri nemde artarken diğeri azalabilir. Üstelik aynı türde farklı üreticilerin modülleri de farklı davranabilir. Bu yüzden "ıslak = büyük sayı" diye bir kural yoktur. Kendi sensörünü kuru havada ve suda ölçerek yönü ve sayıları öğrenmelisin. Bu derste örnek olarak kuru toprakta yüksek, ıslakta düşük değer veren (kapasitif tipte sık görülen) bir sensör varsayacağız; kodu ters yönlü bir sensöre de uyarlayacağız.

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

Benzetimde `sim.analog` ile uç değerleri verdik:

| Ham değer | Beklenen | Ölçülen |
|---|---|---|
| 800 (kuru uç) | %0 | %0 |
| 575 (orta) | %50 | %50 |
| 350 (ıslak uç) | %100 | %100 |
| 900 (kuru uçtan da kuru) | %0 (sınırlanır) | %0 |
| 200 (ıslak uçtan da ıslak) | %100 (sınırlanır) | %100 |

Sensör ters yönlüyse (kuruda düşük, ıslakta yüksek) yalnız iki sabiti değiştir: `KURU = 300`, `ISLAK = 700`. Aynı kodla %0, %50 ve %100 sonucunu ters yönlü sensörle de doğruladık.

### Program 2: kalibrasyonu seri porttan yap
Sabitleri kodun içine gömmek yerine sensörü gerçek koşulda ölçmek daha güvenilirdir. Bu programda Serial Monitor'dan `k` gönderirsen o anki ham değer **kuru** uç olarak kaydedilir, `i` gönderirsen **ıslak** uç olarak. İki uç birbirine çok yakınsa yüzde hesaplanmaz, çünkü `map` bölme yapar ve fark sıfıra yaklaştığında sonuç anlamsızlaşır.

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

Benzetimde sensörü önce 900 ham değerinde `k`, sonra 300 ham değerinde `i` ile kaydettik; 600 ham değeri %50 verdi. Aynı değerde hem `k` hem `i` gönderince "Kalibrasyon gecersiz" yazdı.

### Program 3: yağmur ve su seviyesi
Yağmur modülünde ıslak yüzey okumayı değiştirir; su seviyesi sensöründe ise su çıplak izleri kapattıkça değer büyür. Yönler modüle göre değişir. Bu örnekte yağmur sensörü **kuruda yüksek, ıslakta düşük**, su seviyesi sensörü **su arttıkça yüksek** değer verir. Eşikleri kendi sensörünle ölçerek belirle.

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

Benzetimde yağmur için 4,8 V (kuru) ve 1,5 V (ıslak), su seviyesi için 0 V, 2 V ve 3,5 V uyguladık. Çıktı sırasıyla `YOK` / `VAR` ve `BOS` / `ORTA` / `DOLU` oldu.

### Nasıl çalışıyor?
1. Üç sensör de gerilim üretir ve `analogRead` bunu 0-1023 arası sayıya çevirir (11. ders).
2. Toprak sensöründe `map` ham sayıyı yüzdeye taşır; `constrain` uç taşmalarını keser. 8 ölçümün ortalaması gürültüyü azaltır (14. ders).
3. Yağmur ve su seviyesi basit eşiklerle karşılaştırılır. Sınır değerlerine yakın okumalarda durum hızla gidip gelebilir; bunun çaresi 35. dersteki termostatta kullandığın histerezistir.
4. Yön ve sayılar sensörden sensöre değiştiği için bu sayılar senin sensörün için doğru olmayabilir. Kalibrasyonu hep kendi sensörünle yap.

### Dene
- `toprak_yuzde` programında `KURU` ve `ISLAK` değerlerini yer değiştir. Yüzde ne oluyor? Gerçek sensörün hangi yönde olduğunu nasıl anlarsın?
- `toprak_kalibre` programını çalıştırırken sensörü önce havada `k` ile, sonra bir bardak suda `i` ile kaydet. Toprakta yüzde kaç çıkıyor?
- Sensörün yönü tersse (kuruda düşük) `yagmur_su` programındaki yağmur karşılaştırmasını nasıl değiştirirsin?

### Sık yapılan hatalar
- Sensörün yönünü bilmeden "büyük sayı = ıslak" varsaymak.
- `constrain` unutmak: kalibrasyon aralığının dışındaki okumalar %-20 ya da %130 gibi saçma değerler verir.
- Dirençli sensörü sürekli toprakta ve sürekli açık bırakmak: uçlar paslanır, okuma zamanla kayar.
- Kartı ya da bağlantı yerlerini ıslatmak.
- Sensör çıktısını tek bir ölçüme bakarak yorumlamak: gürültü yüzünden ortalama al.

## Konuşalım
Dirençli bir toprak nemi sensörünü bir yıl toprakta bıraktın ve okumalar yavaş yavaş kaydı. Bunun nedeni ne olabilir? Kalibrasyonu ne sıklıkla yenilersin, bunu otomatik yapmanın bir yolu olabilir mi?
