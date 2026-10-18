// Raspberry Pi dersinin kod örnekleri: kod iki dilde aynı, yalnız yorumlar c(tr, en) ile çevrilir (satır sayısı eşit kalır).
import { block, type Lang } from '@/lib/gomulu/types'
import type { CodeLine } from '@/lib/ml/core'

export const blinkCompare = (l: Lang) => block(l, 'Aynı LED, iki dünya: Pi (Linux, Python) ve Pico (MicroPython)', 'Same LED, two worlds: Pi (Linux, Python) and Pico (MicroPython)', (c) => `# --- Raspberry Pi 5: ${c('Linux üstünde bir süreç; zamanlama işletim sistemine bağlı', 'a process on Linux; timing depends on the OS')}
from gpiozero import LED
from time import sleep
led = LED(17)            # BCM 17 = ${c('fiziksel pin 11', 'physical pin 11')}
while True:
    led.toggle()
    sleep(0.5)           # ${c('±birkaç ms sapabilir: zamanlayıcı başka süreçleri de çalıştırır', 'may drift a few ms: the scheduler runs other processes too')}

# --- Raspberry Pi Pico: ${c('işletim sistemi yok, kod doğrudan donanımda', 'no operating system, code runs on the bare chip')}
from machine import Pin, Timer
led = Pin(25, Pin.OUT)
Timer(freq=2, mode=Timer.PERIODIC, callback=lambda t: led.toggle())  # ${c('donanım zamanlayıcısı: titreşimsiz', 'hardware timer: jitter-free')}`)

export const setupSh = (l: Lang) => block(l, 'İlk kurulum betiği (setup.sh)', 'First-boot setup script (setup.sh)', (c) => `#!/bin/bash
# ${c('Hata olursa dur, tanımsız değişkeni hata say', 'stop on error, treat unset variables as errors')}
set -euo pipefail
sudo apt update && sudo apt full-upgrade -y
sudo apt install -y python3-gpiozero python3-opencv python3-picamera2 i2c-tools python3-smbus2 python3-flask
# ${c('Arayüzleri etkinleştir (raspi-config\'in etkileşimsiz kipi; 0 = aç)', 'enable interfaces (raspi-config non-interactive; 0 = on)')}
sudo raspi-config nonint do_i2c 0
sudo raspi-config nonint do_spi 0
sudo raspi-config nonint do_ssh 0
# ${c('Kullanıcıyı donanım gruplarına ekle: sudo\'suz GPIO/I2C/SPI erişimi', 'add the user to hardware groups: GPIO/I2C/SPI without sudo')}
sudo usermod -aG gpio,i2c,spi,video "$USER"
mkdir -p ~/robot/logs
chmod +x ~/start.sh
echo "${c('Bitti. Grupların geçerli olması için yeniden başlat: sudo reboot', 'Done. Reboot for the groups to apply: sudo reboot')}"`)

export const venvSh = (l: Lang) => block(l, 'Sanal ortam: sistem paketlerini görerek', 'Virtual environment that can see system packages', (c) => `# ${c('Bookworm\'da pip sistem Python\'una kurmaz (PEP 668): sanal ortam kullan', 'on Bookworm pip will not install into system Python (PEP 668): use a venv')}
python3 -m venv --system-site-packages ~/robot/.venv   # ${c('picamera2 ve gpiozero apt\'tan gelir, görünür kalır', 'picamera2 and gpiozero come from apt and stay visible')}
source ~/robot/.venv/bin/activate
pip install pyyaml pytest                               # ${c('yalnız apt\'ta olmayanlar', 'only what apt does not provide')}
pip freeze > ~/robot/requirements.txt                   # ${c('sürümleri sabitle', 'pin the versions')}`)

export const logPy = (l: Lang) => block(l, 'Sensör günlüğü: dataclass, csv ve testlenebilir fonksiyon', 'Sensor log: dataclass, csv and a testable function', (c) => `from dataclasses import dataclass
from statistics import mean, pstdev
import csv, time

@dataclass
class Reading:
    t: float
    temp_c: float

def summarize(rows: list[Reading]) -> dict:
    """${c('Saf fonksiyon: donanım yok, pytest ile test edilir', 'pure function: no hardware, tested with pytest')}"""
    temps = [r.temp_c for r in rows]
    return {"n": len(temps), "mean": round(mean(temps), 2), "std": round(pstdev(temps), 2), "max": max(temps)}

def log_forever(read_temp, path="logs/temp.csv", period=1.0):
    # ${c('read_temp dışarıdan verilir: testte sahte, Pi\'de DS18B20 okuyucu', 'read_temp is injected: a fake in tests, the DS18B20 reader on the Pi')}
    with open(path, "a", newline="") as f:
        w = csv.writer(f)
        while True:
            w.writerow([time.time(), read_temp()])
            f.flush()          # ${c('elektrik kesilirse son satır kaybolmasın', 'so the last row survives a power cut')}
            time.sleep(period)

def test_summarize():
    s = summarize([Reading(0, 20.0), Reading(1, 22.0)])
    assert s["mean"] == 21.0 and s["max"] == 22.0`)

export const PY_FIT: CodeLine[] = [
  ['import numpy as np'],
  ["pwm, hiz = np.genfromtxt('motor-pwm.csv', delimiter=',', skip_header=1, unpack=True)", 'Pi\'de toplanmış motor ölçümleri', 'motor measurements logged on the Pi'],
  ['print(f"{len(pwm)} ölçüm, PWM {pwm.min():.0f}..{pwm.max():.0f}")'],
  ['a, b = np.polyfit(pwm, hiz, 1)', 'en küçük kareler doğrusu', 'least-squares line'],
  ['print(f"hız ≈ {a:.3f}·PWM + {b:.2f} cm/s")'],
  ['olu = -b / a', 'motorun dönmeye başladığı PWM (ölü bölge)', 'PWM where the motor starts turning (dead band)'],
  ['print(f"ölü bölge ≈ PWM {olu:.0f}")'],
  ['hedef = 20.0', 'cm/s', 'cm/s'],
  ['print(f"20 cm/s için PWM ≈ {(hedef - b) / a:.0f}")', 'ileri besleme (feedforward) değeri', 'feedforward value'],
  ['artik = hiz - (a * pwm + b)'],
  ['print(f"artık std = {artik.std():.2f} cm/s")', 'gürültü: PI denetiminin kapatacağı kısım', 'noise: the part PI control must close'],
]

export const gpioPy = (l: Lang) => block(l, 'Alarm: gpiozero ile olay güdümlü', 'Alarm: event-driven with gpiozero', (c) => `from gpiozero import LED, Button, Buzzer
from signal import pause

led = LED(17)
buzzer = Buzzer(22)
button = Button(27, pull_up=True, bounce_time=0.05)   # ${c('dahili pull-up: buton GND\'ye çeker', 'internal pull-up: the button pulls to GND')}

def toggle():
    if led.is_lit:
        led.off(); buzzer.off()
    else:
        led.on(); buzzer.beep(on_time=0.2, off_time=0.2)   # ${c('arka planda iş parçacığı', 'runs in a background thread')}

button.when_pressed = toggle    # ${c('döngü yok: geri çağırma', 'no loop: a callback')}
pause()                         # ${c('ana iş parçacığını uyut', 'keep the main thread asleep')}`)

export const rpiGpioPy = (l: Lang) => block(l, 'Aynı devre, RPi.GPIO / lgpio tarzı (alt düzey)', 'The same circuit in RPi.GPIO / lgpio style (low level)', (c) => `# ${c('Pi 5\'te RPi.GPIO yerine rpi-lgpio paketi aynı API\'yi sunar', 'on the Pi 5 the rpi-lgpio package provides the same API as RPi.GPIO')}
import RPi.GPIO as GPIO
GPIO.setmode(GPIO.BCM)                    # ${c('BCM numaraları (fiziksel değil)', 'BCM numbers (not physical)')}
GPIO.setup(17, GPIO.OUT)
GPIO.setup(27, GPIO.IN, pull_up_down=GPIO.PUD_UP)
servo = GPIO.PWM(18, 50)                  # ${c('50 Hz servo; donanım PWM pini', '50 Hz servo; a hardware-PWM pin')}
servo.start(7.5)                          # ${c('%7,5 görev = 1,5 ms = orta', '7.5 % duty = 1.5 ms = centre')}
try:
    while True:
        pressed = GPIO.input(27) == GPIO.LOW
        GPIO.output(17, pressed)
        servo.ChangeDutyCycle(10.0 if pressed else 5.0)
finally:
    GPIO.cleanup()                        # ${c('pinleri giriş kipine geri al', 'return the pins to input mode')}`)

export const sensorsPy = (l: Lang) => block(l, 'DS18B20 (1-Wire), BME280 (I²C) ve MCP3008 (SPI)', 'DS18B20 (1-Wire), BME280 (I²C) and MCP3008 (SPI)', (c) => `from pathlib import Path
from smbus2 import SMBus
import spidev

def ds18b20() -> float | None:
    dev = next(Path("/sys/bus/w1/devices").glob("28-*"))      # ${c('aile kodu 28 = DS18B20', 'family code 28 = DS18B20')}
    l1, l2 = (dev / "w1_slave").read_text().strip().splitlines()
    if not l1.endswith("YES"):
        return None                                           # ${c('CRC tutmadı: yeniden oku', 'CRC failed: read again')}
    return int(l2.split("t=")[1]) / 1000

with SMBus(1) as bus:                                         # ${c('/dev/i2c-1', '/dev/i2c-1')}
    chip = bus.read_byte_data(0x76, 0xD0)                     # ${c('kimlik yazmacı', 'ID register')}
    print("BME280" if chip == 0x60 else f"? 0x{chip:02x}")

spi = spidev.SpiDev(); spi.open(0, 0)                         # ${c('SPI0, CE0', 'SPI0, CE0')}
spi.max_speed_hz = 1_000_000
rx = spi.xfer2([0x01, (0x08 | 0) << 4, 0x00])                 # ${c('başla, tek uçlu, kanal 0', 'start, single-ended, channel 0')}
value = ((rx[1] & 0x03) << 8) | rx[2]
print(f"CH0 = {value} -> {value * 3.3 / 1024:.2f} V, T = {ds18b20()} C")`)

export const visionPy = (l: Lang) => block(l, 'picamera2 + OpenCV ile top izleme', 'Ball tracking with picamera2 + OpenCV', (c) => `from picamera2 import Picamera2
import cv2, numpy as np

cam = Picamera2()
cam.configure(cam.create_video_configuration(main={"size": (320, 240), "format": "RGB888"}))
cam.start()
LO, HI = np.array([40, 80, 60]), np.array([85, 255, 255])   # ${c('yeşil, OpenCV HSV (H 0-179)', 'green, OpenCV HSV (H 0-179)')}
kernel = np.ones((3, 3), np.uint8)

while True:
    frame = cam.capture_array()                    # ${c('RGB888 adı yanıltıcı: bellekte BGR sırası', 'RGB888 is misleading: BGR order in memory')}
    hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
    mask = cv2.morphologyEx(cv2.inRange(hsv, LO, HI), cv2.MORPH_OPEN, kernel)
    m = cv2.moments(mask, binaryImage=True)
    if m["m00"] > 150:                             # ${c('yeterince büyük leke', 'blob big enough')}
        cx = m["m10"] / m["m00"]
        turn = (cx - 160) / 160                    # ${c('-1 sol ... +1 sağ', '-1 left ... +1 right')}
        print(f"target x={cx:.0f} turn={turn:+.2f}")
    else:
        print("no target")`)

export const motorPy = (l: Lang) => block(l, 'Motor + enkoder + PI hız döngüsü', 'Motor + encoder + PI speed loop', (c) => `from gpiozero import Motor, RotaryEncoder
from time import sleep, monotonic

motor = Motor(forward=5, backward=6, enable=12)      # ${c('L298N IN1, IN2, ENA (PWM)', 'L298N IN1, IN2, ENA (PWM)')}
enc = RotaryEncoder(a=23, b=24, max_steps=0)         # ${c('max_steps=0: sınırsız sayım', 'max_steps=0: unbounded count')}
CPR = 1400                                           # ${c('çıkış milinde tur başına sayım', 'counts per output-shaft turn')}
KP, KI, DT = 0.004, 0.02, 0.02
integral, last = 0.0, enc.steps

def control(target_rpm: float):
    global integral, last
    steps = enc.steps
    rpm = (steps - last) / CPR * 60 / DT
    last = steps
    err = target_rpm - rpm
    u = KP * err + KI * (integral + err * DT)
    if abs(u) < 1:
        integral += err * DT                         # ${c('doyumda integrali dondur (anti-windup)', 'freeze the integral when saturated (anti-windup)')}
    u = max(-1.0, min(1.0, u))
    motor.forward(u) if u >= 0 else motor.backward(-u)
    return rpm

t0 = monotonic()
while monotonic() - t0 < 5:
    print(f"{control(100):.0f} rpm")
    sleep(DT)                                        # ${c('Linux: 20 ms ± titreşim; kesin döngü için MCU', 'Linux: 20 ms ± jitter; use an MCU for a hard loop')}
motor.stop()`)

export const odomPy = (l: Lang) => block(l, 'Odometri sınıfı (tam yay)', 'Odometry class (exact arc)', (c) => `from math import sin, cos, pi, atan2

class Odometry:
    def __init__(self, track_m=0.15, wheel_d=0.065, cpr=1400):
        self.L, self.k = track_m, pi * wheel_d / cpr   # ${c('sayım başına metre', 'metres per count')}
        self.x = self.y = self.th = 0.0

    def update(self, dticks_l: int, dticks_r: int):
        dl, dr = dticks_l * self.k, dticks_r * self.k
        d, dth = (dl + dr) / 2, (dr - dl) / self.L
        if abs(dth) < 1e-9:
            self.x += d * cos(self.th); self.y += d * sin(self.th)
        else:
            R = d / dth                                 # ${c('dönüş yarıçapı', 'turn radius')}
            self.x += R * (sin(self.th + dth) - sin(self.th))
            self.y -= R * (cos(self.th + dth) - cos(self.th))
        self.th = atan2(sin(self.th + dth), cos(self.th + dth))

def wheels(v: float, w: float, L=0.15):
    return v - w * L / 2, v + w * L / 2                # ${c('sol, sağ (m/s)', 'left, right (m/s)')}`)

export const flaskPy = (l: Lang) => block(l, 'Flask sunucusu: /api/drive ve bekçi', 'Flask server: /api/drive and watchdog', (c) => `from flask import Flask, jsonify, request, abort
import threading, time, os

app = Flask(__name__)
TOKEN = os.environ["ROBOT_TOKEN"]          # ${c('belirteç koda değil ortama', 'token in the environment, not in code')}
state = {"cmd": "stop", "speed": 0.0, "t": 0.0}
lock = threading.Lock()

@app.post("/api/drive")
def drive():
    if request.headers.get("X-Token") != TOKEN:
        abort(401)
    body = request.get_json(silent=True) or {}
    cmd, speed = body.get("cmd"), body.get("speed", 0.5)
    if cmd not in {"forward", "back", "left", "right", "stop"} or not 0 <= speed <= 1:
        return jsonify(error="bad command"), 400
    with lock:
        state.update(cmd=cmd, speed=0 if cmd == "stop" else speed, t=time.monotonic())
    return jsonify(ok=True, **state)

def watchdog():
    while True:                             # ${c('1 s komut gelmezse dur', 'stop if no command for 1 s')}
        with lock:
            if state["cmd"] != "stop" and time.monotonic() - state["t"] > 1.0:
                state.update(cmd="stop", speed=0.0)
        time.sleep(0.1)

threading.Thread(target=watchdog, daemon=True).start()
app.run(host="0.0.0.0", port=5000)          # ${c('yalnız yerel ağda; internete açma', 'local network only; do not expose to the internet')}`)

export const fetchJs = (l: Lang) => block(l, 'Tarayıcı tarafı: basılı tutunca komutu tekrarla', 'Browser side: repeat the command while held', (c) => `// ${c('Bekçi 1 s\'de durdurur; bu yüzden basılıyken her 200 ms\'de yeniden gönder', 'the watchdog stops after 1 s, so resend every 200 ms while held')}
let timer = null
const send = (cmd) => fetch('/api/drive', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'X-Token': localStorage.token },
  body: JSON.stringify({ cmd, speed: Number(speedInput.value) }),
})
function hold(cmd) { send(cmd); timer = setInterval(() => send(cmd), 200) }
function release() { clearInterval(timer); send('stop') }   // ${c('bırakınca hemen dur', 'stop at once on release')}
document.querySelectorAll('[data-cmd]').forEach((b) => {
  b.addEventListener('pointerdown', () => hold(b.dataset.cmd))
  b.addEventListener('pointerup', release)
  b.addEventListener('pointerleave', release)
})`)

export const rosPy = (l: Lang) => block(l, 'rclpy: hedefi izleyen düğüm', 'rclpy: a node that follows the target', (c) => `import rclpy
from rclpy.node import Node
from geometry_msgs.msg import Twist, Point

class Follower(Node):
    def __init__(self):
        super().__init__("follower")
        self.declare_parameter("k_turn", 1.2)                       # ${c('ros2 param set ile değişir', 'change with ros2 param set')}
        self.pub = self.create_publisher(Twist, "/cmd_vel_auto", 10)
        self.create_subscription(Point, "/target", self.on_target, 10)
        self.last = self.get_clock().now()
        self.create_timer(0.1, self.guard)                          # ${c('10 Hz bekçi', '10 Hz watchdog')}

    def on_target(self, p: Point):
        self.last = self.get_clock().now()
        cmd = Twist()
        cmd.linear.x = 0.15 if p.z > 0 else 0.0                    # ${c('z: alan > 0 ise hedef var', 'z: target present if area > 0')}
        cmd.angular.z = -self.get_parameter("k_turn").value * p.x   # ${c('x: -1 sol ... +1 sağ', 'x: -1 left ... +1 right')}
        self.pub.publish(cmd)

    def guard(self):
        if (self.get_clock().now() - self.last).nanoseconds > 5e8:
            self.pub.publish(Twist())                               # ${c('0,5 s hedef yok: dur', 'no target for 0.5 s: stop')}

def main():
    rclpy.init(); rclpy.spin(Follower()); rclpy.shutdown()`)

export const serviceUnit = (l: Lang) => block(l, 'systemd birimi: açılışta başla, çökerse yeniden başla', 'systemd unit: start at boot, restart on crash', (c) => `# /etc/systemd/system/robot.service
[Unit]
Description=Exploration robot
After=network-online.target          # ${c('ağ hazır olunca', 'once the network is up')}
Wants=network-online.target

[Service]
User=pi
WorkingDirectory=/home/pi/robot
Environment=ROBOT_TOKEN=change-me     # ${c('ya da EnvironmentFile=/etc/robot.env', 'or EnvironmentFile=/etc/robot.env')}
ExecStart=/home/pi/robot/.venv/bin/python main.py
Restart=on-failure
RestartSec=2

[Install]
WantedBy=multi-user.target           # ${c('enable bu hedefe bağlar', 'enable links it to this target')}`)

export const capstoneMain = (l: Lang) => block(l, 'main.py iskeleti: durum makinesi + donanım soyutlaması', 'main.py skeleton: state machine + hardware abstraction', (c) => `from enum import Enum, auto
from dataclasses import dataclass

class Mode(Enum):
    IDLE = auto(); TELEOP = auto(); FOLLOW = auto(); SAFE_STOP = auto()

@dataclass
class Inputs:
    web_cmd: str | None       # ${c('Flask panelinden son komut', 'last command from the Flask panel')}
    web_age: float            # ${c('son komuttan bu yana saniye', 'seconds since the last command')}
    target_x: float | None    # ${c('kamera: -1..1, yoksa None', 'camera: -1..1, None if absent')}
    obstacle_cm: float
    battery_v: float

def next_mode(m: Mode, i: Inputs) -> Mode:
    """${c('Saf geçiş fonksiyonu: pytest ile her kenar test edilir', 'pure transition function: every edge is tested with pytest')}"""
    if i.battery_v < 6.4 or i.obstacle_cm < 15:
        return Mode.SAFE_STOP
    if i.web_cmd == "follow":
        return Mode.FOLLOW
    if i.web_cmd and i.web_age < 1.0:
        return Mode.TELEOP
    if m is Mode.FOLLOW and i.target_x is not None:
        return Mode.FOLLOW
    return Mode.IDLE

class Drive:                  # ${c('gerçek: gpiozero Robot; test: sahte sınıf', 'real: gpiozero Robot; test: a fake class')}
    def set(self, left: float, right: float) -> None: ...`)
