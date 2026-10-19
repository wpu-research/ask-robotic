'use client'
// PyTorch dersi görselleştirici kutusu: başlık + açıklama (tools.ts) ve görselleştiricinin kendisi.
import { PT_VIZ_META, type PtVizId } from '@/lib/pytorch/tools'
import { AutogradViz, ConvViz, LayersViz, LoaderViz, OptimViz, TensorViz } from './viz-a'
import { Cnn3DViz, Loss3DViz } from './viz-3d'
import { AttentionViz, DeployViz, DigitsViz, FeatureMapsViz, LstmViz, RegulViz, TrainViz } from './viz-b'

const VIZ: Record<PtVizId, (p: { lang: 'tr' | 'en' }) => React.ReactNode> = {
  tensor: TensorViz, autograd: AutogradViz, layers: LayersViz, optim: OptimViz, loss3d: Loss3DViz, cnn3d: Cnn3DViz, train: TrainViz, loader: LoaderViz, conv: ConvViz,
  featuremaps: FeatureMapsViz, regul: RegulViz, lstm: LstmViz, attention: AttentionViz, deploy: DeployViz, digits: DigitsViz,
}

export function PtVizBox({ id, lang }: { id: PtVizId; lang: 'tr' | 'en' }) {
  const m = PT_VIZ_META[id][lang]
  const V = VIZ[id]
  return (
    <section className="rb-sim cv-tool" id={`arac-${id}`} data-testid={`pt-viz-${id}`}>
      <div className="rb-sim-head"><h3>{m.title}</h3><p>{m.desc}</p></div>
      <V lang={lang} />
    </section>
  )
}
