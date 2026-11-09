// ESOF 323 Robotics midterm question bank (weeks 1-7). Generated content, plain TS, no imports.
export interface McqItem { id: string; week: number; q: string; options: string[]; answer: number; why: string }
export interface DefinitionItem { id: string; week: number; term: string; prompt: string; rubric: string[]; points: number }

export const MCQ_BANK: McqItem[] = [
  {
    "id": "m01",
    "week": 1,
    "q": "In the sense, think, act loop, which step do software engineers mostly work on?",
    "options": [
      "Think: deciding which command to send from the sensor data",
      "Sense: converting light or sound into electrical signals",
      "Act: converting electrical energy into motion",
      "Power: regulating the battery voltage for the controller"
    ],
    "answer": 0,
    "why": "The notes state that software engineers mostly live in the middle (think) step, although they must understand the sensors and actuators on either side."
  },
  {
    "id": "m02",
    "week": 1,
    "q": "Which description matches Brooks' subsumption architecture?",
    "options": [
      "A planner that builds a full world model before every single move",
      "A fast reactive layer running underneath a slower planning layer",
      "One PID loop shared by every motor and every sensor of the robot",
      "Layers of simple behaviours in which a higher layer can suppress a lower one"
    ],
    "answer": 3,
    "why": "Subsumption is a reactive layered design; the reactive-plus-planner combination is the hybrid architecture."
  },
  {
    "id": "m03",
    "week": 1,
    "q": "A two-sensor line follower runs this code. The left IR module reads LOW and the right reads HIGH (LOW means line detected). Which call is executed?\n\nbool l = digitalRead(L_IR) == LOW;\nbool r = digitalRead(R_IR) == LOW;\nif (l && r)  drive(150, 150);\nelse if (l)  drive(0, 150);\nelse if (r)  drive(150, 0);\nelse         drive(0, 0);",
    "options": [
      "drive(150, 150)",
      "drive(150, 0)",
      "drive(0, 150)",
      "drive(0, 0)"
    ],
    "answer": 2,
    "why": "Only l is true, so the second branch runs: the left wheel stops and the right wheel drives, turning the robot left."
  },
  {
    "id": "m04",
    "week": 1,
    "q": "A robot drives at v = 0.5 m/s and meets the line at 30 degrees to its heading. The loop contains delay(100), so T = 100 ms. By how much does the line move sideways relative to the robot between two samples (delta y = v sin(theta) T)?",
    "options": [
      "50 mm",
      "25 mm",
      "12.5 mm",
      "43 mm"
    ],
    "answer": 1,
    "why": "0.5 x sin 30 degrees x 0.1 = 0.025 m = 25 mm, more than the 19 mm tape width, so a crossing can be missed entirely. 43 mm comes from wrongly using cosine."
  },
  {
    "id": "m05",
    "week": 1,
    "q": "An IR line sensor uses hysteresis: it switches to black above 600 and back to white only below 500 (analogRead units). The output is currently black and the reading drops to 550. What is the output?",
    "options": [
      "White, because 550 is below the upper threshold of 600",
      "Black, because it returns to white only below 500",
      "It flickers between black and white on every sample",
      "Undefined until the sensor has been calibrated again"
    ],
    "answer": 1,
    "why": "Between the two thresholds the output keeps its previous state, which is exactly what stops flicker at the tape edge."
  },
  {
    "id": "m06",
    "week": 1,
    "q": "Why does the zig-zag amplitude of a bang-bang line follower grow with speed?",
    "options": [
      "The output has only a few fixed values, so overshoot grows with speed and actuator delay",
      "The IR sensors become noisier in proportion to the wheel speed",
      "The motor driver loses more voltage at higher speeds",
      "The loop period gets longer whenever the motors run faster"
    ],
    "answer": 0,
    "why": "With only left/straight/right commands and motors that need tens of milliseconds to react, the robot overshoots further the faster it moves."
  },
  {
    "id": "m07",
    "week": 2,
    "q": "Which line correctly describes the Arduino Uno (ATmega328P)?",
    "options": [
      "16 MHz clock, 2 KB flash, 32 KB RAM",
      "16 MHz clock, 32 KB flash, 32 KB RAM",
      "240 MHz clock, 32 KB flash, 2 KB RAM",
      "16 MHz clock, 32 KB flash, 2 KB RAM"
    ],
    "answer": 3,
    "why": "The Uno has 32 KB of flash for the program but only 2 KB of SRAM, which is why RAM is the scarce resource."
  },
  {
    "id": "m08",
    "week": 2,
    "q": "What is the main problem with delay(1000) in a robot's loop()?",
    "options": [
      "It makes millis() stop counting during the delay",
      "It disables PWM output on pins 5 and 6",
      "The whole robot freezes for a second and cannot read sensors or react",
      "It lets the 10-bit ADC return stale values afterwards"
    ],
    "answer": 2,
    "why": "delay() blocks the single loop, so no sensing or reacting happens; millis() keeps counting and PWM keeps running."
  },
  {
    "id": "m09",
    "week": 2,
    "q": "On a 5 V Uno, analogRead returns 614. What is the voltage at the pin (raw x 5 / 1023)?",
    "options": [
      "About 2.5 V",
      "About 3.7 V",
      "About 3.0 V",
      "About 1.2 V"
    ],
    "answer": 2,
    "why": "614 x 5 / 1023 = 3.0 V; 2.5 V would correspond to a raw value of about 512."
  },
  {
    "id": "m10",
    "week": 2,
    "q": "A 2S LiPo is fully charged at 8.4 V and measured through a divider with R1 = 20 kOhm on top and R2 = 10 kOhm to ground. What voltage does the analog pin see?",
    "options": [
      "4.2 V",
      "2.8 V",
      "5.6 V",
      "1.4 V"
    ],
    "answer": 1,
    "why": "V = 8.4 x 10 / 30 = 2.8 V, safely below 5 V; 5.6 V would be the voltage across R1."
  },
  {
    "id": "m11",
    "week": 2,
    "q": "A sketch sends debug text over Serial at 9600 baud with 10 bits per byte (start, 8 data, stop). What is the maximum throughput?",
    "options": [
      "960 bytes per second",
      "9600 bytes per second",
      "1200 bytes per second",
      "96 bytes per second"
    ],
    "answer": 0,
    "why": "9600 bits/s divided by 10 bits per byte = 960 bytes/s; beyond that the 64-byte buffer fills and Serial.print blocks."
  },
  {
    "id": "m12",
    "week": 2,
    "q": "A timer uses unsigned long last = 4294967000UL with a period of 1000 ms. The code is 100 ms later, so millis() = 4294967100, before the 32-bit wrap. Which statement is true?",
    "options": [
      "millis() - last >= period is true while millis() >= last + period is false",
      "Both tests are false, which is the correct answer for 100 ms elapsed",
      "Both tests are true because the counter is close to its wrap",
      "millis() >= last + period is true because last + period overflowed, a false trigger; millis() - last >= period is false"
    ],
    "answer": 3,
    "why": "last + period wraps to 704, so the addition form fires at once; unsigned subtraction gives 100, so the subtraction form is correct."
  },
  {
    "id": "m13",
    "week": 3,
    "q": "Which action is appropriate inside an interrupt service routine?",
    "options": [
      "Calling Serial.print with the value",
      "Calling delay(5) to debounce the edge",
      "Waiting in a while loop for the next byte",
      "Incrementing a volatile counter"
    ],
    "answer": 3,
    "why": "ISRs must be tiny: set a flag or count; printing, delaying and waiting are not allowed."
  },
  {
    "id": "m14",
    "week": 3,
    "q": "Why must a variable shared between an ISR and loop() be declared volatile?",
    "options": [
      "It makes multi-byte reads atomic so no torn value can occur",
      "It moves the variable from RAM into flash to save memory",
      "The compiler must re-read it from memory instead of keeping a stale copy in a register",
      "It lets the ISR run faster than the main program"
    ],
    "answer": 2,
    "why": "volatile prevents caching in registers; it does not make multi-byte accesses atomic, which still needs interrupts to be disabled briefly."
  },
  {
    "id": "m15",
    "week": 3,
    "q": "A motor has 7 encoder pulses per motor revolution and a 50:1 gearbox (50 motor revolutions per wheel revolution). Decoding both edges of both channels (x4), how many counts per wheel revolution?",
    "options": [
      "350",
      "1400",
      "700",
      "2800"
    ],
    "answer": 1,
    "why": "N = 7 x 4 x 50 = 1400; 700 would be x2 decoding and 350 x1."
  },
  {
    "id": "m16",
    "week": 3,
    "q": "Timer1 of the ATmega328P is used in CTC mode at 16 MHz with prescaler 64 to fire a 100 Hz interrupt. Which OCR1A value is needed?",
    "options": [
      "2499",
      "2500",
      "1249",
      "4999"
    ],
    "answer": 0,
    "why": "OCR1A = 16 000 000 / (64 x 100) - 1 = 2499; the minus one is needed because the counter also counts zero."
  },
  {
    "id": "m17",
    "week": 3,
    "q": "An MPU6050 read transfers address+write, register address, repeated-start address+read, then 6 data bytes. With 9 clock cycles per byte, how long does it take at 400 kHz?",
    "options": [
      "About 0.20 ms (81 clocks)",
      "About 0.81 ms (81 clocks)",
      "About 0.14 ms (54 clocks)",
      "About 0.27 ms (108 clocks)"
    ],
    "answer": 0,
    "why": "3 x 9 + 6 x 9 = 81 clocks; 81 / 400 000 = 0.2 ms, whereas at 100 kHz the same read would take 0.81 ms."
  },
  {
    "id": "m18",
    "week": 3,
    "q": "On a CAN bus node A starts to transmit a frame with ID 0x120 and node B one with ID 0x0A0 at the same instant. What happens?",
    "options": [
      "A wins arbitration because a larger identifier means a higher priority",
      "Both frames collide and are destroyed; both nodes retransmit",
      "The node with the shorter data field is granted the bus",
      "B wins arbitration and its frame passes undamaged; A retries afterwards"
    ],
    "answer": 3,
    "why": "The lower identifier is the higher priority and wins bitwise arbitration without corrupting the bus."
  },
  {
    "id": "m19",
    "week": 4,
    "q": "Which of these sensors is proprioceptive, measuring the robot itself rather than the world?",
    "options": [
      "An HC-SR04 ultrasonic module",
      "A camera",
      "A wheel encoder",
      "A TF-Luna LiDAR"
    ],
    "answer": 2,
    "why": "Encoders, IMUs and battery voltage describe the robot's own state; distance sensors, cameras and LiDAR measure the environment."
  },
  {
    "id": "m20",
    "week": 4,
    "q": "Which pair correctly characterises the IMU sensors?",
    "options": [
      "Gyroscope: noisy but without drift; accelerometer: smooth but drifts",
      "Gyroscope: smooth but its integrated angle drifts; accelerometer: noisy",
      "Gyroscope: measures gravity; accelerometer: measures angular rate",
      "Both are smooth and drift only when the robot vibrates"
    ],
    "answer": 1,
    "why": "That complementary behaviour is why the complementary filter blends the two."
  },
  {
    "id": "m21",
    "week": 4,
    "q": "An HC-SR04 reports an echo time of 5800 microseconds. Using d = 0.0343 x t / 2 cm, what is the distance?",
    "options": [
      "About 199 cm",
      "About 99.5 cm",
      "About 49.7 cm",
      "About 9.95 cm"
    ],
    "answer": 1,
    "why": "0.0343 x 5800 / 2 = 99.5 cm; forgetting to halve the round trip gives 199 cm."
  },
  {
    "id": "m22",
    "week": 4,
    "q": "An EMA filter with alpha = 0.2 has a previous output of 100 and receives a new sample of 110. What is the new output?",
    "options": [
      "102",
      "108",
      "105",
      "110"
    ],
    "answer": 0,
    "why": "y = 0.2 x 110 + 0.8 x 100 = 102; 108 results from swapping alpha and 1 - alpha."
  },
  {
    "id": "m23",
    "week": 4,
    "q": "A moving average with N = 21 points runs at 50 Hz. By how much does it delay the signal ((N - 1) / 2 samples)?",
    "options": [
      "400 ms",
      "420 ms",
      "100 ms",
      "200 ms"
    ],
    "answer": 3,
    "why": "(21 - 1) / 2 = 10 samples at 20 ms each = 200 ms."
  },
  {
    "id": "m24",
    "week": 4,
    "q": "A 1D Kalman filter has estimate x = 50, uncertainty P = 4, process noise Q = 2 and measurement noise R = 6. A reading z = 58 arrives. What is the updated estimate?",
    "options": [
      "53.2",
      "52",
      "54",
      "56"
    ],
    "answer": 2,
    "why": "P- = 4 + 2 = 6, K = 6 / (6 + 6) = 0.5, x = 50 + 0.5 x 8 = 54; skipping the predict step (K = 0.4) gives 53.2."
  },
  {
    "id": "m25",
    "week": 5,
    "q": "A motor is powered from its own supply through a driver, with logic from the Uno. Which connection is essential?",
    "options": [
      "The motor supply positive wired to the Uno 5 V pin",
      "The two supplies connected in series",
      "A common ground between motor supply, driver and Uno",
      "A flyback diode across the logic pins"
    ],
    "answer": 2,
    "why": "Without a shared ground the logic signals have no reference; feeding motors from the Uno 5 V pin causes brown-outs."
  },
  {
    "id": "m26",
    "week": 5,
    "q": "Which control signal does a hobby servo expect?",
    "options": [
      "490 Hz with a pulse of 1 to 2 ms setting the speed",
      "50 Hz with a pulse of 1 to 2 ms setting the angle",
      "50 Hz with a pulse of 10 to 20 ms setting the angle",
      "20 kHz with a duty cycle setting the angle"
    ],
    "answer": 1,
    "why": "A servo reads the pulse width inside a 20 ms frame: 1 ms to 2 ms maps to 0 to 180 degrees."
  },
  {
    "id": "m27",
    "week": 5,
    "q": "With an ideal driver on a 12 V supply, a program calls analogWrite(pin, 64). What is the average motor voltage?",
    "options": [
      "About 3.0 V",
      "About 6.0 V",
      "About 0.75 V",
      "About 4.8 V"
    ],
    "answer": 0,
    "why": "D = 64 / 255, about 25%, so Vavg = 0.25 x 12 = 3 V."
  },
  {
    "id": "m28",
    "week": 5,
    "q": "An L298N loses about 2 V. It drives a motor from a 12 V supply at 75% duty. What average voltage reaches the motor?",
    "options": [
      "About 9.0 V",
      "About 6.0 V",
      "About 10.0 V",
      "About 7.5 V"
    ],
    "answer": 3,
    "why": "Vavg = D x (Vs - 2 V) = 0.75 x 10 = 7.5 V; 9 V is the ideal-driver figure."
  },
  {
    "id": "m29",
    "week": 5,
    "q": "A stepper has 200 steps per revolution, 1/8 microstepping and a belt moving 40 mm per revolution. How many step pulses per second are needed for 50 mm/s?",
    "options": [
      "1000",
      "8000",
      "250",
      "2000"
    ],
    "answer": 3,
    "why": "1600 microsteps per revolution / 40 mm = 40 microsteps/mm; 40 x 50 = 2000 pulses per second."
  },
  {
    "id": "m30",
    "week": 5,
    "q": "A stepper-driven axis meets a sudden load spike during a fast move without any position feedback. What is the likely result?",
    "options": [
      "The driver raises a fault and stops the motor automatically",
      "The motor catches up on the following pulses because the driver tracks the count",
      "It loses steps silently and the position error stays; a speed ramp prevents this",
      "Only the speed drops; the final position stays exact"
    ],
    "answer": 2,
    "why": "A stepper is open-loop, so missed steps are not noticed; accelerating gradually keeps torque within limits."
  },
  {
    "id": "m31",
    "week": 6,
    "q": "Which PID term is the one that drives steady-state error to zero for a constant load?",
    "options": [
      "Proportional",
      "Integral",
      "Derivative",
      "Derivative on measurement"
    ],
    "answer": 1,
    "why": "A proportional term always leaves a residual error; only integral action removes it."
  },
  {
    "id": "m32",
    "week": 6,
    "q": "Why is the derivative computed on the measurement (-dy/dt) rather than on the error?",
    "options": [
      "So a jump in the setpoint does not cause a huge derivative spike",
      "So that the derivative term no longer amplifies sensor noise",
      "So that the integral term can stop winding up",
      "So that the loop period no longer has to be fixed"
    ],
    "answer": 0,
    "why": "Differentiating the error turns a setpoint step into a spike (derivative kick); noise is handled separately by filtering."
  },
  {
    "id": "m33",
    "week": 6,
    "q": "A first-order wheel plant has gain K = 3 and uses P-only control with Kp = 2. What is the steady-state error (ess = 1 / (1 + K Kp)) for a step?",
    "options": [
      "About 14%",
      "About 17%",
      "About 33%",
      "About 7%"
    ],
    "answer": 0,
    "why": "1 / (1 + 6) = 14.3%; 17% would come from using 1 / (K Kp)."
  },
  {
    "id": "m34",
    "week": 6,
    "q": "P-only control starts sustained oscillation at Ku = 3.0 with period Tu = 0.8 s. Using Ziegler-Nichols (Kp = 0.6 Ku, Ti = Tu / 2), what is the parallel-form Ki = Kp / Ti?",
    "options": [
      "2.25 per second",
      "9.0 per second",
      "0.72 per second",
      "4.5 per second"
    ],
    "answer": 3,
    "why": "Kp = 1.8 and Ti = 0.4 s, so Ki = 1.8 / 0.4 = 4.5 per second."
  },
  {
    "id": "m35",
    "week": 6,
    "q": "Given the class below with kp = 1, ki = 0, kd = 2, the calls are update(10, 4, 0.1) followed by update(10, 5, 0.1). What does the second call return?\n\ne = setpoint - y\nd = 0 if first call else -(y - prev_y) / dt\nu = kp*e + ki*(i + e*dt) + kd*d   (clamped to +-255)",
    "options": [
      "25",
      "5",
      "-15",
      "0"
    ],
    "answer": 2,
    "why": "Second call: e = 5, d = -(5 - 4) / 0.1 = -10, so u = 5 + 2 x (-10) = -15; the derivative on measurement opposes a rising output."
  },
  {
    "id": "m36",
    "week": 6,
    "q": "A motor output is saturated at its maximum for 2 s while the error stays positive, and the controller has no anti-windup. What happens when the measurement finally reaches the setpoint?",
    "options": [
      "The output drops to zero immediately because the error is zero",
      "The stored integral keeps the output saturated, causing a large overshoot before it unwinds",
      "The derivative term cancels the integral and the response is smooth",
      "The controller switches to open-loop mode automatically"
    ],
    "answer": 1,
    "why": "Without anti-windup the integral kept growing during saturation and must be unwound by negative error, so overshoot results."
  },
  {
    "id": "m37",
    "week": 7,
    "q": "A differential drive robot has equal speeds on both wheels. Which statement is correct?",
    "options": [
      "It spins in place with R = 0",
      "It drives straight, and the radius of curvature is infinite",
      "It turns about the left wheel",
      "It drives straight, but omega equals v / L"
    ],
    "answer": 1,
    "why": "Equal speeds give omega = 0 and therefore R = v / omega is infinite."
  },
  {
    "id": "m38",
    "week": 7,
    "q": "Why is a differential drive robot called non-holonomic?",
    "options": [
      "It cannot move sideways directly",
      "It has no encoders to measure heading",
      "Its wheels cannot turn independently",
      "It needs three wheels to hold its balance"
    ],
    "answer": 0,
    "why": "Non-holonomic means constrained motion: no instantaneous sideways movement, unlike mecanum or omni wheels."
  },
  {
    "id": "m39",
    "week": 7,
    "q": "A differential drive robot with wheel base L = 0.4 m has vR = 0.6 m/s and vL = 0.2 m/s. What is its angular velocity omega = (vR - vL) / L?",
    "options": [
      "2.0 rad/s",
      "0.4 rad/s",
      "0.1 rad/s",
      "1.0 rad/s"
    ],
    "answer": 3,
    "why": "(0.6 - 0.2) / 0.4 = 1.0 rad/s; the forward speed v = 0.4 m/s is a different quantity."
  },
  {
    "id": "m40",
    "week": 7,
    "q": "A planner commands v = 0.3 m/s and omega = 1.0 rad/s on a robot with wheel base L = 0.2 m. Which wheel speeds result (vR = v + omega L / 2, vL = v - omega L / 2)?",
    "options": [
      "vL = 0.4 m/s, vR = 0.2 m/s",
      "vL = 0.1 m/s, vR = 0.5 m/s",
      "vL = 0.2 m/s, vR = 0.4 m/s",
      "vL = 0.3 m/s, vR = 0.4 m/s"
    ],
    "answer": 2,
    "why": "The offset is omega L / 2 = 0.1, so vR = 0.4 and vL = 0.2; positive omega means a left turn."
  },
  {
    "id": "m41",
    "week": 7,
    "q": "A planar two-link arm has l1 = 0.4 m, l2 = 0.3 m, theta1 = 90 degrees and theta2 = -90 degrees. Where is the gripper (x, y)?",
    "options": [
      "(0.4, 0.3)",
      "(0.7, 0.0)",
      "(0.3, 0.4)",
      "(0.0, 0.7)"
    ],
    "answer": 2,
    "why": "x = 0.4 cos 90 + 0.3 cos 0 = 0.3 and y = 0.4 sin 90 + 0.3 sin 0 = 0.4."
  },
  {
    "id": "m42",
    "week": 7,
    "q": "An arm has l1 = 0.5 m and l2 = 0.3 m. Which target has no inverse kinematics solution?",
    "options": [
      "(0.6, 0.3) m",
      "(0.1, 0.1) m",
      "(0.8, 0.0) m",
      "(0.0, 0.5) m"
    ],
    "answer": 1,
    "why": "Reachable radii satisfy 0.2 <= r <= 0.8; (0.1, 0.1) has r = 0.14 m, inside the inner hole of the workspace ring."
  }
];

export const DEFINITION_BANK: DefinitionItem[] = [
  {
    "id": "d01",
    "week": 1,
    "term": "Sense-think-act loop",
    "prompt": "Define the sense-think-act loop. Using a two-sensor line follower as your example, state what happens in each of the three steps and why the loop must repeat many times per second.",
    "rubric": [
      "Names the three steps and defines them: sense = measure the environment, think = decide, act = drive actuators",
      "Repeats continuously at a high rate so the robot can react to changes",
      "Maps the example correctly: IR sensors, the left/right/straight/lost decision rule, motors",
      "Notes that the decision step alone is reactive and can be separated in code for testing"
    ],
    "points": 10
  },
  {
    "id": "d02",
    "week": 2,
    "term": "Finite state machine",
    "prompt": "Define a finite state machine (FSM) and explain why it suits robot behaviour. Give a robotics example with at least three states, and distinguish an entry action from an action performed on every pass.",
    "rubric": [
      "Defines states, the action in each state, and events or guards that cause transitions",
      "Gives a valid robot example with at least three states and named transitions",
      "Explains entry action (runs once on entering a state) versus during action (every loop pass)",
      "Mentions a benefit such as readability, testability, or a fault state reachable from all states"
    ],
    "points": 10
  },
  {
    "id": "d03",
    "week": 3,
    "term": "Interrupt and ISR",
    "prompt": "Define an interrupt and an interrupt service routine (ISR). Describe three rules for writing a safe ISR, explain why a shared variable must be volatile, and give one robotics use case.",
    "rubric": [
      "Defines the interrupt as a hardware event that pauses the main program and runs a short ISR",
      "States rules: keep it tiny, no delay() or Serial.print(), set a flag or count only",
      "Explains volatile (the compiler must re-read the variable) and the atomic copy for multi-byte values",
      "Gives a valid use case such as counting wheel encoder ticks"
    ],
    "points": 10
  },
  {
    "id": "d04",
    "week": 4,
    "term": "Sensor filtering and EMA",
    "prompt": "Explain why sensor readings are filtered. Define the exponential moving average (EMA) with its formula, describe the effect of the coefficient alpha, and give a robotics example.",
    "rubric": [
      "States that measurement = true value + noise and that filtering reduces random noise",
      "Writes y_k = alpha x_k + (1 - alpha) y_(k-1) correctly",
      "Explains the trade-off: small alpha smooths more but adds lag, large alpha reacts faster but is noisier",
      "Gives an example such as an HC-SR04 distance and notes that filters cannot remove systematic error"
    ],
    "points": 10
  },
  {
    "id": "d05",
    "week": 5,
    "term": "PWM and H-bridge",
    "prompt": "Define PWM duty cycle and the average-voltage relationship. Then explain how an H-bridge allows a DC motor to be driven in both directions, with a robotics example.",
    "rubric": [
      "Defines duty cycle as the fraction of time the signal is on and writes Vavg = D x Vsupply",
      "Explains that PWM controls speed by switching the supply on and off quickly",
      "Describes the H-bridge: four switches reversing current direction, with direction and PWM pins",
      "Gives an example such as an L298N or TB6612FNG driving a wheel, optionally noting its voltage drop"
    ],
    "points": 10
  },
  {
    "id": "d06",
    "week": 6,
    "term": "PID controller terms",
    "prompt": "Define closed-loop (feedback) control and explain the role of the proportional, integral and derivative terms. Describe one practical problem (windup or derivative kick) and how to avoid it.",
    "rubric": [
      "Defines feedback control with error e = r - y and continuous correction",
      "Explains P (proportional to error), I (accumulated error, removes steady-state error) and D (damping)",
      "Describes one problem correctly: windup (integral grows during saturation) or derivative kick (setpoint jump)",
      "Gives a valid remedy and a robotics example such as wheel speed or line-following steering"
    ],
    "points": 10
  },
  {
    "id": "d07",
    "week": 7,
    "term": "Odometry and drift",
    "prompt": "Define odometry for a differential drive robot. Explain how pose is updated from the wheel travel of the left and right wheels, and why the estimate drifts over time.",
    "rubric": [
      "Defines odometry as estimating pose by integrating encoder readings",
      "Gives the update ideas: ds = (dR + dL) / 2 and dtheta = (dR - dL) / L with the pose update",
      "Explains drift: small systematic errors (wheel radii, wheel base, slip) accumulate, especially in heading",
      "Mentions the remedy of external references or localization, or calibration such as the UMBmark test"
    ],
    "points": 10
  },
  {
    "id": "d08",
    "week": 7,
    "term": "Forward kinematics",
    "prompt": "Define forward kinematics for a robot arm. Write the equations for a planar two-link arm, state what each symbol means, and contrast forward kinematics with inverse kinematics.",
    "rubric": [
      "Defines FK as computing the end-effector position from joint angles",
      "Writes x = l1 cos(theta1) + l2 cos(theta1 + theta2) and y = l1 sin(theta1) + l2 sin(theta1 + theta2)",
      "Defines the symbols: link lengths l1, l2 and joint angles theta1, theta2",
      "Contrasts with IK: target to angles, possibly two solutions or none outside the workspace"
    ],
    "points": 10
  }
];
