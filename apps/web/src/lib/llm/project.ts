// LLM dersi bitirme projesi: ders notlarından soru-cevap asistanı (RAG + şemalı çıktı + değerlendirme + güvenlik +
// akışlı arayüz). Yazılım mühendisliği teslimleri Drone dersiyle aynı düzende (öneri → ara kontrol → sunum); ünitelere bağlı.

interface Text { title: string; summary: string; scenario: string; requirements: string[]; architecture: string[]; tests: string[] }
export interface Deliverable { afterUnit: number; tr: { title: string; deliver: string }; en: { title: string; deliver: string } }

const D = (afterUnit: number, tr: [string, string], en: [string, string]): Deliverable => ({ afterUnit, tr: { title: tr[0], deliver: tr[1] }, en: { title: en[0], deliver: en[1] } })

export const CAPSTONE: { tr: Text; en: Text; deliverables: Deliverable[] } = {
  tr: {
    title: 'Bitirme projesi: ders notlarından soru-cevap asistanı',
    summary: 'Bir dersin notlarını (kendi dersin ya da bu sayfadaki sekiz not) okuyup kaynak göstererek cevap veren, notlarda olmayanı "bilmiyorum" diye bildiren, kişisel veriyi maskeleyen ve cevabı akışlı gösteren bir web asistanı.',
    scenario: 'Öğrenci "Dönem projesi ne zaman teslim edilir, iki gün geç kalırsam ne olur?" diye sorar. Asistan soruyu maskeleme süzgecinden geçirir, notlarda arar, en ilgili parçaları kaynak etiketleriyle prompta koyar, modelden JSON şemalı bir cevap (cevap, kaynaklar, güven) alır, doğrular ve metni tarayıcıya akışla yollar. Cevap notlarda yoksa bunu söyler; hesap gerekiyorsa bir hesap aracı çağırır. Her sürüm bir değerlendirme kümesiyle ölçülür.',
    requirements: [
      'G1: Değerlendirme kümesindeki (en az 25 soru, en az 5\'i notlarda olmayan) sorularda normalize doğruluk en az %80.',
      'G2: Notlarda olmayan soruların en az %90\'ında asistan "notlarda yok" der, cevap uydurmaz.',
      'G3: Her cevap en az bir kaynak etiketi içerir ve dayanaklılık kontrolünden geçer (cevaptaki sayılar kaynakta var).',
      'G4: E-posta, telefon, T.C. kimlik no ve IBAN modele gitmeden maskelenir; kayıtlarda ham kişisel veri bulunmaz.',
      'G5: Enjeksiyon kümesindeki (en az 10 örnek) belgelerden hiçbiri sistem kurallarını değiştiremez.',
      'G6: 95. yüzdelik ilk token süresi 2 s altında; istek başı ortalama maliyet raporlanır ve bütçenin altındadır.',
    ],
    architecture: [
      'İçeri alma: notları parçalayan ve gömen çevrimdışı betik; dizin dosyası sürüm ve tarih bilgisiyle.',
      'Sunucu (Node.js ya da Python): kimlik doğrulama, hız sınırı, maskeleme, arama, Anthropic API çağrısı (claude-sonnet-5-5), şema doğrulama, SSE ile akış.',
      'Araçlar: not_ara ve hesapla; dar yetki, girdi doğrulama, is_error ile hata bildirimi.',
      'İstemci: akışlı sohbet arayüzü, durdurma düğmesi, kaynak bağlantıları, geçmiş sınırı.',
      'Yapılandırma: model adı, eşik, k, fiyatlar ve sınırlar tek bir dosyada; API anahtarı yalnız ortam değişkeninde.',
    ],
    tests: [
      'Birim: maskeleme (sağlama haneleri dahil), parçalama, yeniden sıralama, şema doğrulama, SSE ayrıştırıcı (bu dersin testleri gibi).',
      'Değerlendirme: altın küme CI\'da her çekme isteğinde koşar; G1–G3 eşik altında kalırsa birleştirme engellenir.',
      'Güvenlik: enjeksiyon ve kişisel veri kümesi her sürümde koşar (G4, G5).',
      'Uçtan uca: sahte model sağlayıcısıyla durdurma, zaman aşımı, 429 ve şema hatası onarım döngüsü.',
      'Performans: 50 eşzamanlı istekle ilk token süresi ve maliyet ölçümü (G6).',
    ],
  },
  en: {
    title: 'Capstone: a question-answering assistant over course notes',
    summary: 'A web assistant that reads a course\'s notes (your own course or the eight notes on this page), answers with sources, reports what is not in the notes as "I do not know", masks personal data and streams its answer.',
    scenario: 'A student asks "When is the term project due, and what happens if I am two days late?". The assistant passes the question through the masking filter, searches the notes, puts the most relevant chunks in the prompt with source tags, gets a JSON-schema answer (answer, sources, confidence) from the model, validates it and streams the text to the browser. If the answer is not in the notes it says so; if a calculation is needed it calls a calculator tool. Every release is measured with an evaluation set.',
    requirements: [
      'R1: Normalised accuracy of at least 80% on the evaluation set (at least 25 questions, at least 5 not in the notes).',
      'R2: For at least 90% of the questions not in the notes, the assistant says "not in the notes" and does not invent an answer.',
      'R3: Every answer has at least one source tag and passes the groundedness check (numbers in the answer appear in the source).',
      'R4: E-mail, phone, Turkish ID number and IBAN are masked before reaching the model; logs contain no raw personal data.',
      'R5: None of the documents in the injection set (at least 10 examples) can change the system rules.',
      'R6: 95th percentile time to first token under 2 s; average cost per request is reported and stays under budget.',
    ],
    architecture: [
      'Ingestion: an offline script that chunks and embeds the notes; an index file with version and date.',
      'Server (Node.js or Python): authentication, rate limiting, masking, search, the Anthropic API call (claude-sonnet-5-5), schema validation, streaming over SSE.',
      'Tools: not_ara and hesapla; narrow permissions, input validation, errors reported with is_error.',
      'Client: a streaming chat interface, a stop button, source links, a history limit.',
      'Configuration: model name, threshold, k, prices and limits in one file; the API key only in an environment variable.',
    ],
    tests: [
      'Unit: masking (including check digits), chunking, reranking, schema validation, the SSE parser (like the tests in this course).',
      'Evaluation: the gold set runs in CI on every pull request; the merge is blocked if R1 to R3 fall below their thresholds.',
      'Security: the injection and personal data sets run on every release (R4, R5).',
      'End to end: with a fake model provider, test stop, timeout, 429 and the schema-error repair loop.',
      'Performance: time to first token and cost measured with 50 concurrent requests (R6).',
    ],
  },
  deliverables: [
    D(3, ['Öneri ve gereksinimler', 'Bir sayfa: kullanıcı, kullanım senaryoları, G1–G6\'yı kendi cümlelerinle test edilebilir yaz; not kümesi seçildi; ilk sistem promptu ve 10 soruluk taslak değerlendirme kümesi depoda.'],
      ['Proposal and requirements', 'One page: users, use cases, R1 to R6 rewritten in your own words as testable requirements; note set chosen; the first system prompt and a 10-question draft evaluation set in the repository.']),
    D(5, ['Ara kontrol: RAG hattı', 'Parçalama, gömme ve arama çalışıyor; isabet@k altın kümede ölçüldü; şemalı cevap ve doğrulama; mimari belgesi (bileşenler, veri akışı).'],
      ['Progress check: RAG pipeline', 'Chunking, embedding and search work; hit@k measured on the gold set; schema answer and validation; architecture document (components, data flow).']),
    D(7, ['Değerlendirme raporu', '25+ soruluk küme, ölçütler ve rubrik CI\'da; iki prompt sürümünün karşılaştırması; hata analizi (hangi soru neden yanlış).'],
      ['Evaluation report', 'A 25+ question set, metrics and rubric in CI; a comparison of two prompt versions; error analysis (which question failed and why).']),
    D(8, ['Güvenlik incelemesi', 'Tehdit modeli, maskeleme ve enjeksiyon kümeleri, veri envanteri (KVKK: amaç, süre, saklama yeri).'],
      ['Security review', 'Threat model, masking and injection sets, data inventory (KVKK: purpose, retention, storage location).']),
    D(10, ['Demo, maliyet raporu ve sunum', 'Akışlı arayüzle canlı ya da kayıtlı demo; G1–G6 kanıt tablosu; aylık maliyet ve gecikme ölçümü; 10 dakikalık sunum, final raporu ve depo.'],
      ['Demo, cost report and presentation', 'A live or recorded demo with the streaming interface; an evidence table for R1 to R6; monthly cost and latency measurements; a 10-minute presentation, final report and repository.']),
  ],
}
