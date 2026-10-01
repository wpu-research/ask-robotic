# Düz gitme: iki tekerleği eşitleme
süre: 25

## Merak
Market arabasının tekerleklerinden biri bozuk olunca araba hep bir yana çeker, sen de sürekli direksiyonla düzeltirsin. Robotun direksiyonu yok; iki motoru aynı komutu alıyor ama biri biraz daha az dönüyor. İkisine de "git" demek robotu düz götürmez. Robotun bir "direksiyon eli" olması gerekir: iki tekerleğin sayaçlarına bakıp geride kalanı hızlandırmak.

## Etkinlik
### İki motor asla aynı değildir
Aynı model iki DC motor bile farklı çalışır: sürtünme, fırça aşınması, sürücüdeki gerilim düşümü, tekerleğin zemine basışı. Aynı PWM'de biri biraz daha yavaş döner. Benzetimde bunu `gain` ile verebiliriz: sağ tekerleğin verimi **%90** olsun (`gain: {left: 1, right: 0.9}`). Yani PWM aynı ama sağ tekerlek %10 yavaş.

### Devre
Önceki derslerle aynı: motorlar D5/D7/D8 ve D6/D9/D10, enkoderler D2 (sol) ve D3 (sağ). Motorlar için ayrı güç ve ortak GND.

### Program 1: ayarsız ilerleme
Önce düzeltmesiz sürelim. Robot iki motora da PWM 200 verip ortalama 193 tık (yaklaşık 2 m) gidiyor. Sonunda iki sayacı yazıyor.

```cpp
// sketch: duz_ham
const int EN_SOL = 5, IN1 = 7, IN2 = 8;
const int EN_SAG = 6, IN3 = 9, IN4 = 10;
const int ENK_SOL = 2, ENK_SAG = 3;

const float TIK_M = 2 * PI * 0.033 / 20;
const int HEDEF_TIK = 193;                      // yaklaşık 2 m

volatile unsigned int tikSol = 0;
volatile unsigned int tikSag = 0;

void sayiSol() { tikSol++; }
void sayiSag() { tikSag++; }

unsigned int oku(volatile unsigned int &sayac) {
  noInterrupts();
  unsigned int kopya = sayac;
  interrupts();
  return kopya;
}

void setup() {
  Serial.begin(9600);
  pinMode(EN_SOL, OUTPUT); pinMode(IN1, OUTPUT); pinMode(IN2, OUTPUT);
  pinMode(EN_SAG, OUTPUT); pinMode(IN3, OUTPUT); pinMode(IN4, OUTPUT);
  pinMode(ENK_SOL, INPUT); pinMode(ENK_SAG, INPUT);
  attachInterrupt(digitalPinToInterrupt(ENK_SOL), sayiSol, RISING);
  attachInterrupt(digitalPinToInterrupt(ENK_SAG), sayiSag, RISING);

  digitalWrite(IN1, HIGH); digitalWrite(IN2, LOW);
  digitalWrite(IN3, HIGH); digitalWrite(IN4, LOW);
  analogWrite(EN_SOL, 200);                     // iki tekerleğe aynı PWM
  analogWrite(EN_SAG, 200);

  while ((oku(tikSol) + oku(tikSag)) / 2 < HEDEF_TIK) {}
  analogWrite(EN_SOL, 0);
  analogWrite(EN_SAG, 0);
  delay(600);

  Serial.print("Sol tik: "); Serial.println(oku(tikSol));
  Serial.print("Sag tik: "); Serial.println(oku(tikSag));
  Serial.println("BITTI");
}

void loop() {}
```

Sağ tekerlek %10 yavaşken sonuç (benzetimde, geniş bir zeminde, robot x yönünde başlıyor):

```
Sol tik: 205
Sag tik: 185
```

Sol tekerlek 20 tık fazla attı. Fark `1,037 cm · 20 ≈ 21 cm` demek ve iki tekerlek arası 12 cm olduğu için robot sağa doğru **yaklaşık 100° döndü**. Robotun yaptığı yol 2 m ama bir **yay**: başlangıç noktasından yalnızca 1,1 m ileri gidip **137 cm yana** kaydı. Sağ tekerlek yalnız %5 yavaş olsaydı (`gain` 0,95): sayaçlar 200 ve 190, yana sapma **82 cm**. Tekerlekler tam eşit olunca (`gain` 1) sapma 0 cm.

Küçük bir verim farkının 2 m sonunda koca bir yay olmasının nedeni, hatanın **birikmesidir**: robot bir kez hafifçe yana döndü mü, geri kalan yolun hepsini artık o yöne doğru gider.

### Çözüm: sayaç farkına bak
Tık farkı (`sol − sağ`) robotun yöne ne kadar dönmüş olduğunu söyler. Fark 1 tık demek yaklaşık 1 cm yol farkı, yaklaşık 5° yön hatası demek (nedenini bir sonraki derste hesaplayacağız). Farkı sıfıra yaklaştırırsak robot düz gider.

**Orantılı (P) düzeltme:** hata ne kadar büyükse düzeltme o kadar büyük olsun.

```
hata   = sol_tık − sağ_tık          (pozitif: sol önde)
PWM_sol = 200 − KP · hata
PWM_sağ = 200 + KP · hata
```

Sol önde ise sol motoru kısıyoruz, sağı artırıyoruz. `KP`, tık farkı başına kaç PWM düzeltme yapılacağını söyler. Her tur sayaçları yeniden okuyup yeniden hesaplıyoruz.

### Program 2: P düzeltmeli ilerleme

```cpp
// sketch: duz_p
const int EN_SOL = 5, IN1 = 7, IN2 = 8;
const int EN_SAG = 6, IN3 = 9, IN4 = 10;
const int ENK_SOL = 2, ENK_SAG = 3;

const int HEDEF_TIK = 193;                      // yaklaşık 2 m
const int BAZ_PWM = 200;
const float KP = 20.0;                          // tık farkı başına PWM

volatile unsigned int tikSol = 0;
volatile unsigned int tikSag = 0;

void sayiSol() { tikSol++; }
void sayiSag() { tikSag++; }

unsigned int oku(volatile unsigned int &sayac) {
  noInterrupts();
  unsigned int kopya = sayac;
  interrupts();
  return kopya;
}

void setup() {
  Serial.begin(9600);
  pinMode(EN_SOL, OUTPUT); pinMode(IN1, OUTPUT); pinMode(IN2, OUTPUT);
  pinMode(EN_SAG, OUTPUT); pinMode(IN3, OUTPUT); pinMode(IN4, OUTPUT);
  pinMode(ENK_SOL, INPUT); pinMode(ENK_SAG, INPUT);
  attachInterrupt(digitalPinToInterrupt(ENK_SOL), sayiSol, RISING);
  attachInterrupt(digitalPinToInterrupt(ENK_SAG), sayiSag, RISING);

  digitalWrite(IN1, HIGH); digitalWrite(IN2, LOW);
  digitalWrite(IN3, HIGH); digitalWrite(IN4, LOW);
}

void loop() {
  int sol = oku(tikSol), sag = oku(tikSag);
  if ((sol + sag) / 2 >= HEDEF_TIK) {
    analogWrite(EN_SOL, 0);
    analogWrite(EN_SAG, 0);
    delay(600);
    Serial.print("Sol tik: "); Serial.println(oku(tikSol));
    Serial.print("Sag tik: "); Serial.println(oku(tikSag));
    Serial.println("BITTI");
    while (true) {}
  }
  int hata = sol - sag;                         // > 0: sol önde
  int pwmSol = constrain(BAZ_PWM - KP * hata, 0, 255);
  int pwmSag = constrain(BAZ_PWM + KP * hata, 0, 255);
  analogWrite(EN_SOL, pwmSol);
  analogWrite(EN_SAG, pwmSag);
}
```

Aynı robotla (sağ tekerlek %10 yavaş) sonuç:

```
Sol tik: 195
Sag tik: 195
```

### Sonuç: sayılarla
Başlangıç noktasından 2 m ileri gidince **yanal sapma** `|y − y0|` (benzetimin bildiği gerçek konumdan; gerçek robotta şerit metre ile ölçersin):

| Durum | Sağ verim | Sapma |
|---|---|---|
| Düzeltmesiz | %100 | 0 cm |
| Düzeltmesiz | %95 | 82 cm |
| Düzeltmesiz | %90 | 137 cm |
| P düzeltmeli, `KP = 5` | %90 | 25,5 cm |
| P düzeltmeli, `KP = 20` | %95 | 3,3 cm |
| P düzeltmeli, `KP = 20` | %90 | 6,7 cm |
| P düzeltmeli, `KP = 40` | %90 | 3,4 cm |

Düzeltme sapmayı yaklaşık **20 kat** azalttı (137 cm → 6,7 cm). `KP` büyüdükçe sapma küçüldü. Sıfır olmadı, çünkü düzeltme ancak bir tık farkı oluştuktan **sonra** devreye giriyor: hata önce ortaya çıkar, sonra düzeltilir. İlk anlarda robot biraz yana gider; sapmanın tamamı bu geçiş anında birikir. Sonunda iki sayaç eşit çıktı (195 ve 195).

`KP` istediğin kadar büyütülemez: PWM 0-255 aralığıyla sınırlı, ayrıca ölçüm tık tık geliyor. Bu ayarın inceliklerini 5. haftada (P, D, I) çalışacağız.

### Dene
- `KP` değerini 5 ve 40 yap. Çıktıdaki sayaçlar eşit kaldı mı? Yolun sonunda robot yine de yana kaydı mı?
- Benzetimde bu sefer **sol** tekerleği yavaşlat (`gain: {left: 0.9, right: 1}`). Aynı program düzeltir mi? Hangi satır hangi tekerleği kısıyor?
- `BAZ_PWM`'i 120'ye düşür. Robot daha yavaş gider ve düzeltme için PWM payı kalır. Sapma değişti mi?
- Düzeltmeyi yalnızca sağ tekerleğe uygula (sol hep 200 kalsın). Ne değişir?

### Sık yapılan hatalar
- Düzeltme işaretini ters yazmak: yavaş tekerlek daha da yavaşlar, robot daha çok sapar.
- Tek tekerleğin sayacına bakıp mesafeyi ölçmek: bir tekerlek yay çizerken öbürü farklı yol alır, ortalama almak daha doğrudur.
- `KP` çok küçük seçip "düzeltme çalışmıyor" demek.
- Sayaç farkını `int`e çevirmeden `unsigned` çıkarmak: negatif fark çok büyük bir sayıya dönüşür.

### Gerçek robotta farklı olabilecekler
Gerçek robotta tekerlek verim farkı sabit değildir: pil gerilimi düştükçe, zemin değiştikçe, motorlar ısındıkça değişir. Benzetimde fark sabit tutulmuştur; bu yüzden gerçek robotta düzeltmenin tek bir `KP` ile iyi çalışmasını garanti sayma, sahada ayarla.

## Konuşalım
Düzeltme olmadan 2 m yürüyen robot neden "biraz" değil de çok yana kaydı? P düzeltmesi hatayı hiç sıfırlayamıyorsa sence ne eklenmeli?
