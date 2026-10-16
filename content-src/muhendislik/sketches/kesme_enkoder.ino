// ESOF 323, 3. hafta: döner enkoder tıklarını kesmeyle (interrupt) saymak
// Enkoder CLK -> D2 (kesme 0), DT -> D4, SW -> D5; + -> 5V, GND -> GND
volatile long ticks = 0;

void onClk() {                     // ISR: çok kısa tut
  if (digitalRead(4) != digitalRead(2)) ticks++;   // yön: DT ile CLK farklıysa saat yönü
  else ticks--;
}

void setup() {
  Serial.begin(9600);
  pinMode(2, INPUT_PULLUP);
  pinMode(4, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(2), onClk, CHANGE);
}

void loop() {
  static unsigned long t0 = 0;
  if (millis() - t0 >= 100) {      // 10 Hz'de raporla
    t0 = millis();
    noInterrupts();
    long copy = ticks;             // long 4 bayttır: atomik kopyala
    interrupts();
    Serial.print("tik=");
    Serial.println(copy);
  }
}
