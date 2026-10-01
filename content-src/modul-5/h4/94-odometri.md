# Odometri: konum ve yön tahmini, sapma
süre: 30

## Merak
Işıkları kapalı, tam karanlık bir odada gözün kapalıyken yürüdüğünü düşün. "İleri 5 adım, sola dön, 3 adım" diye sayarsan nerede olduğunu kabaca bilirsin. Ne kadar uzun yürürsen tahminin o kadar bozulur. Robotlar da bunu yapar. Buna **odometri** denir: tekerleklerin döndüğü miktardan robotun nerede olduğunu ve nereye baktığını hesaplamak. Peki bu tahmine ne kadar güvenebiliriz?

## Etkinlik
### Formüller
91. derste tıklardan her tekerleğin aldığı yolu bulduk: `ΔsL` (sol) ve `ΔsR` (sağ), küçük bir zaman adımında. Robotun iki tekerlek arası uzaklık `L = 12 cm`.

**Merkezin aldığı yol:** iki tekerleğin ortalaması.

```
Δs = (ΔsL + ΔsR) / 2
```

**Dönüş açısı:** sağ tekerlek soldan `d` kadar fazla yol aldıysa robot sola döner. İki tekerlek aynı daire etrafında farklı yarıçapla yürür; yarıçap farkı `L`, yay farkı `d` olduğundan açı `d / L` olur (yay = açı × yarıçap). Sola dönüşü pozitif sayıyoruz:

```
Δθ = (ΔsR − ΔsL) / L
```

(76. derste gördüğün `ω = (vR − vL) / L` formülünün yol karşılığı.)

**Konum:** robot Δs kadar, baktığı yönde ilerler. Adım içinde yön de değiştiği için adımın **ortasındaki** yönü kullanırız:

```
x ← x + Δs · cos(θ + Δθ/2)
y ← y + Δs · sin(θ + Δθ/2)
θ ← θ + Δθ
```

`θ = 0` robotun +x eksenine baktığı, pozitif açı sola dönüş anlamına gelir. Başlangıçta `x = y = θ = 0` alırız: odometri "robotun başladığı yer" ölçü sisteminde çalışır.

Bu hesabı çok sık (örneğin her `loop()` turunda) yaparsan adımlar küçük kalır ve tahmin doğru çıkar.

### Tek kanallı enkoder yönü bilmez
Bizim enkoderimiz yalnız "bir yuva geçti" der; tekerleğin ileri mi geri mi döndüğünü söylemez. Yönü biz **komuttan** biliriz: motoru geri sürdüysek tıkları eksi sayarız. Programda `yonSol` ve `yonSag` son verilen yönü tutar. Dışarıdan itilen ya da kayarak geri giden bir robotu bu enkoderle doğru izleyemezsin. (Bu yüzden gerçek robotlarda genellikle iki kanallı enkoder kullanılır; Modül 4'te döner enkoderde A/B kanalıyla yönü bulmuştun.)

### Devre
91. dersin devresiyle aynı: motorlar D5/D7/D8 ve D6/D9/D10, enkoderler D2 ve D3, ayrı motor gücü ve ortak GND.

### Program 1: bir yol çiz, tahmini yaz
Robot şu yolu izler: 1 m ileri, 90° sola dön, 0,5 m ileri, 90° sola dön, 1 m ileri. Her adımdan sonra odometri tahminini (cm ve derece) yazar. İleri giderken 93. dersteki P düzeltmesini kullanır.

```cpp
// sketch: odometri_temel
const int EN_SOL = 5, IN1 = 7, IN2 = 8;
const int EN_SAG = 6, IN3 = 9, IN4 = 10;
const int ENK_SOL = 2, ENK_SAG = 3;

const float TIK_M = 2 * PI * 0.033 / 20;   // bir tıkın mesafesi (m)
const float L = 0.12;                      // iki tekerlek arası (m)

volatile unsigned int tikSol = 0;
volatile unsigned int tikSag = 0;
unsigned int oncekiSol = 0, oncekiSag = 0;
int yonSol = 1, yonSag = 1;                // tek kanallı enkoder yön bilmez

float x = 0, y = 0, th = 0;                // tahmin: m, m, rad

void sayiSol() { tikSol++; }
void sayiSag() { tikSag++; }

unsigned int oku(volatile unsigned int &sayac) {
  noInterrupts();
  unsigned int kopya = sayac;
  interrupts();
  return kopya;
}

void odometriGuncelle() {
  unsigned int s = oku(tikSol), g = oku(tikSag);
  float dsSol = yonSol * (int)(s - oncekiSol) * TIK_M;
  float dsSag = yonSag * (int)(g - oncekiSag) * TIK_M;
  oncekiSol = s; oncekiSag = g;

  float ds = (dsSol + dsSag) / 2;          // merkezin aldığı yol
  float dth = (dsSag - dsSol) / L;         // dönüş (sola +)
  x += ds * cos(th + dth / 2);             // ortadaki yönü kullan
  y += ds * sin(th + dth / 2);
  th += dth;
}

void motorlar(int sol, int sag) {          // -255..255
  digitalWrite(IN1, sol > 0); digitalWrite(IN2, sol < 0);
  digitalWrite(IN3, sag > 0); digitalWrite(IN4, sag < 0);
  analogWrite(EN_SOL, abs(sol));
  analogWrite(EN_SAG, abs(sag));
  if (sol != 0) yonSol = sol > 0 ? 1 : -1;
  if (sag != 0) yonSag = sag > 0 ? 1 : -1;
}

void bekle(unsigned long ms) {             // beklerken de tıkları say
  unsigned long t = millis();
  while (millis() - t < ms) odometriGuncelle();
}

void ileriGit(float metre) {               // ders 93'teki P düzeltmesi
  float baslangicX = x, baslangicY = y;
  unsigned int s0 = oku(tikSol), g0 = oku(tikSag);
  while (hypot(x - baslangicX, y - baslangicY) < metre - 0.01) {
    odometriGuncelle();
    int hata = (int)(oku(tikSol) - s0) - (int)(oku(tikSag) - g0);
    motorlar(constrain(200 - 20 * hata, 0, 255), constrain(200 + 20 * hata, 0, 255));
  }
  motorlar(0, 0);
  bekle(400);
}

void solaDon(float derece) {
  float hedef = th + derece * PI / 180;
  motorlar(-100, 100);                     // yerinde dön
  while (th < hedef - 0.05) odometriGuncelle();
  motorlar(0, 0);
  bekle(400);
}

void yaz(const char* ad) {
  Serial.print(ad);
  Serial.print(" x="); Serial.print(x * 100, 1);
  Serial.print(" y="); Serial.print(y * 100, 1);
  Serial.print(" aci="); Serial.println(th * 180 / PI, 1);
}

void setup() {
  Serial.begin(9600);
  pinMode(EN_SOL, OUTPUT); pinMode(IN1, OUTPUT); pinMode(IN2, OUTPUT);
  pinMode(EN_SAG, OUTPUT); pinMode(IN3, OUTPUT); pinMode(IN4, OUTPUT);
  pinMode(ENK_SOL, INPUT); pinMode(ENK_SAG, INPUT);
  attachInterrupt(digitalPinToInterrupt(ENK_SOL), sayiSol, RISING);
  attachInterrupt(digitalPinToInterrupt(ENK_SAG), sayiSag, RISING);

  ileriGit(1.0);   yaz("1");
  solaDon(90);     yaz("2");
  ileriGit(0.5);   yaz("3");
  solaDon(90);     yaz("4");
  ileriGit(1.0);   yaz("5");
  Serial.println("BITTI");
}

void loop() {}
```

Seri çıktı (x, y cm; açı derece):

```
1 x=101.6 y=0.0 aci=0.0
2 x=101.3 y=0.3 aci=89.1
3 x=102.1 y=52.1 aci=89.1
4 x=101.8 y=51.8 aci=178.2
5 x=0.3 y=55.0 aci=178.2
```

### Nasıl çalışıyor?
1. `odometriGuncelle()` yalnız **son çağrıdan beri** gelen tıkları (`s - oncekiSol`) alır, formülleri uygular ve `x`, `y`, `th` değerlerini günceller. Çok sık çağrıldığı için `bekle()` ve `while` döngülerinin içinde de çağırıyoruz; robot dönerken ya da kayarak dururken sayılan tıklar kaybolmasın.
2. Dönüşü `th`'a bakarak durduruyoruz: `th`, hedefe yaklaşınca (0,05 rad = ~3° kala) motorlar kapanır. Robot durmadan önce biraz daha döner.
3. Robota 90° dedik; odometri **89,1°** gördü, robot gerçekte yaklaşık 94° döndü. Tıklar 5°'lik adımlarla geldiği için tahmin böyle kaba kalır (aşağıda).

### Tahmin ne kadar doğru? Gerçekle karşılaştırma
Benzetim robotun gerçek konumunu bilir. Aynı koşuda gerçek konum:

| | x (cm) | y (cm) | yön (derece) |
|---|---|---|---|
| Odometri tahmini | 0,3 | 55,0 | 178,2 |
| Gerçek (benzetim) | −2,4 | 36,9 | 188,1 |

Aradaki mesafe **yaklaşık 18 cm**; yön 10° şaşmış. Yolun toplamı yalnız 2,5 m. Neden bu kadar şaşırdı? İlk dönüş sırasında gerçek robot 94° döndü, odometri 89° gördü. Çünkü tekerlek bir yuvanın ortasındayken durursa o yarım yuva sayılmaz. Bu **nicemleme hatası**: bir tık yaklaşık 1,04 cm yol, iki tekerlek arası 12 cm olduğu için **bir tık = 5° dönüş belirsizliği**. 5° ile 1 m yürürsen 9 cm yana kayarsın. Hata dönüşte oluşur, sonraki düz yolda büyür.

**Çözüm 1: çözünürlüğü artır.** Kesmeyi `RISING` yerine `CHANGE` yaparsan her yuvada iki kenar (LOW→HIGH ve HIGH→LOW) sayılır; tık sayısı 40, `TIK_M` yarıya iner (0,52 cm). Aynı program, bu iki değişiklikle:

```
tahmin: x=−2,9  y=36,9  yön=188,1
gerçek: x=−2,4  y=36,9  yön=188,1
```

Fark **0,5 cm**. Hata neredeyse yok oldu.

### Sapma: birikim ve sistematik hata
Çözünürlük artınca hata yok olmadı mı? Hayır, yalnızca bir cins hata yok oldu. Ölçtüğümüz sayılar doğru olsa bile formüldeki **sabitler** yanlışsa tahmin yanlış çıkar.

Deneyi CHANGE'li programla yapalım. Programdaki sayıları aynı bırakalım, ama benzetimdeki robotu değiştirelim:

| Gerçek robot | Tahmin (aynı kaldı) | Gerçek konum farkı |
|---|---|---|
| Doğru (r = 3,3 cm, L = 12 cm) | x=−2,9 y=36,9 | 0,5 cm |
| Tekerlek yarıçapı 3,45 cm (yazılımda 3,3) | x=−2,9 y=36,9 | 14,1 cm |
| Aks aralığı 12,5 cm (yazılımda 12) | x=−2,9 y=36,9 | 13,7 cm |

Yazılım tekerleğin yarıçapını 1,5 mm az, aks aralığını 5 mm az bilirse tahmin 2,5 m'lik yolda 14 cm şaşar. Programın **kendisi** hatayı göremez; çünkü tıklar doğru sayılmıştır, formül kandırılmıştır. Ölçüm hatası birikir: yol uzadıkça artar.

Yön için bu hatayı yerinde dönerek görelim. Program, robotu iki tam tur döndürür (tahmin 720° olunca durur):

```cpp
// sketch: donus_birikim
const int EN_SOL = 5, IN1 = 7, IN2 = 8;
const int EN_SAG = 6, IN3 = 9, IN4 = 10;
const int ENK_SOL = 2, ENK_SAG = 3;

const float TIK_M = 2 * PI * 0.033 / 20;
const float L = 0.12;                      // iki tekerlek arası (m): ölçüm hatası buraya girer

volatile unsigned int tikSol = 0;
volatile unsigned int tikSag = 0;
unsigned int oncekiSol = 0, oncekiSag = 0;
float th = 0;                              // tahmini yön (rad)

void sayiSol() { tikSol++; }
void sayiSag() { tikSag++; }

unsigned int oku(volatile unsigned int &sayac) {
  noInterrupts();
  unsigned int kopya = sayac;
  interrupts();
  return kopya;
}

void yonGuncelle() {
  unsigned int s = oku(tikSol), g = oku(tikSag);
  float dsSol = -(int)(s - oncekiSol) * TIK_M;   // sol tekerlek geri
  float dsSag = (int)(g - oncekiSag) * TIK_M;    // sağ tekerlek ileri
  oncekiSol = s; oncekiSag = g;
  th += (dsSag - dsSol) / L;
}

void setup() {
  Serial.begin(9600);
  pinMode(EN_SOL, OUTPUT); pinMode(IN1, OUTPUT); pinMode(IN2, OUTPUT);
  pinMode(EN_SAG, OUTPUT); pinMode(IN3, OUTPUT); pinMode(IN4, OUTPUT);
  pinMode(ENK_SOL, INPUT); pinMode(ENK_SAG, INPUT);
  attachInterrupt(digitalPinToInterrupt(ENK_SOL), sayiSol, RISING);
  attachInterrupt(digitalPinToInterrupt(ENK_SAG), sayiSag, RISING);

  digitalWrite(IN1, LOW);  digitalWrite(IN2, HIGH);   // sol geri
  digitalWrite(IN3, HIGH); digitalWrite(IN4, LOW);    // sağ ileri
  analogWrite(EN_SOL, 100);
  analogWrite(EN_SAG, 100);

  while (th < 4 * PI - 0.1) yonGuncelle();            // 2 tam tur
  analogWrite(EN_SOL, 0);
  analogWrite(EN_SAG, 0);
  delay(500);
  yonGuncelle();

  Serial.print("Tahmin (derece): ");
  Serial.println(th * 180 / PI, 0);
}

void loop() {}
```

Benzetimde sonuç:

| Gerçek aks aralığı | Odometri tahmini | Robotun gerçek dönüşü | Fark |
|---|---|---|---|
| 12 cm (yazılımla aynı) | 723° | 720° | 3° |
| 12,5 cm | 723° | 691° | 32° |

Aks aralığı %4 yanlışken iki turda 32° sapma çıktı; yani tur başına yaklaşık 16°. Dönüş sayısı arttıkça fark **orantılı** büyür: 10 turda 160° civarı olurdu. Bu yüzden uzun yolda odometri yön hatası, konum hatasını da büyütür.

### Gerçek robotta durum daha kötü
Benzetimde tekerlek **kaymaz**. Bu yüzden tıklar yolu kusursuz verir ve hata yalnız yukarıdaki iki nedenden gelir: tık çözünürlüğü ve yanlış sabitler. Gerçek robotta ek olarak:
- Tekerlek kayar (gaz verince, dönerken, tozlu zeminde); enkoder dönüşü sayar ama robot o kadar gitmemiştir.
- Zemin eğimi, tekerlek aşınması, tekerleğin yere basarken ezilmesi yarıçapı değiştirir.
- Engele çarpınca tekerlek döner, robot yerinde durur.

Bu hatalar birikir ve odometri kendini asla düzeltmez. Yüzlerce adım sonra tahmin tamamen yanlış olabilir. Çözüm, odometriyi başka bir sensörle düzeltmektir: yön için jiroskop (6. haftada IMU, 7. haftada enkoderle birleştirme), konum için çizgi ya da duvar.

### Dene
- `odometri_temel` programında kesmeyi `CHANGE` yap ve `TIK_M` formülündeki 20'yi 40'a çevir. Tahmin ile gerçek konum nasıl yaklaşıyor? (Karşılaştırma için benzetimin gerçek konumuna bak.)
- `L` değerini 0,13 yap. Aynı yolun sonunda tahmin nasıl değişiyor? Kendi robotunda aks aralığını nasıl ölçerdin?
- `donus_birikim` programında dönüş hızını (PWM 100) değiştir. Odometri tahmini ile robotun gerçek dönüşü arasındaki fark değişiyor mu? Sabit bir ölçüm hatasının hıza bağlı olup olmadığını düşün.
- Odometrinin `yonSol`/`yonSag` değişkenlerini sabit 1 yap ve robotu geri sür. Tahmin ne olur?

### Sık yapılan hatalar
- Açıyı derece ile radyan karıştırmak: `cos` ve `sin` radyan ister.
- Tekerlek yolunun işaretini (geri giderken eksi) unutmak.
- Dönüş sırasında ya da `delay` içinde odometriyi güncellememek: tıklar sayaçta birikir ama `x`, `y`, `th` hesabında o an yön yanlış kullanılır.
- Dönüş formülünde `L` yerine `L/2` kullanmak (ya da tersi): açı iki kat şaşar.
- Yarıçap ve aks aralığını tahminle yazmak, cetvelle ölçmemek.

## Konuşalım
Odometri hatasının biriktiğini gördün. Robotun başlangıç noktasına döndüğünü nasıl anlarsın? Bir kareyi çizdikten sonra "başladığım yere döndüm" demek için neye güvenebilirsin?
