import { ASSEMBLY_PARTS, assemblyActuator, assemblyChannel, isAssembly, type AssemblyNode } from './assembly'

const number = (value: number) => Number(value.toFixed(6)).toString()
const vector = (values: number[]) => values.map(number).join(' ')
const radians = (degrees: number) => degrees * Math.PI / 180

export function assemblyToMjcf(nodes: AssemblyNode[]) {
  if (!isAssembly(nodes)) throw new Error('Geçersiz montaj ağacı / Invalid assembly tree')
  const actuators: string[] = []
  const controls: string[] = []
  const sensors: string[] = []
  const channels: string[] = []
  function render(node: AssemblyNode): string {
    const { id, type } = node
    const geometry = (suffix: string, attributes: string) => `<geom name="${id}_${suffix}" contype="2" conaffinity="1" ${attributes}/>`
    const box = (suffix: string, size: number[], pos: number[], color: string, mass: number) => geometry(suffix, `type="box" size="${vector(size)}" pos="${vector(pos)}" rgba="${color} 1" mass="${number(mass)}"`)
    const cylinder = (suffix: string, radius: number, half: number, pos: number[], color: string, mass: number, quat = '1 0 0 0') => geometry(suffix, `type="cylinder" size="${number(radius)} ${number(half)}" pos="${vector(pos)}" quat="${quat}" rgba="${color} 1" mass="${number(mass)}"`)
    const shapes: string[] = []
    if (type === 'servo') {
      shapes.push(box('case', [0.012, 0.006, 0.012], [0, 0, 0.012], '.12 .28 .62', 0.009))
      shapes.push(box('tabs', [0.016, 0.006, 0.001], [0, 0, 0.02], '.15 .32 .68', 0.001))
    } else if (type === 'platform') {
      shapes.push(box('plate', [0.026, 0.018, 0.002], [0, 0, 0.002], '.68 .44 .25', 0.012))
      for (const side of [-1, 1]) shapes.push(cylinder(`bolt_${side === 1 ? 'l' : 'r'}`, 0.002, 0.001, [0, side * 0.012, 0.005], '.65 .68 .72', 0.0005))
    } else if (type === 'uno') {
      shapes.push(box('uno_board', [0.034, 0.026, 0.004], [0, 0, 0.004], '.06 .42 .48', 0.025))
    } else if (type === 'esp32') {
      shapes.push(box('esp32_board', [0.026, 0.014, 0.004], [0, 0, 0.004], '.08 .09 .10', 0.012))
    } else if (type === 'hcsr04') {
      shapes.push(box('pcb', [0.022, 0.001, 0.009], [0, 0, 0.01], '.06 .36 .48', 0.004))
      for (const side of [-1, 1]) shapes.push(cylinder(`eye_${side === 1 ? 'l' : 'r'}`, 0.007, 0.006, [side * 0.012, -0.006, 0.01], '.72 .75 .78', 0.002, '.707107 .707107 0 0'))
      const channel = assemblyChannel(id)
      shapes.push(`<site name="${id}_ray" pos="0 -.013 .01" zaxis="0 -1 0" size=".001"/>`)
      sensors.push(`<rangefinder name="${channel}" site="${id}_ray" cutoff="4"/>`)
      channels.push(channel)
    }
    const children = nodes.filter((candidate) => candidate.parent === id)
    let joint = ''
    let horn = ''
    if (type === 'servo') {
      const name = assemblyActuator(id)
      const range = vector(node.limits.map(radians))
      const axis = node.axis === 'x' ? '1 0 0' : node.axis === 'y' ? '0 1 0' : '0 0 1'
      joint = `<joint name="${id}_joint" type="hinge" axis="${axis}" limited="true" range="${range}" damping=".02" armature=".0001"/>`
      horn = cylinder('hub', 0.004, 0.002, [0, 0, 0], '.92 .91 .86', 0.001) + box('horn', [0.013, 0.003, 0.001], [0.008, 0, 0.002], '.92 .91 .86', 0.001)
      controls.push(`<position name="${name}" joint="${id}_joint" kp="2" kv=".08" ctrllimited="true" ctrlrange="${range}" forcelimited="true" forcerange="-.25 .25"/>`)
      actuators.push(name)
      sensors.push(`<jointpos name="${id}_angle" joint="${id}_joint"/>`)
      channels.push(`${id}_angle`)
    }
    const yaw = radians(node.yaw) / 2
    return `<body name="${id}" pos="${vector(node.pos)}" quat="${number(Math.cos(yaw))} 0 0 ${number(Math.sin(yaw))}">
      ${shapes.join('\n')}
      <body name="${id}_mount" pos="0 0 ${number(ASSEMBLY_PARTS[type].mountZ)}">
        ${joint}${horn}${children.map(render).join('\n')}
      </body>
    </body>`
  }
  const bodies = nodes.filter((node) => node.parent === null).map(render).join('\n')
  return { bodies, controls, sensors, actuators, channels }
}
