import { addPart, addWire, defaultProps, removePart } from '@/lib/lab/ops'
import type { Circuit, PinRef } from '@/lib/lab/contract'
import { assemblyActuator, assemblyChannel, type AssemblyNode } from '@/lib/mikro/assembly'
import type { WiringPlan } from './wiring'

export const assemblyPartId = (id: string) => `assembly_${id}`
const SIGNAL_PINS = ['D9', 'D10', 'D11', 'D6', 'D5', 'D3', 'D2', 'D4', 'D7', 'D8', 'D12', 'D13']

export function assemblyPin(circuit: Circuit, id: string, pin: string): string | null {
  const boards = new Set(circuit.parts.filter((part) => part.type === 'uno').map((part) => part.id))
  const same = (ref: PinRef) => ref.part === assemblyPartId(id) && ref.pin === pin
  for (const wire of circuit.wires) {
    const other = same(wire.a) ? wire.b : same(wire.b) ? wire.a : null
    if (other && boards.has(other.part) && /^D(?:[0-9]|1[0-3])$/.test(other.pin)) return other.pin
  }
  return null
}

export function syncAssemblyCircuit(nodes: AssemblyNode[], original: Circuit, originalPlan: WiringPlan) {
  let circuit = original
  const wanted = new Set(nodes.filter((node) => node.type === 'servo' || node.type === 'hcsr04').map((node) => assemblyPartId(node.id)))
  const removed = new Set(circuit.parts.filter((part) => /^assembly_asm_\d+$/.test(part.id) && !wanted.has(part.id)).map((part) => part.id))
  for (const id of removed) circuit = removePart(circuit, id)
  let plan: WiringPlan = {
    motors: originalPlan.motors.filter((link) => !removed.has(link.partId)),
    sensors: originalPlan.sensors.filter((link) => !removed.has(link.partId)),
  }
  let board = circuit.parts.find((part) => part.type === 'uno')
  if (!board && (wanted.size || nodes.some((node) => node.type === 'uno'))) {
    const added = addPart(circuit, 'uno', 80, 60)
    circuit = added.circuit
    board = added.part
  }
  if (!board) return { circuit, plan }
  for (const node of nodes) {
    if (node.type !== 'servo' && node.type !== 'hcsr04') continue
    const id = assemblyPartId(node.id)
    if (circuit.parts.some((part) => part.id === id)) continue
    const count = circuit.parts.filter((part) => /^assembly_/.test(part.id)).length
    circuit = { ...circuit, parts: [...circuit.parts, { id, type: node.type, x: 360 + count % 3 * 140, y: 60 + Math.floor(count / 3) * 130, rotation: 0, props: defaultProps(node.type) }] }
    const connect = (pin: string, boardPin: string) => {
      circuit = addWire(circuit, { part: id, pin }, { part: board!.id, pin: boardPin })?.circuit ?? circuit
    }
    connect('VCC', '5V')
    connect('GND', 'GND')
    for (const pin of node.type === 'servo' ? ['SIG'] : ['TRIG', 'ECHO']) {
      const used = new Set(circuit.wires.flatMap((wire) => [wire.a, wire.b]).filter((ref) => ref.part === board!.id).map((ref) => ref.pin))
      const free = SIGNAL_PINS.find((candidate) => !used.has(candidate))
      if (free) connect(pin, free)
    }
    if (node.type === 'servo') {
      plan = { ...plan, motors: [...plan.motors, { actuator: assemblyActuator(node.id), partId: id, kind: 'servo' }] }
    } else {
      plan = { ...plan, sensors: [...plan.sensors, { channel: assemblyChannel(node.id), partId: id, prop: 'distanceCm', scale: 100, min: 2, max: 400 }] }
    }
  }
  return { circuit, plan }
}

export function assemblyConnectionIssues(nodes: AssemblyNode[], circuit: Circuit): string[] {
  return nodes.filter((node) => node.type === 'servo' ? !assemblyPin(circuit, node.id, 'SIG') : node.type === 'hcsr04' && (!assemblyPin(circuit, node.id, 'TRIG') || !assemblyPin(circuit, node.id, 'ECHO'))).map((node) => node.id)
}

export function assemblySketch(nodes: AssemblyNode[], circuit: Circuit): string {
  const servos = nodes.filter((node) => node.type === 'servo').map((node) => ({ id: node.id, pin: assemblyPin(circuit, node.id, 'SIG') })).filter((node) => node.pin)
  const sensors = nodes.filter((node) => node.type === 'hcsr04').map((node) => ({ id: node.id, trigger: assemblyPin(circuit, node.id, 'TRIG'), echo: assemblyPin(circuit, node.id, 'ECHO') })).filter((node) => node.trigger && node.echo)
  const declarations = servos.map((node) => `Servo ${node.id};`)
  const setup = servos.map((node) => `  ${node.id}.attach(${node.pin!.slice(1)});`)
  setup.push(...sensors.flatMap((node) => [`  pinMode(${node.trigger!.slice(1)}, OUTPUT);`, `  pinMode(${node.echo!.slice(1)}, INPUT);`]))
  const readings = sensors.map((node) => `  digitalWrite(${node.trigger!.slice(1)}, LOW);
  delayMicroseconds(2);
  digitalWrite(${node.trigger!.slice(1)}, HIGH);
  delayMicroseconds(10);
  digitalWrite(${node.trigger!.slice(1)}, LOW);
  Serial.println(pulseIn(${node.echo!.slice(1)}, HIGH, 30000) / 58.0);`)
  return `${servos.length ? '#include <Servo.h>\n\n' : ''}${declarations.join('\n')}

void setup() {
  Serial.begin(9600);
${setup.join('\n')}
}

void loop() {
${readings.join('\n')}
${servos.map((node) => `  ${node.id}.write(30);`).join('\n')}
  delay(800);
${servos.map((node) => `  ${node.id}.write(150);`).join('\n')}
  delay(800);
}
`
}
