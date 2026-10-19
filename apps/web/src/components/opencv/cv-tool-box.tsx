'use client'
// OpenCV dersi araç kutusu: başlık + açıklama (tools.ts) ve aracın kendisi. Görünüm ESOF 323 .rb-sim kutusuyla aynı.
import { CV_TOOL_META, type CvToolId } from '@/lib/opencv/tools'
import { ChannelsTool, ContoursTool, EdgesTool, FilterTool, MorphTool, PointTool, ThresholdTool } from './tools-basic'
import { BgSubTool, ColorTool } from './tools-motion'
import { Camera3DTool } from './tools-3d'
import { FaceCamTool, FeaturesTool, HaarTool, PerspectiveTool, ScannerTool, WarpTool } from './tools-geom'

const TOOLS: Record<CvToolId, (p: { lang: 'tr' | 'en' }) => React.ReactNode> = {
  channels: ChannelsTool, point: PointTool, threshold: ThresholdTool, filter: FilterTool, edges: EdgesTool, morph: MorphTool, contours: ContoursTool,
  color: ColorTool, warp: WarpTool, perspective: PerspectiveTool, camera3d: Camera3DTool, features: FeaturesTool, haar: HaarTool, facecam: FaceCamTool, bgsub: BgSubTool, scanner: ScannerTool,
}

export function CvToolBox({ id, lang, scan }: { id: CvToolId; lang: 'tr' | 'en'; scan?: boolean }) {
  const m = CV_TOOL_META[id][lang]
  const T = TOOLS[id] as (p: { lang: 'tr' | 'en'; scan?: boolean }) => React.ReactNode
  return (
    <section className="rb-sim cv-tool" id={`arac-${id}`} data-testid={`cv-tool-${id}`}>
      <div className="rb-sim-head"><h3>{m.title}</h3><p>{m.desc}</p></div>
      <T lang={lang} scan={scan} />
    </section>
  )
}
