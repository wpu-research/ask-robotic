// LLM dersi simülasyonlarının başlık ve açıklamaları (TR/EN). Kimlikler sim-box.tsx'teki bileşen eşlemesiyle aynı.
// Hepsi öğretim modelidir: tarayıcıda, deterministik, dış servis yok.
export type LlmSimId = 'bpe' | 'embed' | 'prompt' | 'schema' | 'rag' | 'agent' | 'eval' | 'guard' | 'cost' | 'stream' | 'space3d' | 'rag3d' | 'attn3d'
interface Text { title: string; desc: string }

export const LLM_SIM_META: Record<LlmSimId, { tr: Text; en: Text }> = {
  bpe: {
    tr: { title: 'BPE oyun alanı: tokenlar nasıl doğar', desc: 'Byte Pair Encoding küçük bir derlemde en sık yan yana gelen iki parçayı birleştirir, sonra yeniden sayar. Birleştirme sayısını artır, birleştirme listesini ve kendi cümlenin tokenlara bölünüşünü izle. Türkçe ve İngilizce derlemi karşılaştır ya da kendi derlemini yaz.' },
    en: { title: 'BPE playground: how tokens are born', desc: 'Byte Pair Encoding merges the two pieces that appear next to each other most often in a small corpus, then counts again. Raise the number of merges and watch the merge list and how your own sentence splits into tokens. Compare the Turkish and English corpora or write your own.' },
  },
  embed: {
    tr: { title: 'Gömme ve benzerlik: 2B izdüşüm görüntüleyici', desc: 'Ders notlarından alınmış cümleler öğretim amaçlı bir gömme fonksiyonuyla 64 boyutlu vektörlere çevrilir ve PCA ile düzleme izdüşürülür. Bir soru yaz: noktası haritada belirir, en yakın üç cümle kosinüs benzerliğiyle listelenir. Özellik türünü (kelime, harf üçlüsü) değiştir ve komşuların nasıl değiştiğine bak.' },
    en: { title: 'Embeddings and similarity: 2D projection viewer', desc: 'Sentences from the course notes are turned into 64-dimensional vectors by a teaching embedding function and projected onto a plane with PCA. Type a question: its point appears on the map and the three nearest sentences are listed with cosine similarity. Switch the feature type (words, character trigrams) and see how the neighbours change.' },
  },
  prompt: {
    tr: { title: 'Prompt kalıpları atölyesi', desc: 'Aynı görevi beş kalıpla kur: sıfır atış, birkaç örnekli, rol ve kurallar, adım adım plan, etiketlerle ayrılmış veri. Oluşan promptun bölümleri renkli gösterilir, yaklaşık token sayısı ve bir kontrol listesi (rol, görev, çıktı biçimi, örnek, ayraç, belirsizlikte ne yapılacağı) anında güncellenir.' },
    en: { title: 'Prompting patterns workshop', desc: 'Build the same task with five patterns: zero-shot, few-shot, role and rules, step-by-step plan, data separated by tags. The sections of the resulting prompt are coloured, and the approximate token count and a checklist (role, task, output format, examples, delimiters, what to do when unsure) update instantly.' },
  },
  schema: {
    tr: { title: 'Yapılandırılmış çıktı: JSON şema doğrulayıcı', desc: 'Solda bir JSON şeması, sağda bir modelin döndürmüş olabileceği çıktı. Hazır örnekleri dene: geçerli, eksik alan, yanlış tür, JSON\'un çevresinde fazladan metin, izin verilmeyen değer. Doğrulayıcı hataları yollarıyla gösterir ve onarım döngüsünde modele geri gönderilecek mesajı hazırlar.' },
    en: { title: 'Structured output: JSON schema validator', desc: 'A JSON schema on the left, an output a model might have returned on the right. Try the presets: valid, missing field, wrong type, extra text around the JSON, value not allowed. The validator shows the errors with their paths and prepares the message that the repair loop would send back to the model.' },
  },
  rag: {
    tr: { title: 'Uçtan uca mini RAG: ders notlarından cevap', desc: 'Sekiz kısa Türkçe ders notu parçalara bölünür, öğretim gömmesiyle vektöre çevrilir, soruna en yakın parçalar bulunur, isteğe bağlı olarak anahtar kelime örtüşmesiyle yeniden sıralanır ve kaynak gösteren bir cevap kurulur. Parça boyu, örtüşme, k ve eşiği değiştir; eşiğin altında sistem "notlarda yok" der. Cevap adımı gerçek bir model değil, alıntı yapan bir şablondur.' },
    en: { title: 'End-to-end mini RAG: answers from course notes', desc: 'Eight short course notes are split into chunks, turned into vectors with the teaching embedding, the chunks nearest to your question are found, optionally reranked by keyword overlap, and an answer with sources is built. Change chunk size, overlap, k and the threshold; below the threshold the system says "not in the notes". The answer step is not a real model but a template that quotes.' },
  },
  agent: {
    tr: { title: 'Ajan döngüsü görselleştirici: düşün → araç çağır → gözle', desc: 'Üç görevden birini seç ve ajanı adım adım çalıştır. Her adımda plan (düşünce), araç çağrısı ve argümanları, aracın döndürdüğü gözlem zaman çizelgesinde görünür. Azami adım sayısını düşür ya da bir aracı bozarak ajanın hatayla nasıl başa çıktığını gör. Politika deterministiktir; araçlar (hesap makinesi, not araması, birim çevirici, takvim) gerçekten çalışır.' },
    en: { title: 'Agent loop visualiser: think → call tool → observe', desc: 'Pick one of three tasks and run the agent step by step. At each step the plan (thought), the tool call with its arguments and the observation the tool returned appear on a timeline. Lower the step limit or break a tool to see how the agent handles errors. The policy is deterministic; the tools (calculator, notes search, unit converter, calendar) really run.' },
  },
  eval: {
    tr: { title: 'Değerlendirme tezgâhı: ölçütler, rubrik, dayanaklılık', desc: 'Sekiz soruluk bir test kümesinde iki sistemin cevapları: A kısa ve isabetli, B uzun ve yer yer uyduruyor. Tam eşleşme, normalize eşleşme, token F1, rubrik puanı ve kaynağa dayanaklılık kontrolünü aç kapa; hangi ölçütün hangi hatayı yakaladığını tabloda gör. LLM hakem promptu yalnız gösterilir, çalıştırılmaz.' },
    en: { title: 'Evaluation bench: metrics, rubric, groundedness', desc: 'Answers from two systems on an eight-question test set: A is short and accurate, B is long and sometimes makes things up. Toggle exact match, normalised match, token F1, rubric score and the groundedness check against the source; see in the table which metric catches which error. The LLM-as-judge prompt is only shown, not run.' },
  },
  guard: {
    tr: { title: 'Gizlilik ve güvenlik süzgeci: kişisel veri ve enjeksiyon', desc: 'Metindeki e-posta, telefon, T.C. kimlik numarası (sağlama haneli), IBAN (mod 97) ve kart numarasını (Luhn) bul ve maskele; modele gitmeden önce ne kaldığını gör. İkinci sekmede bir belge ya da araç çıktısı içindeki enjeksiyon belirtilerini tara ve veriyi talimattan ayıran sarmalamayı incele.' },
    en: { title: 'Privacy and safety filter: personal data and injection', desc: 'Find and mask e-mail addresses, phone numbers, Turkish ID numbers (with check digits), IBANs (mod 97) and card numbers (Luhn) in a text; see what is left before it goes to the model. In the second tab, scan a document or tool output for signs of injection and look at the wrapping that separates data from instructions.' },
  },
  cost: {
    tr: { title: 'Servis ve maliyet hesaplayıcı: token, gecikme, önbellek', desc: 'Günlük istek sayısını, istek başına giriş ve çıkış tokenını, önbelleğe alınan payı ve fiyatları gir. İstek başı ve aylık maliyeti, ilk token süresi ile toplam gecikmeyi, önbelleğin ve toplu işlemenin kazandırdığını gör. Varsayılan fiyatlar örnek liste fiyatıdır; güncelini sağlayıcının sayfasından kontrol et.' },
    en: { title: 'Serving and cost calculator: tokens, latency, caching', desc: 'Enter requests per day, input and output tokens per request, the cached share and the prices. See cost per request and per month, time to first token and total latency, and what caching and batch processing save. The default prices are example list prices; check the current ones on the provider\'s page.' },
  },
  stream: {
    tr: { title: 'Akışlı sohbet arayüzü: SSE olaylarından ekrandaki metne', desc: 'Bir soru seç ve gönder: sahte sunucu cevabı Server-Sent Events olayları (message_start, content_block_delta, message_stop) olarak parça parça yollar; parçalar rastgele bayt sınırlarından kesilir. İstemci ayrıştırıcısı tamponlar, olayları çözer ve metni ekrana akıtır. Hızı değiştir, yarıda durdur, ham olay günlüğüne bak.' },
    en: { title: 'Streaming chat front-end: from SSE events to text on screen', desc: 'Pick a question and send it: a fake server sends the answer piece by piece as Server-Sent Events (message_start, content_block_delta, message_stop); the pieces are cut at random byte boundaries. The client parser buffers, decodes the events and streams the text onto the screen. Change the speed, stop halfway, look at the raw event log.' },
  },
  space3d: {
    tr: { title: '3B gömme uzayı: 64 boyuttan üç eksene', desc: 'Aynı öğretim gömmesi bu kez PCA ile üç eksene izdüşürülür; her nokta bir ders notu cümlesi, renk notun konusudur. Sorunu yaz: sorgu noktası uzayda yerine kayar, en yakın k cümleye kosinüs puanlı çizgiler uzanır. Sürükleyerek döndür, iki parmakla yakınlaş; 2B düğmesi üçüncü ekseni bastırıp 2B görüntüleyicinin düzlemine iner.' },
    en: { title: '3D embedding space: from 64 dimensions to three axes', desc: 'The same teaching embedding, this time projected onto three axes with PCA; each point is a sentence from the course notes, the colour is its topic. Type your question: the query point glides to its place and lines with cosine scores reach the nearest k sentences. Drag to orbit, pinch to zoom; the 2D button flattens the third axis down to the plane of the 2D viewer.' },
  },
  rag3d: {
    tr: { title: 'RAG\'ı 3B izle: sorgu → komşular → yeniden sıralama → cevap', desc: 'Mini RAG\'ın parçaları 3B gömme uzayında. Oynat\'a bas: sorgu merkezden yerine uçar, vektör arama 2k adayı bulur, en yakın k parça seçilir, hibrit yeniden sıralama sırayı değiştirir, eşiği geçen parçalar yeşile döner ve kaynaklı cevap kurulur. k, eşik ve yeniden sıralamayı değiştir; Adım düğmesiyle tek tek ilerle.' },
    en: { title: 'Watch RAG in 3D: query → neighbours → rerank → answer', desc: 'The chunks of the mini RAG in the 3D embedding space. Press Play: the query flies from the centre to its place, vector search finds 2k candidates, the nearest k chunks are picked, hybrid reranking changes the order, chunks above the threshold turn green and an answer with sources is built. Change k, the threshold and reranking; step through with the Step button.' },
  },
  attn3d: {
    tr: { title: 'Dikkat yayları 3B: "o" kime bakıyor?', desc: 'Altı tokenlık bir cümlede seçilen sorgu tokenından her tokena bir yay uzanır; yayın yüksekliği ve kalınlığı dikkat ağırlığıdır (softmax, toplamı 1). Son kelimeyi "güçlüydü" yap, dikkat kutudan robota kayar; τ\'yu büyüt, yaylar eşitlenir. Bir tokena dokunarak onu sorgu yap.' },
    en: { title: 'Attention arcs in 3D: who does "it" look at?', desc: 'In a six-token sentence an arc runs from the chosen query token to every token; the height and thickness of the arc is the attention weight (softmax, adds up to 1). Switch the last word to "was strong" and attention moves from the box to the robot; raise τ and the arcs even out. Tap a token to make it the query.' },
  },
}
