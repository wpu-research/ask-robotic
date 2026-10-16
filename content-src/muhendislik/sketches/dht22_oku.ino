// DHT22: VCC -> 5V, DATA -> D2, GND -> GND (modül kartında 10 kΩ pull-up vardır)
// Okuma en fazla 2 saniyede bir: sensör daha sık sorgulanırsa eski değeri verir.
#include <DHT.h>

DHT dht(2, DHT22);

void setup() {
  Serial.begin(9600);
  dht.begin();
}

void loop() {
  delay(2000);
  float h = dht.readHumidity();
  float t = dht.readTemperature();
  if (isnan(h) || isnan(t)) {
    Serial.println("okuma hatasi");
    return;
  }
  Serial.print("T=");
  Serial.print(t, 1);
  Serial.print(" H=");
  Serial.println(h, 1);
}
