// Lojik seviyeli N-MOSFET (IRLZ44N / AO3400) ile DC motor, alçak taraf:
// D9 -> 220 Ω -> kapı (G); kaynak (S) -> GND; akaç (D) -> motor -> 5V; kapı 10 kΩ ile GND'ye (kapı boşta kalmasın).
// IRF540 lojik seviyeli DEĞİLDİR: 5 V kapıda tam açılmaz (Vgs(th) 2-4 V, tam iletim ~10 V).
const int KAPI = 9;

void setup() {
  Serial.begin(9600);
  pinMode(KAPI, OUTPUT);
}

void loop() {
  for (int d = 0; d <= 255; d += 51) {
    analogWrite(KAPI, d);
    Serial.print("doluluk=");
    Serial.println(d);
    delay(600);
  }
}
