// LLM dersi üniteleri 1–5 kod örnekleri. Kod iki dilde aynıdır; yalnız yorumlar ve metinler çevrilir (satır sayısı eşit).
// Gerçek API örnekleri Anthropic Python SDK ile; anahtar ANTHROPIC_API_KEY ortam değişkeninden okunur, koda yazılmaz.
import type { CodeBlock } from '@/lib/robotik/course'
import type { Lang } from './course'

const pick = (lang: Lang) => (tr: string, en: string) => (lang === 'en' ? en : tr)

/** Ünite 1: token sayma ve bağlam bütçesi (Python, Anthropic SDK). */
export const countTokensPy = (lang: Lang): CodeBlock => {
  const t = pick(lang)
  return {
    title: t('Python: token say, bağlam bütçesini kontrol et, sonra iste', 'Python: count tokens, check the context budget, then ask'),
    src: `import anthropic

# ${t('Anahtar ANTHROPIC_API_KEY ortam değişkeninden okunur; koda asla yazma.', 'The key is read from the ANTHROPIC_API_KEY environment variable; never put it in code.')}
client = anthropic.Anthropic()
MODEL = "claude-sonnet-5-5"

notes = open("ders_notlari.txt", encoding="utf-8").read()
messages = [{"role": "user", "content": f"<notlar>{notes}</notlar>\\n${t('Bu notları beş maddede özetle.', 'Summarise these notes in five bullet points.')}"}]

# ${t('1) İstek göndermeden önce giriş tokenlarını say', '1) Count the input tokens before sending the request')}
count = client.messages.count_tokens(model=MODEL, messages=messages)
print("${t('giriş tokenı', 'input tokens')}:", count.input_tokens)

BUDGET = 50_000  # ${t('bu uygulama için kendi koyduğumuz üst sınır', 'our own ceiling for this application')}
if count.input_tokens > BUDGET:
    raise SystemExit("${t('Notlar çok uzun: önce parçala ya da özetle.', 'Notes are too long: chunk or summarise them first.')}")

# ${t('2) İsteği gönder; max_tokens çıkış için ayrılan tavandır', '2) Send the request; max_tokens is the ceiling reserved for output')}
response = client.messages.create(model=MODEL, max_tokens=1024, messages=messages)
for block in response.content:
    if block.type == "text":
        print(block.text)

# ${t('3) Faturayı belirleyen sayılar yanıtın usage alanında', '3) The numbers that set the bill are in the usage field of the response')}
print(response.usage.input_tokens, response.usage.output_tokens, response.stop_reason)`,
  }
}

/** Ünite 1: bir BPE birleştirme adımı (JavaScript, saf mantık). */
export const bpeStepJs = (lang: Lang): CodeBlock => {
  const t = pick(lang)
  return {
    title: t('JavaScript: bir BPE birleştirme adımı (Node\'da çalışır)', 'JavaScript: one BPE merge step (runs in Node)'),
    src: `// ${t('Her kelime harflerine bölünmüş bir dizi; sonuna kelime sonu işareti eklenir', 'Each word is an array of characters with an end-of-word marker')}
const words = ['robot', 'robotik', 'roket', 'rota'].map((w) => [...w, '</w>'])

function mostFrequentPair(words) {
  const counts = new Map()
  for (const w of words)
    for (let i = 0; i < w.length - 1; i++) {
      const key = w[i] + ' ' + w[i + 1]
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }
  // ${t('En sık çift; eşitlikte ilk görülen kazanır (deterministik)', 'Most frequent pair; on a tie the first seen wins (deterministic)')}
  return [...counts].reduce((best, cur) => (cur[1] > best[1] ? cur : best))
}

function merge(words, [a, b]) {
  return words.map((w) => {
    const out = []
    for (let i = 0; i < w.length; i++) {
      if (w[i] === a && w[i + 1] === b) { out.push(a + b); i++ } else out.push(w[i])
    }
    return out
  })
}

let current = words
for (let step = 1; step <= 4; step++) {
  const [pair, n] = mostFrequentPair(current)
  current = merge(current, pair.split(' '))
  console.log(\`\${step}. \${pair} -> \${pair.replace(' ', '')} (\${n}x)\`, current.map((w) => w.join('|')))
}`,
  }
}

/** Ünite 2: yerel gömme modeliyle anlamsal arama (Python). */
export const embedPy = (lang: Lang): CodeBlock => {
  const t = pick(lang)
  return {
    title: t('Python: yerel bir gömme modeliyle anlamsal arama', 'Python: semantic search with a local embedding model'),
    src: `# ${t('Anthropic gömme uç noktası sunmaz; burada açık kaynak, çok dilli bir model yerelde çalışır.', 'Anthropic offers no embeddings endpoint; here an open-source multilingual model runs locally.')}
# pip install sentence-transformers numpy
import numpy as np
from sentence_transformers import SentenceTransformer

model = SentenceTransformer("sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2")

sentences = [
    "${t('LiPo hücre 3,0 V altına indirilmemelidir.', 'A LiPo cell must not go below 3.0 V.')}",
    "${t('I2C hattında SDA veri, SCL saat hattıdır.', 'On the I2C bus SDA is data and SCL is the clock.')}",
    "${t('PID denetleyicide türev terim aşımı azaltır.', 'In a PID controller the derivative term reduces overshoot.')}",
    "${t('Dönem projesi 12. haftanın cuma günü teslim edilir.', 'The term project is due on Friday of week 12.')}",
]
# ${t('normalize_embeddings=True: her vektörün boyu 1, kosinüs = iç çarpım', 'normalize_embeddings=True: every vector has length 1, cosine = dot product')}
E = model.encode(sentences, normalize_embeddings=True)

def search(query, k=2):
    q = model.encode([query], normalize_embeddings=True)[0]
    scores = E @ q
    order = np.argsort(-scores)[:k]
    return [(round(float(scores[i]), 3), sentences[i]) for i in order]

print(search("${t('Batarya kaç volta kadar boşaltılabilir?', 'How far can the battery be discharged?')}"))
print(search("${t('Proje teslim tarihi ne?', 'When is the project due?')}"))`,
  }
}

/** Ünite 2: kosinüs benzerliği ve en yakın komşular (JavaScript). */
export const cosineJs = (lang: Lang): CodeBlock => {
  const t = pick(lang)
  return {
    title: t('JavaScript: kosinüs benzerliği ve en yakın komşular', 'JavaScript: cosine similarity and nearest neighbours'),
    src: `const dot = (a, b) => a.reduce((s, x, i) => s + x * b[i], 0)
const norm = (a) => Math.sqrt(dot(a, a))
// ${t('Kosinüs: yönlere bakar, boya bakmaz; -1 ile 1 arasında', 'Cosine looks at direction, not length; between -1 and 1')}
const cosine = (a, b) => dot(a, b) / (norm(a) * norm(b) || 1)

// ${t('Oyuncak 4 boyutlu vektörler: [elektrik, batarya, denetim, ders kuralı]', 'Toy 4-dimensional vectors: [electricity, battery, control, course rule]')}
const docs = {
  ohm: [0.9, 0.2, 0.1, 0.0],
  lipo: [0.4, 0.9, 0.0, 0.1],
  pid: [0.1, 0.0, 0.95, 0.0],
  kurallar: [0.0, 0.0, 0.1, 0.95],
}

function nearest(query, k = 2) {
  return Object.entries(docs)
    .map(([id, v]) => [id, +cosine(query, v).toFixed(3)])
    .sort((x, y) => y[1] - x[1])
    .slice(0, k)
}

console.log(nearest([0.3, 0.8, 0.0, 0.0])) // ${t('batarya sorusu', 'battery question')}
console.log(nearest([0.0, 0.1, 0.0, 1.0])) // ${t('teslim tarihi sorusu', 'deadline question')}`,
  }
}

/** Ünite 3: sistem promptu, etiketli veri ve birkaç örnek (Python). */
export const promptPy = (lang: Lang): CodeBlock => {
  const t = pick(lang)
  return {
    title: t('Python: sistem promptu, birkaç örnek ve etiketlerle ayrılmış veri', 'Python: system prompt, a few examples and data separated by tags'),
    src: `import anthropic

client = anthropic.Anthropic()  # ${t('anahtar ANTHROPIC_API_KEY ortam değişkeninden', 'key from the ANTHROPIC_API_KEY environment variable')}

SYSTEM = """${t('Sen bir gömülü sistemler dersinin asistanısın.', 'You are the assistant of an embedded systems course.')}
${t('Görev: öğrenci sorusunu konu etiketiyle sınıflandır.', 'Task: classify the student question with a topic label.')}
${t('Etiketler: elektrik, haberlesme, denetim, idari.', 'Labels: electricity, communication, control, admin.')}
${t('Yalnız etiketi yaz. Emin değilsen "belirsiz" yaz.', 'Write only the label. If unsure, write "unclear".')}"""

EXAMPLES = """<ornek><soru>${t('LED için kaç ohm direnç gerekir?', 'What resistor does an LED need?')}</soru><etiket>${t('elektrik', 'electricity')}</etiket></ornek>
<ornek><soru>${t('Ödev kaç gün geç teslim edilebilir?', 'How many days late can homework be?')}</soru><etiket>${t('idari', 'admin')}</etiket></ornek>"""

def classify(question: str) -> str:
    user = f"{EXAMPLES}\\n<soru>{question}</soru>"
    response = client.messages.create(
        model="claude-sonnet-5-5",
        max_tokens=20,
        system=SYSTEM,
        messages=[{"role": "user", "content": user}],
    )
    text = "".join(b.text for b in response.content if b.type == "text")
    return text.strip()

print(classify("${t('MPU6050 hangi I2C adresinde?', 'Which I2C address is the MPU6050 on?')}"))`,
  }
}

/** Ünite 3: prompt kurucu (JavaScript, saf mantık). */
export const promptBuilderJs = (lang: Lang): CodeBlock => {
  const t = pick(lang)
  return {
    title: t('JavaScript: bölümlerden prompt kurucu', 'JavaScript: a prompt builder from sections'),
    src: `// ${t('Promptu dizgi birleştirerek değil, adlandırılmış bölümlerden kur', 'Build the prompt from named sections, not by gluing strings')}
function buildPrompt({ role, task, rules = [], examples = [], data, format }) {
  const parts = []
  if (role) parts.push(role)
  parts.push(\`<gorev>\${task}</gorev>\`)
  if (rules.length) parts.push(\`<kurallar>\\n\${rules.map((r) => '- ' + r).join('\\n')}\\n</kurallar>\`)
  for (const ex of examples) parts.push(\`<ornek>\\n\${ex.input}\\n=> \${ex.output}\\n</ornek>\`)
  // ${t('Kullanıcı verisi her zaman kendi etiketinde: talimatla karışmasın', 'User data always sits in its own tag so it does not mix with instructions')}
  parts.push(\`<veri>\\n\${data}\\n</veri>\`)
  if (format) parts.push(\`<cikti_bicimi>\${format}</cikti_bicimi>\`)
  return parts.join('\\n\\n')
}

const prompt = buildPrompt({
  role: '${t('Sen titiz bir laboratuvar asistanısın.', 'You are a careful lab assistant.')}',
  task: '${t('Ölçüm kaydındaki hatalı satırları bul.', 'Find the faulty lines in the measurement log.')}',
  rules: ['${t('Yalnız veride olanı kullan', 'Use only what is in the data')}', '${t('Emin değilsen söyle', 'Say so if you are unsure')}'],
  examples: [{ input: 't=1 V=5.1', output: 'OK' }, { input: 't=2 V=-40', output: '${t('HATA: negatif gerilim', 'ERROR: negative voltage')}' }],
  data: 't=3 V=4.9\\nt=4 V=999',
  format: '${t('Her satır için OK ya da HATA: neden', 'For each line OK or ERROR: reason')}',
})
console.log(prompt)
console.log('${t('yaklaşık token', 'approx. tokens')}:', Math.ceil(prompt.length / 4))`,
  }
}

/** Ünite 4: JSON şemalı çıktı, iş kuralı doğrulaması ve onarım döngüsü (Python). */
export const schemaPy = (lang: Lang): CodeBlock => {
  const t = pick(lang)
  return {
    title: t('Python: JSON şemalı çıktı, doğrulama ve onarım döngüsü', 'Python: JSON-schema output, validation and a repair loop'),
    src: `import json
import anthropic
from jsonschema import Draft202012Validator  # pip install jsonschema

client = anthropic.Anthropic()  # ${t('anahtar ANTHROPIC_API_KEY ortam değişkeninden', 'key from the ANTHROPIC_API_KEY environment variable')}

SCHEMA = {
    "type": "object",
    "properties": {
        "ders": {"type": "string"},
        "hafta": {"type": "integer"},
        "tur": {"type": "string", "enum": ["lab", "sinav", "proje"]},
        "son_tarih": {"type": "string"},
    },
    "required": ["ders", "hafta", "tur", "son_tarih"],
    "additionalProperties": False,
}

def extract(text: str, tries: int = 2) -> dict:
    messages = [{"role": "user", "content": f"${t('Duyurudan ödev kaydını çıkar', 'Extract the assignment record from the notice')}:\\n<duyuru>{text}</duyuru>"}]
    for _ in range(tries):
        response = client.messages.create(
            model="claude-sonnet-5-5", max_tokens=512, messages=messages,
            output_config={"format": {"type": "json_schema", "schema": SCHEMA}},
        )
        raw = next(b.text for b in response.content if b.type == "text")
        data = json.loads(raw)  # ${t('şema biçimi garanti eder; iş kurallarını biz denetleriz', 'the schema guarantees the shape; we check the business rules')}
        errors = [e.message for e in Draft202012Validator(SCHEMA).iter_errors(data)]
        if not 1 <= data["hafta"] <= 14:
            errors.append("${t('hafta 1 ile 14 arasında olmalı', 'week must be between 1 and 14')}")
        if not errors:
            return data
        # ${t('Onarım: hataları modele geri gönder, yeniden iste', 'Repair: send the errors back to the model and ask again')}
        messages += [{"role": "assistant", "content": raw},
                     {"role": "user", "content": "${t('Şu hataları düzelt', 'Fix these errors')}: " + "; ".join(errors)}]
    raise ValueError("${t('geçerli kayıt alınamadı', 'no valid record obtained')}")

print(extract("${t('Gömülü Sistemler: proje 12. haftanın cuma günü 17.00\\'de teslim.', 'Embedded Systems: project due Friday of week 12 at 17.00.')}"))`,
  }
}

/** Ünite 4: küçük bir şema doğrulayıcı (JavaScript). */
export const validatorJs = (lang: Lang): CodeBlock => {
  const t = pick(lang)
  return {
    title: t('JavaScript: küçük bir JSON şema doğrulayıcı ve JSON ayıklayıcı', 'JavaScript: a small JSON schema validator and JSON extractor'),
    src: `// ${t('Modelin JSON çevresine yazdığı metni at: ilk { ile son } arasını al', 'Drop the text a model writes around JSON: take from the first { to the last }')}
function extractJson(text) {
  const a = text.indexOf('{'), b = text.lastIndexOf('}')
  if (a < 0 || b < a) throw new Error('${t('JSON bulunamadı', 'no JSON found')}')
  return JSON.parse(text.slice(a, b + 1))
}

const typeOf = (v) => (Array.isArray(v) ? 'array' : Number.isInteger(v) ? 'integer' : typeof v)

function validate(schema, value, path = '$') {
  const errs = []
  const ok = schema.type === 'number' ? typeof value === 'number' : typeOf(value) === schema.type
  if (schema.type && !ok) return [\`\${path}: ${t('beklenen', 'expected')} \${schema.type}, ${t('gelen', 'got')} \${typeOf(value)}\`]
  if (schema.enum && !schema.enum.includes(value)) errs.push(\`\${path}: ${t('izin verilmeyen değer', 'value not allowed')} \${JSON.stringify(value)}\`)
  if (schema.type === 'object') {
    for (const k of schema.required ?? []) if (!(k in value)) errs.push(\`\${path}.\${k}: ${t('eksik alan', 'missing field')}\`)
    for (const [k, v] of Object.entries(value)) {
      if (schema.properties?.[k]) errs.push(...validate(schema.properties[k], v, \`\${path}.\${k}\`))
      else if (schema.additionalProperties === false) errs.push(\`\${path}.\${k}: ${t('fazla alan', 'extra field')}\`)
    }
  }
  return errs
}

const schema = { type: 'object', required: ['ders', 'hafta'], additionalProperties: false,
  properties: { ders: { type: 'string' }, hafta: { type: 'integer' }, tur: { type: 'string', enum: ['lab', 'sinav', 'proje'] } } }
const reply = '${t('Tabii! İşte kayıt:', 'Sure! Here is the record:')} {"ders": "${t('Gömülü', 'Embedded')}", "hafta": "12", "tur": "odev"}'
console.log(validate(schema, extractJson(reply)))`,
  }
}

/** Ünite 5: uçtan uca RAG hattı (Python). */
export const ragPy = (lang: Lang): CodeBlock => {
  const t = pick(lang)
  return {
    title: t('Python: uçtan uca RAG (parçala, göm, ara, yeniden sırala, kaynakla cevapla)', 'Python: end-to-end RAG (chunk, embed, search, rerank, answer with sources)'),
    src: `import pathlib, re
import numpy as np
import anthropic
from sentence_transformers import SentenceTransformer  # ${t('yerel gömme modeli', 'local embedding model')}

client = anthropic.Anthropic()  # ${t('anahtar ANTHROPIC_API_KEY ortam değişkeninden', 'key from the ANTHROPIC_API_KEY environment variable')}
embedder = SentenceTransformer("sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2")

def chunk(text, size=60, overlap=15):
    words = text.split()
    step = size - overlap
    return [" ".join(words[i:i + size]) for i in range(0, max(1, len(words) - overlap), step)]

# ${t('1) Dizinleme: her not parçalanır, her parça kaynağıyla birlikte gömülür', '1) Indexing: each note is chunked, each chunk is embedded with its source')}
chunks = []
for path in sorted(pathlib.Path("notlar").glob("*.txt")):
    for i, c in enumerate(chunk(path.read_text(encoding="utf-8"))):
        chunks.append({"id": f"{path.stem}#{i}", "text": c})
E = embedder.encode([c["text"] for c in chunks], normalize_embeddings=True)

def words(s): return set(re.findall(r"\\w+", s.lower()))

def retrieve(question, k=4, keep=2, threshold=0.35):
    q = embedder.encode([question], normalize_embeddings=True)[0]
    scores = E @ q
    top = [(float(scores[i]), chunks[i]) for i in np.argsort(-scores)[:k]]
    # ${t('2) Yeniden sıralama: vektör puanı + anahtar kelime örtüşmesi', '2) Reranking: vector score + keyword overlap')}
    qw = words(question)
    rer = sorted(top, key=lambda p: -(0.7 * p[0] + 0.3 * len(qw & words(p[1]["text"])) / max(1, len(qw))))
    return [c for s, c in rer[:keep] if s >= threshold]  # ${t('eşik altı: kanıt yok', 'below threshold: no evidence')}

def answer(question):
    found = retrieve(question)
    if not found:
        return "${t('Bu sorunun cevabı notlarda yok.', 'The answer to this question is not in the notes.')}"
    context = "\\n".join(f'<belge id="{c["id"]}">{c["text"]}</belge>' for c in found)
    response = client.messages.create(
        model="claude-sonnet-5-5", max_tokens=600,
        system="${t('Yalnız <belge> içeriğine dayanarak cevap ver. Her cümlenin sonuna [id] ile kaynak yaz. Belgelerde yoksa bilmediğini söyle.', 'Answer only from the <belge> content. End every sentence with its source as [id]. If it is not in the documents, say you do not know.')}",
        messages=[{"role": "user", "content": f"{context}\\n\\n<soru>{question}</soru>"}],
    )
    return "".join(b.text for b in response.content if b.type == "text")

print(answer("${t('Dönem projesi ne zaman teslim edilir?', 'When is the term project due?')}"))`,
  }
}

/** Ünite 5: örtüşmeli parçalayıcı ve yeniden sıralayıcı (JavaScript). */
export const chunkRerankJs = (lang: Lang): CodeBlock => {
  const t = pick(lang)
  return {
    title: t('JavaScript: örtüşmeli parçalayıcı ve anahtar kelimeyle yeniden sıralama', 'JavaScript: overlapping chunker and keyword reranking'),
    src: `// ${t('Kelime sayısıyla parçala; örtüşme, sınırda bölünen cümleyi iki parçada da tutar', 'Chunk by word count; overlap keeps a sentence cut at the boundary in both chunks')}
function chunkWords(text, size, overlap) {
  const w = text.split(/\\s+/).filter(Boolean)
  const out = []
  for (let start = 0; start < w.length; start += size - overlap) {
    out.push({ start, text: w.slice(start, start + size).join(' ') })
    if (start + size >= w.length) break
  }
  return out
}

const tokens = (s) => new Set(s.toLocaleLowerCase('tr-TR').match(/[\\p{L}\\p{N}]+/gu) ?? [])

// ${t('Vektör puanı gelmiş adayları sorudaki kelimelerle yeniden sırala', 'Rerank candidates that already have a vector score by the words in the question')}
function rerank(question, candidates, alpha = 0.7) {
  const q = tokens(question)
  return candidates
    .map((c) => {
      const overlap = [...q].filter((x) => tokens(c.text).has(x)).length / Math.max(1, q.size)
      return { ...c, final: +(alpha * c.score + (1 - alpha) * overlap).toFixed(3) }
    })
    .sort((a, b) => b.final - a.final)
}

const note = '${t('Dönem projesi 12. haftanın cuma günü saat 17.00\\'ye kadar teslim edilir. Geç teslimde her gün için yüzde 10 kesilir.', 'The term project is due on Friday of week 12 at 17.00. Late submissions lose 10 percent per day.')}'
console.log(chunkWords(note, 8, 2))
console.log(rerank('${t('proje ne zaman teslim edilir', 'when is the project due')}', [
  { id: 'kurallar#0', score: 0.52, text: note },
  { id: 'pwm#1', score: 0.55, text: '${t('Servo motorlar 50 Hz darbelerle konum alır.', 'Servo motors take their position from 50 Hz pulses.')}' },
]))`,
  }
}
