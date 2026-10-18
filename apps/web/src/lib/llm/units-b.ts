// LLM dersi üniteleri 6–10: araç kullanımı ve ajanlar, değerlendirme, güvenlik ve KVKK, servis ve maliyet, akışlı web arayüzü.
import { agentLoopPy, batchPy, costPy, judgePy, metricsPy, piiPy, streamClientJs, streamServerJs, toolRunnerPy, untrustedPy } from './code-b'
import type { Unit } from './course'

export const UNITS_B: Unit[] = [
  {
    n: 6, sims: ['agent'],
    related: [
      { href: '/makine-ogrenmesi/yapay-zeka-ajani', tr: 'Makine öğrenmesi: yapay zekâ ajanı', en: 'Machine learning: AI agent' },
      { href: '/ai-atolyesi', tr: 'AI atölyesi: ajan planlayıcı', en: 'AI workshop: agent planner' },
    ],
    tr: {
      title: 'Araç kullanımı ve ajan döngüsü',
      summary: 'Modele araç tanımlamak, düşün → araç çağır → gözle döngüsü, adım sınırı, hata ve yeniden deneme, ne zaman ajan kurulmamalı.',
      goals: ['Bir aracı ad, açıklama ve giriş şemasıyla tanımlamak', 'Araç çağrısı ve araç sonucu mesajlarının döngüdeki yerini açıklamak', 'Adım sınırı ve hata yönetimiyle güvenli bir döngü kurmak', 'Bir işin ajan mı yoksa sabit bir iş akışı mı gerektirdiğine karar vermek'],
      notes: `<p>Model kendi başına hesap makinesi çalıştıramaz, veritabanına bakamaz, takvim açamaz. <b>Araç kullanımı</b> (tool use) ile ona yapabileceği işleri tanımlarız: her aracın bir adı, ne işe yaradığını anlatan bir açıklaması ve argümanlarının JSON şeması vardır. Model gerekirse bir araç çağrısı döndürür; aracı <i>senin kodun</i> çalıştırır ve sonucu modele geri verir.</p>
<h3>Döngü</h3>
<ul><li>İsteği araç tanımlarıyla gönder.</li><li>Cevabın durma nedeni <code>tool_use</code> ise içindeki araç çağrılarını çalıştır.</li><li>Sonuçları <code>tool_result</code> blokları olarak tek bir kullanıcı mesajında geri gönder; hata olduysa <code>is_error</code> ile bildir, sessizce atlama.</li><li>Model bir son cevap verene kadar tekrarla.</li></ul>
<div class="eq">düşün → araç çağır → gözle → … → son cevap (en çok N adım)</div>
<p>Bu döngüyü elle yazabilir ya da Anthropic SDK'daki araç çalıştırıcı (tool runner) yardımcısına bırakabilirsin; ikinci kod örneği bunu gösterir.</p>
<h3>Sınırlar</h3>
<p>Ajan yanlış bir plana takılıp aynı aracı tekrar tekrar çağırabilir. <b>Adım sınırı</b> döngüyü keser ve o ana kadarki bulguları dürüstçe bildirir. Geçici bir araç hatası bir kez yeniden denenir; ikinci kez de başarısızsa ajan tahmin yürütmek yerine işi bitiremediğini söyler. Yazma, silme, ödeme gibi geri alınamaz araçlar için insan onayı istenir.</p>
<h3>Ajan mı, iş akışı mı?</h3>
<p>Adımları önceden bilinen bir iş (soruyu sınıflandır, RAG ile cevapla, biçimlendir) sabit bir iş akışıyla daha ucuz, hızlı ve öngörülebilir çalışır. Ajan, adımların önceden yazılamadığı açık uçlu işlerde değer katar. Simülasyondaki politika bir model değil önceden yazılmış bir plandır; ama araçlar gerçekten çalışır ve argümanlar önceki gözlemlerden çıkarılır.</p>`,
      code: [agentLoopPy('tr'), toolRunnerPy('tr')],
      lab: 'Ajan görselleştiricide "Proje teslimi" görevini adım adım çalıştır ve her gözlemin bir sonraki argümanı nasıl belirlediğini izle. Azami adımı 2\'ye indir: ajan nerede durdu ve ne bildirdi? Sonra "hesapla" aracını boz ve "3S LiPo alt sınırı" görevinde yeniden denemenin bir kez yapıldığını doğrula.',
      pitfalls: ['Araç açıklamasını tek kelimeyle geçmek: model aracı ne zaman kullanacağını açıklamadan anlar.', 'Araç hatasını modele bildirmeden yutmak: model başarılı sandığı bir sonuca dayanarak cevap uydurur.', 'Adım sınırı koymamak: döngü sonsuza kadar sürebilir ve fatura büyür.', 'Adımları belli bir iş için ajan kurmak: sabit bir iş akışı daha ucuz ve güvenilirdir.'],
      se: `<p>Her araç bir <b>API uç noktası</b> gibi tasarlanır: dar yetki, doğrulanan girdi, anlamlı hata.</p>
<ul><li>Araçları modelden bağımsız birim testleriyle sına; model yalnız onları çağıran bir istemcidir.</li><li>Her adımı (düşünce, araç, argüman, sonuç, süre) iz kaydına yaz; ajanın yanlış kararı bu izden ayıklanır.</li></ul>`,
      quiz: [
        { q: 'Model bir araç çağrısı döndürdüğünde aracı kim çalıştırır?', options: ['Model kendisi', 'Uygulamanın kodu', 'Kullanıcının tarayıcısı her zaman', 'Hiç kimse; sonuç tahmin edilir'], answer: 1, why: 'Kullanıcı tanımlı araçlarda model yalnız çağrıyı ve argümanları üretir; çalıştırmak ve sonucu geri vermek senin kodunun işidir.' },
        { q: 'Bir araç hata verdiğinde modele ne gönderilmeli?', options: ['Hiçbir şey, döngü sessizce devam etsin', 'Rastgele bir sonuç', 'is_error işaretli bir tool_result', 'Sistem promptunun yeni bir kopyası'], answer: 2, why: 'Hata bildirilirse model yeniden deneyebilir ya da durumu kullanıcıya söyleyebilir; yutulan hata uydurmaya yol açar.' },
        { q: 'Adım sınırına ulaşıldığında iyi bir ajan ne yapar?', options: ['Durur ve o ana kadarki bulguları dürüstçe bildirir', 'Sınırı kendisi kaldırır', 'Tahmini bir cevap uydurur', 'Baştan başlar'], answer: 0, why: 'Sınır bir güvenlik önlemidir; ajan işi bitiremediğini ve elindekini söyler.' },
        { q: 'Hangi iş için sabit bir iş akışı ajandan daha uygundur?', options: ['Açık uçlu bir araştırma', 'Bilinmeyen bir kod tabanında hata arama', 'Adımları değişen bir planlama', 'Her soruyu sınıflandırıp RAG ile cevaplayıp biçimlendirmek'], answer: 3, why: 'Adımlar önceden belliyse kodla sıralanan bir iş akışı daha ucuz, hızlı ve öngörülebilirdir.' },
      ],
    },
    en: {
      title: 'Tool use and the agent loop',
      summary: 'Defining tools for the model, the think → call tool → observe loop, step limits, errors and retries, and when not to build an agent.',
      goals: ['Define a tool with a name, a description and an input schema', 'Explain where tool call and tool result messages sit in the loop', 'Build a safe loop with a step limit and error handling', 'Decide whether a job needs an agent or a fixed workflow'],
      notes: `<p>On its own a model cannot run a calculator, look at a database or open a calendar. With <b>tool use</b> we define the jobs it can do: every tool has a name, a description of what it is for and a JSON schema for its arguments. When needed the model returns a tool call; <i>your code</i> runs the tool and gives the result back to the model.</p>
<h3>The loop</h3>
<ul><li>Send the request with the tool definitions.</li><li>If the stop reason of the answer is <code>tool_use</code>, run the tool calls inside it.</li><li>Send the results back as <code>tool_result</code> blocks in a single user message; if something failed, report it with <code>is_error</code>, do not skip it silently.</li><li>Repeat until the model gives a final answer.</li></ul>
<div class="eq">think → call tool → observe → … → final answer (at most N steps)</div>
<p>You can write this loop by hand or leave it to the tool runner helper in the Anthropic SDK; the second code example shows how.</p>
<h3>Limits</h3>
<p>An agent can get stuck on a wrong plan and call the same tool again and again. A <b>step limit</b> cuts the loop and honestly reports the findings so far. A temporary tool error is retried once; if it fails a second time, the agent says it could not finish instead of guessing. Irreversible tools such as writing, deleting or paying require human approval.</p>
<h3>Agent or workflow?</h3>
<p>A job whose steps are known in advance (classify the question, answer with RAG, format) runs cheaper, faster and more predictably as a fixed workflow. An agent adds value in open-ended jobs whose steps cannot be written in advance. The policy in the simulation is not a model but a pre-written plan; the tools really run, though, and the arguments come from earlier observations.</p>`,
      code: [agentLoopPy('en'), toolRunnerPy('en')],
      lab: 'In the agent visualiser run the "Project deadline" task step by step and watch how each observation sets the next argument. Lower the step limit to 2: where did the agent stop and what did it report? Then break the "hesapla" tool and confirm in the "3S LiPo lower limit" task that the retry happens once.',
      pitfalls: ['Describing a tool in one word: the model learns when to use a tool from its description.', 'Swallowing a tool error without telling the model: it invents an answer from a result it thinks succeeded.', 'Setting no step limit: the loop can run forever and the bill grows.', 'Building an agent for a job with known steps: a fixed workflow is cheaper and more reliable.'],
      se: `<p>Every tool is designed like an <b>API endpoint</b>: narrow permissions, validated input, meaningful errors.</p>
<ul><li>Test tools with unit tests independent of the model; the model is just a client that calls them.</li><li>Write every step (thought, tool, arguments, result, duration) to a trace; a wrong agent decision is debugged from this trace.</li></ul>`,
      quiz: [
        { q: 'When the model returns a tool call, who runs the tool?', options: ['The model itself', 'The application\'s code', 'Always the user\'s browser', 'Nobody; the result is guessed'], answer: 1, why: 'For user-defined tools the model only produces the call and its arguments; running it and returning the result is your code\'s job.' },
        { q: 'What should be sent to the model when a tool fails?', options: ['Nothing, the loop should continue silently', 'A random result', 'A tool_result marked is_error', 'A new copy of the system prompt'], answer: 2, why: 'If the error is reported, the model can retry or tell the user; a swallowed error leads to invention.' },
        { q: 'What does a good agent do when it hits the step limit?', options: ['Stops and honestly reports the findings so far', 'Removes the limit itself', 'Invents an estimated answer', 'Starts over'], answer: 0, why: 'The limit is a safety measure; the agent says it could not finish and what it has.' },
        { q: 'For which job is a fixed workflow better than an agent?', options: ['An open-ended research task', 'Finding a bug in an unknown codebase', 'Planning whose steps change', 'Classifying every question, answering it with RAG and formatting it'], answer: 3, why: 'When the steps are known in advance, a workflow sequenced in code is cheaper, faster and more predictable.' },
      ],
    },
  },
  {
    n: 7, sims: ['eval'],
    related: [
      { href: '/makine-ogrenmesi/kesinlik-duyarlilik', tr: 'Makine öğrenmesi: kesinlik ve duyarlılık', en: 'Machine learning: precision and recall' },
      { href: '/ai-atolyesi', tr: 'AI atölyesi: değerlendirme aracı', en: 'AI workshop: evaluation tool' },
    ],
    tr: {
      title: 'Değerlendirme: ölçüt, rubrik, hakem ve uydurma kontrolü',
      summary: 'Test kümesi kurmak, tam ve normalize eşleşme, token F1, rubrik, LLM hakem kavramı ve cevabın kaynağa dayanıp dayanmadığını sınamak.',
      goals: ['Bir uygulama için küçük ama temsil edici bir test kümesi kurmak', 'Tam eşleşme, normalize eşleşme ve token F1\'i hesaplamak', 'Rubrikle çok boyutlu puan vermek ve LLM hakemin sınırlarını açıklamak', 'Uydurma sayıları dayanaklılık kontrolüyle yakalamak'],
      notes: `<p>"Birkaç soru sordum, iyi görünüyor" bir ölçüm değildir. Bir LLM uygulaması, cevabı bilinen sorulardan oluşan bir <b>test kümesiyle</b> değerlendirilir ve her prompt, model ya da dizin değişikliğinden sonra aynı küme yeniden koşulur.</p>
<h3>Ölçütler</h3>
<ul><li><b>Tam eşleşme</b>: cevap altın cevapla karakter karakter aynı mı? Çok katıdır; "Yüzde 10." ile "yüzde 10" farklı sayılır.</li><li><b>Normalize eşleşme</b>: büyük-küçük harf (Türkçe I/İ dahil), noktalama ve kaynak etiketi atıldıktan sonra eşleşme.</li><li><b>Token F1</b>: ortak kelimelerin kesinlik ve duyarlılığının harmonik ortalaması. Kısmi doğruluğu ödüllendirir ama anlamı ölçmez.</li><li><b>Rubrik</b>: doğruluk, kaynak gösterme, kısalık, dayanaklılık gibi ölçütlere ayrı puan.</li></ul>
<h3>LLM hakem</h3>
<p>Açık uçlu cevaplarda başka bir modele rubriği, kaynağı ve cevabı verip puanlatmak (LLM-as-judge) ölçeklenebilir bir yoldur. Ama hakem de bir modeldir: uzun cevabı kayırabilir, kendi üslubunu ödüllendirebilir, aynı girdiye farklı puan verebilir. Hakemin kararları insan puanlarıyla küçük bir kümede karşılaştırılmadan ona güvenilmez. Bu sayfada hakem promptu yalnız gösterilir, çalıştırılmaz.</p>
<h3>Uydurma kontrolü</h3>
<p><b>Dayanaklılık</b>, cevaptaki iddiaların kaynakta bulunup bulunmadığıdır. Ucuz ve etkili bir kontrol: cevaptaki her sayı kaynak notta geçiyor mu? "AD0 yüksekse 0x69 olur" gerçekte doğru olabilir ama notlarda yoksa kaynaksızdır; RAG uygulamasında kaynaksız iddia hatadır.</p>
<div class="eq">F1 = 2 × kesinlik × duyarlılık / (kesinlik + duyarlılık)</div>
<p>Tek bir sayıya bakma: ölçütleri yan yana koy ve hangi ölçütün hangi hatayı yakaladığını incele. Simülasyonda A sistemi kısa ve isabetli, B uzun ve yer yer uyduruyor; tam eşleşme ikisini de cezalandırır, dayanaklılık yalnız B'yi.</p>`,
      code: [metricsPy('tr'), judgePy('tr')],
      lab: 'Değerlendirme tezgâhında önce yalnız tam eşleşmeyi aç: A ve B neden ikisi de düşük? Normalize eşleşmeyi ekle ve farkı açıkla. Dayanaklılığı aç ve B\'nin hangi sayıları uydurduğunu listele. Son olarak 2. sorunun B cevabı için hakem promptunu oku ve hakemin hangi bilgiyle "kaynaksız" diyebileceğini yaz.',
      pitfalls: ['Test kümesini yalnız kolay sorulardan kurmak: "notlarda yok" ve sınır durumları da olmalı.', 'Yalnız tam eşleşmeye bakmak: doğru ama farklı yazılmış cevaplar hata sayılır.', 'LLM hakemi insanla karşılaştırmadan kullanmak.', 'Test kümesini prompt yazarken görüp ona göre ayarlamak: ayrı bir doğrulama kümesi tut.'],
      se: `<p>Değerlendirme kümesi LLM uygulamasının <b>regresyon testidir</b>.</p>
<ul><li>Kümeyi depoda tut, CI\'da her çekme isteğinde koştur ve ölçütleri bir eşikle karşılaştır.</li><li>Her hatayı kümeye yeni bir vaka olarak ekle; aynı hata ikinci kez sessizce dönmesin.</li></ul>`,
      quiz: [
        { q: '"Yüzde 10." cevabı, altın cevap "yüzde 10" iken tam eşleşmede ve normalize eşleşmede ne alır?', options: ['1 ve 1', '0 ve 0', '0 ve 1', '1 ve 0'], answer: 2, why: 'Büyük harf ve nokta tam eşleşmeyi bozar; normalize edilince ikisi de "yüzde 10" olur.' },
        { q: 'Kesinlik 0,5 ve duyarlılık 1 ise token F1 kaçtır?', options: ['0,67', '0,50', '0,75', '1,00'], answer: 0, why: 'F1 = 2 × 0,5 × 1 / (0,5 + 1) = 1 / 1,5 ≈ 0,67.' },
        { q: 'LLM hakemine güvenmeden önce ne yapılmalı?', options: ['Daha uzun prompt yazmak', 'Kararlarını küçük bir kümede insan puanlarıyla karşılaştırmak', 'Sıcaklığı artırmak', 'Hakemi kendi cevabını puanlamaya zorlamak'], answer: 1, why: 'Hakem de yanılır ve önyargılıdır; insanla uyumu ölçülmeden ona dayanılmaz.' },
        { q: 'Dayanaklılık kontrolü hangi hatayı yakalar?', options: ['Yazım hatasını', 'Yavaş cevabı', 'Uzun cevabı', 'Kaynakta olmayan bir sayının cevaba eklenmesini'], answer: 3, why: 'Cevaptaki iddia (burada sayı) kaynak notta yoksa cevap kaynaksızdır; RAG\'da bu bir uydurmadır.' },
      ],
    },
    en: {
      title: 'Evaluation: metrics, rubric, judge and hallucination checks',
      summary: 'Building a test set, exact and normalised match, token F1, rubrics, the LLM-as-judge idea and testing whether an answer is grounded in its source.',
      goals: ['Build a small but representative test set for an application', 'Compute exact match, normalised match and token F1', 'Score along several dimensions with a rubric and explain the limits of an LLM judge', 'Catch made-up numbers with a groundedness check'],
      notes: `<p>"I asked a few questions and it looks good" is not a measurement. An LLM application is evaluated with a <b>test set</b> of questions whose answers are known, and the same set is rerun after every change to the prompt, model or index.</p>
<h3>Metrics</h3>
<ul><li><b>Exact match</b>: is the answer identical to the gold answer character by character? Very strict; "10 percent." and "10 percent" count as different.</li><li><b>Normalised match</b>: a match after casing (including Turkish I/İ), punctuation and source tags are removed.</li><li><b>Token F1</b>: the harmonic mean of precision and recall over shared words. Rewards partial correctness but does not measure meaning.</li><li><b>Rubric</b>: separate points for criteria such as correctness, citing a source, brevity and groundedness.</li></ul>
<h3>LLM as judge</h3>
<p>For open-ended answers, giving another model the rubric, the source and the answer and asking it to score (LLM-as-judge) is a scalable approach. But the judge is a model too: it may favour long answers, reward its own style, or give different scores to the same input. Do not trust a judge until its decisions have been compared with human scores on a small set. On this page the judge prompt is only shown, not run.</p>
<h3>Hallucination check</h3>
<p><b>Groundedness</b> is whether the claims in an answer appear in the source. A cheap and effective check: does every number in the answer appear in the source note? "If AD0 is high it becomes 0x69" may be true in reality, but if it is not in the notes it is unsupported; in a RAG application an unsupported claim is an error.</p>
<div class="eq">F1 = 2 × precision × recall / (precision + recall)</div>
<p>Do not look at a single number: put the metrics side by side and examine which metric catches which error. In the simulation system A is short and accurate, B is long and sometimes invents; exact match penalises both, groundedness only B.</p>`,
      code: [metricsPy('en'), judgePy('en')],
      lab: 'In the evaluation bench turn on exact match only: why are both A and B low? Add normalised match and explain the difference. Turn on groundedness and list the numbers B made up. Finally read the judge prompt for B\'s answer to question 2 and write down what information lets the judge call it "unsupported".',
      pitfalls: ['Building the test set from easy questions only: "not in the notes" and edge cases belong there too.', 'Looking only at exact match: correct answers written differently count as errors.', 'Using an LLM judge without comparing it with humans.', 'Seeing the test set while writing the prompt and tuning to it: keep a separate validation set.'],
      se: `<p>The evaluation set is the LLM application's <b>regression test</b>.</p>
<ul><li>Keep the set in the repository, run it in CI on every pull request and compare the metrics with a threshold.</li><li>Add every bug to the set as a new case, so the same error never silently returns.</li></ul>`,
      quiz: [
        { q: 'With the gold answer "10 percent", what does the answer "10 percent." score in exact match and in normalised match?', options: ['1 and 1', '0 and 0', '0 and 1', '1 and 0'], answer: 2, why: 'The full stop breaks exact match; after normalising both become "10 percent".' },
        { q: 'If precision is 0.5 and recall is 1, what is token F1?', options: ['0.67', '0.50', '0.75', '1.00'], answer: 0, why: 'F1 = 2 × 0.5 × 1 / (0.5 + 1) = 1 / 1.5 ≈ 0.67.' },
        { q: 'What should you do before trusting an LLM judge?', options: ['Write a longer prompt', 'Compare its decisions with human scores on a small set', 'Raise the temperature', 'Make the judge score its own answers'], answer: 1, why: 'The judge also errs and has biases; do not rely on it before measuring its agreement with humans.' },
        { q: 'Which error does the groundedness check catch?', options: ['A spelling mistake', 'A slow answer', 'A long answer', 'A number added to the answer that is not in the source'], answer: 3, why: 'If a claim (a number here) is not in the source note, the answer is unsupported; in RAG that is an invention.' },
      ],
    },
  },
  {
    n: 8, sims: ['guard'],
    related: [
      { href: '/ai-atolyesi', tr: 'AI atölyesi: prompt enjeksiyonu laboratuvarı', en: 'AI workshop: prompt injection lab' },
      { href: '/moduller/ai-muhendisligi', tr: 'AI Mühendisliği modülü: güvenli kullanım', en: 'AI Engineering module: safe use' },
    ],
    tr: {
      title: 'Güvenlik ve gizlilik: kişisel veri, prompt enjeksiyonu, KVKK',
      summary: 'Kişisel veriyi modele gitmeden maskelemek, dolaylı prompt enjeksiyonuna karşı katmanlı savunma, en az yetki ve 6698 sayılı Kanun\'un temel ilkeleri.',
      goals: ['E-posta, telefon, T.C. kimlik no, IBAN ve kart numarasını sağlamasıyla bulup maskelemek', 'Doğrudan ve dolaylı prompt enjeksiyonunu ayırt etmek', 'Veriyi talimattan ayıran ve araç yetkisini daraltan katmanlı bir savunma kurmak', 'KVKK\'nın veri en aza indirme, amaçla sınırlılık ve açık rıza ilkelerini bir LLM uygulamasına uygulamak'],
      notes: `<p>Bir LLM uygulaması iki yönden risk taşır: kullanıcının verisi gereğinden fazla yere gidebilir ve güvenilmeyen bir metin modelin davranışını ele geçirebilir.</p>
<h3>Kişisel veri</h3>
<p>Modele giden her metin bir dış servise gider, kayıtlara yazılabilir, önbellekte durabilir. Bu yüzden kişisel veri modele gitmeden önce <b>maskelenir</b>: e-posta ve telefon desenle, T.C. kimlik numarası sağlama haneleriyle, IBAN mod 97 ile, kart numarası Luhn algoritmasıyla bulunur ve <code>[EPOSTA_1]</code> gibi etiketlerle değiştirilir. Eşleme yalnız sunucuda tutulur; cevap kullanıcıya dönerken etiketler geri açılır. Desen her şeyi yakalamaz: öğrenci numarası ya da serbest metinde geçen bir adres biçimsizdir. Süzgeç bir katmandır, tek başına yetmez.</p>
<h3>Prompt enjeksiyonu</h3>
<ul><li><b>Doğrudan</b>: kullanıcı "önceki talimatları unut" yazar.</li><li><b>Dolaylı</b>: saldırı modelin okuduğu bir belgede, web sayfasında ya da araç çıktısında gizlidir; HTML yorumu, görünmez karakter ya da etiketi kapatma denemesi olabilir. RAG ve ajanlar bu yüzden daha açıktır.</li></ul>
<p>Tek bir süzgeçle kesin çözüm yoktur; savunma <b>katmanlıdır</b>: güvenilmeyen içeriği etiketlerle veri olarak sarmala ve kapanış etiketini kaçışla; sistem promptunda verinin talimat olmadığını söyle; modele yalnız gereken araçları ve en dar yetkiyi ver; geri alınamaz eylemler için insan onayı iste; çıktıyı da denetle (gizli bilgi, dış bağlantı).</p>
<h3>KVKK</h3>
<p>6698 sayılı Kişisel Verilerin Korunması Kanunu'nun temel ilkeleri bir LLM uygulamasında somut kararlara dönüşür: yalnız gereken veriyi topla (en aza indirme), yalnız bildirdiğin amaçla kullan, saklama süresini belirle ve sonunda sil, kullanıcıyı aydınlat ve gerektiğinde açık rıza al, verinin yurt dışına aktarılıp aktarılmadığını değerlendir. Bu ders hukuki danışmanlık değildir; gerçek bir projede kurumun hukuk birimiyle çalışılır.</p>`,
      code: [piiPy('tr'), untrustedPy('tr')],
      lab: 'Gizlilik süzgecinde örnek metni incele: beş kişisel veri türü bulundu mu, öğrenci numarası neden kaldı? Kimlik numarasının son hanesini değiştir ve maskelenmediğini doğrula. Enjeksiyon sekmesine geç: hangi belirtiler bulundu, sarmalanmış metinde kapanış etiketi nasıl etkisizleştirildi? Kendi enjeksiyon cümleni yaz ve süzgeci atlatmaya çalış; atlatabildiysen hangi katmanın seni durduracağını açıkla.',
      pitfalls: ['Desen süzgecini tek savunma sanmak: biçimsiz kişisel veri ve yeni saldırı kalıpları geçer.', 'Kişisel veriyi kayıtlara (log) maskelemeden yazmak.', 'Ajana gereğinden geniş araç yetkisi vermek: okuma yetkisi yeterken yazma ve silme açmak.', 'Belgedeki ya da araç çıktısındaki metni sistem talimatı gibi prompta birleştirmek.'],
      se: `<p>Güvenlik bir <b>tehdit modeli</b> ile başlar: hangi veri, kimden, hangi yoldan gelir ve nereye gider?</p>
<ul><li>Enjeksiyon örneklerinden oluşan bir saldırı kümesini değerlendirme kümesinin yanına koy ve her sürümde koştur.</li><li>Kişisel veri akışını belgeleyen bir veri envanteri tut: hangi alan, hangi amaçla, ne kadar süre, kimde.</li></ul>`,
      quiz: [
        { q: '11 haneli bir sayı T.C. kimlik numarası desenine uyuyor ama sağlama haneleri tutmuyor. Süzgeç ne yapmalı?', options: ['Yine de maskelemeli', 'Kimlik numarası saymamalı', 'İsteği reddetmeli', 'Numarayı düzeltmeli'], answer: 1, why: 'Sağlama haneleri yanlış pozitifleri azaltır; tutmayan sayı büyük olasılıkla kimlik numarası değildir.' },
        { q: 'Dolaylı prompt enjeksiyonu nedir?', options: ['Saldırının modelin okuduğu bir belgede ya da araç çıktısında gizli olması', 'Kullanıcının doğrudan kötü bir istek yazması', 'API anahtarının çalınması', 'Modelin yavaş cevap vermesi'], answer: 0, why: 'Saldırgan kullanıcı değildir; model güvenilmeyen bir içeriği okurken talimatla karşılaşır.' },
        { q: 'Hangisi katmanlı savunmanın parçası değildir?', options: ['Güvenilmeyen içeriği etiketlerle sarmalamak', 'Araç yetkisini daraltmak', 'Sistem promptunu kullanıcıya göstermek', 'Geri alınamaz eylemde insan onayı'], answer: 2, why: 'Sistem promptunu açmak bir savunma değildir; diğer üçü katmanlı savunmanın tipik parçalarıdır.' },
        { q: 'KVKK\'daki veri en aza indirme ilkesi bir LLM uygulamasında neyi gerektirir?', options: ['Tüm sohbetleri süresiz saklamayı', 'Veriyi her zaman yurt dışına aktarmayı', 'Kullanıcıya hiç bilgi vermemeyi', 'Modele yalnız görev için gereken veriyi göndermeyi'], answer: 3, why: 'Gereken veriyi topla ve gönder; fazlası risk ve yükümlülük demektir.' },
      ],
    },
    en: {
      title: 'Safety and privacy: personal data, prompt injection, KVKK',
      summary: 'Masking personal data before it reaches the model, layered defence against indirect prompt injection, least privilege and the core principles of the Turkish data protection law.',
      goals: ['Find and mask e-mail, phone, Turkish ID number, IBAN and card numbers with their checksums', 'Tell direct and indirect prompt injection apart', 'Build a layered defence that separates data from instructions and narrows tool permissions', 'Apply the KVKK principles of data minimisation, purpose limitation and explicit consent to an LLM application'],
      notes: `<p>An LLM application carries risk in two directions: the user's data can go further than needed, and an untrusted text can take over the model's behaviour.</p>
<h3>Personal data</h3>
<p>Every text sent to the model goes to an external service, may be written to logs and may sit in a cache. That is why personal data is <b>masked</b> before it reaches the model: e-mail and phone are found by pattern, the Turkish ID number by its check digits, the IBAN with mod 97, the card number with the Luhn algorithm, and they are replaced with labels such as <code>[EPOSTA_1]</code>. The mapping is kept only on the server; the labels are restored when the answer returns to the user. Patterns do not catch everything: a student number or an address in free text has no fixed format. The filter is one layer, never enough alone.</p>
<h3>Prompt injection</h3>
<ul><li><b>Direct</b>: the user writes "forget the previous instructions".</li><li><b>Indirect</b>: the attack is hidden in a document, web page or tool output the model reads; it may be an HTML comment, invisible characters or an attempt to close the wrapping tag. RAG and agents are more exposed for this reason.</li></ul>
<p>There is no definitive fix with a single filter; the defence is <b>layered</b>: wrap untrusted content as data in tags and escape the closing tag; say in the system prompt that data is not instructions; give the model only the tools it needs with the narrowest permissions; require human approval for irreversible actions; check the output too (secrets, external links).</p>
<h3>KVKK</h3>
<p>The core principles of the Turkish Personal Data Protection Law No. 6698 (KVKK) become concrete decisions in an LLM application: collect only the data you need (minimisation), use it only for the purpose you declared, set a retention period and delete at the end, inform the user and obtain explicit consent where required, and assess whether data is transferred abroad. This course is not legal advice; a real project works with the organisation's legal team.</p>`,
      code: [piiPy('en'), untrustedPy('en')],
      lab: 'Examine the sample text in the privacy filter: were all five kinds of personal data found, and why did the student number remain? Change the last digit of the ID number and confirm it is no longer masked. Switch to the injection tab: which signs were found, and how was the closing tag neutralised in the wrapped text? Write your own injection sentence and try to get past the filter; if you did, explain which layer would stop you.',
      pitfalls: ['Treating the pattern filter as the only defence: unformatted personal data and new attack patterns get through.', 'Writing personal data to logs without masking it.', 'Giving an agent broader tool permissions than needed: enabling write and delete when read is enough.', 'Merging text from a document or tool output into the prompt as if it were a system instruction.'],
      se: `<p>Security starts with a <b>threat model</b>: which data comes from whom, by which path, and where does it go?</p>
<ul><li>Keep an attack set of injection examples next to the evaluation set and run it on every release.</li><li>Keep a data inventory that documents the flow of personal data: which field, for what purpose, for how long, held by whom.</li></ul>`,
      quiz: [
        { q: 'An 11-digit number matches the Turkish ID pattern but its check digits fail. What should the filter do?', options: ['Mask it anyway', 'Not treat it as an ID number', 'Reject the request', 'Correct the number'], answer: 1, why: 'Check digits reduce false positives; a number that fails them is most likely not an ID number.' },
        { q: 'What is indirect prompt injection?', options: ['The attack is hidden in a document or tool output the model reads', 'The user writes a malicious request directly', 'The API key is stolen', 'The model answers slowly'], answer: 0, why: 'The attacker is not the user; the model meets an instruction while reading untrusted content.' },
        { q: 'Which is not part of a layered defence?', options: ['Wrapping untrusted content in tags', 'Narrowing tool permissions', 'Showing the system prompt to the user', 'Human approval for irreversible actions'], answer: 2, why: 'Revealing the system prompt is not a defence; the other three are typical layers.' },
        { q: 'What does the KVKK principle of data minimisation require in an LLM application?', options: ['Keeping all chats forever', 'Always transferring data abroad', 'Giving the user no information', 'Sending the model only the data the task needs'], answer: 3, why: 'Collect and send what is needed; anything more means more risk and more obligations.' },
      ],
    },
  },
  {
    n: 9, sims: ['cost'],
    related: [
      { href: '/makine-ogrenmesi/hiz-siniri', tr: 'Makine öğrenmesi: hız sınırı', en: 'Machine learning: rate limiting' },
      { href: '/makine-ogrenmesi/onbellek', tr: 'Makine öğrenmesi: önbellek', en: 'Machine learning: caching' },
      { href: '/makine-ogrenmesi/konteyner-olcekleme', tr: 'Makine öğrenmesi: konteyner ölçekleme', en: 'Machine learning: container scaling' },
    ],
    tr: {
      title: 'Servis ve maliyet: token bütçesi, önbellek, gecikme',
      summary: 'İstek başı ve aylık maliyet, prompt önbelleği, toplu işleme, ilk token süresi, hız sınırları, yeniden deneme ve model seçimi.',
      goals: ['Bir uygulamanın aylık maliyetini token sayılarından hesaplamak', 'Prompt önbelleğinin maliyete ve ilk token süresine etkisini açıklamak', 'Acele olmayan işleri toplu işlemeye ayırmak', '429 ve 5xx hatalarına karşı üstel beklemeli yeniden deneme ve kuyruk tasarlamak'],
      notes: `<p>Bir prototipi binlerce kullanıcıya açınca üç soru öne çıkar: ayda ne tutar, kullanıcı ne kadar bekler, sağlayıcı sınırlarına takılınca ne olur?</p>
<h3>Maliyet</h3>
<p>Maliyet token sayısıyla doğru orantılıdır. Bir RAG uygulamasında giriş tokenının büyük kısmı her istekte aynı olan sistem promptu ve belgelerdir. <b>Prompt önbelleği</b> bu kararlı ön eki saklar: önbellekten okunan token, normal giriş tokenının küçük bir kesridir; ilk yazma biraz pahalıdır. Önbellek ön ek eşleşmesiyle çalışır: ön ekte tek bir bayt değişirse (örneğin sistem promptuna saat eklemek) sonrası yeniden hesaplanır.</p>
<div class="eq">aylık = günlük_istek × 30 × (taze_giriş × p_giriş + önbellek_okuma × p_okuma + çıkış × p_çıkış)</div>
<p>Gerçek zamanlı olması gerekmeyen işler (gece raporu, toplu sınıflandırma) <b>toplu işleme</b> (Batches) ile yarı fiyata gönderilebilir; sonuçlar saatler içinde ve rastgele sırada gelir, <code>custom_id</code> ile eşleştirilir.</p>
<h3>Gecikme</h3>
<p>Kullanıcının algıladığı süre iki parçadır: <b>ilk token süresi</b> (girişin işlenmesi; uzun prompt ve önbellek ıskası uzatır) ve üretim süresi (çıkış tokenı ÷ saniyedeki token). Akışlı cevap (10. ünite) toplam süreyi değiştirmez ama kullanıcı ilk kelimeyi hemen görür. Daha küçük bir model ya da daha düşük düşünme çabası basit işlerde hem ucuz hem hızlıdır; doğru seçim değerlendirme kümesiyle ölçülür.</p>
<h3>Sınırlar ve hatalar</h3>
<p>Sağlayıcılar dakikadaki istek ve token sayısını sınırlar; aşılınca 429 döner. SDK'lar 429 ve 5xx hatalarını üstel bekleyerek birkaç kez yeniden dener. Yeniden denemeler de biterse istek bir kuyruğa alınır ya da kullanıcıya anlaşılır bir mesaj gösterilir. Uygulama kendi tarafında da kullanıcı başına sınır koyar ki tek bir kullanıcı herkesin bütçesini tüketmesin. Simülasyondaki fiyatlar örnek liste fiyatıdır; güncel fiyat sağlayıcının sayfasından kontrol edilir.</p>`,
      code: [costPy('tr'), batchPy('tr')],
      lab: 'Maliyet hesaplayıcıda varsayılan ayarla aylık maliyeti not et. Önbelleklenebilir payı %0\'a indir: maliyet ve ilk token süresi ne kadar değişti? Payı %80\'e geri al ve isabeti %50\'ye düşür; sonucu açıkla. Son olarak işlerin yarısını toplu işlemeye ayır ve kazancı hesapla. Bir sınıf için (30 öğrenci, günde 20 soru) kendi senaryonu kur.',
      pitfalls: ['Sistem promptuna tarih ya da istek kimliği gibi değişen bir şey koyup önbelleği her istekte bozmak.', 'Yalnız istek başı maliyete bakmak: yeniden denemeler ve uzun sohbet geçmişi de token tüketir.', 'Hız sınırı hatasını yakalamamak: kullanıcı boş bir ekranla kalır.', 'Her işe en büyük modeli seçmek: basit sınıflandırmada küçük model ya da düşük çaba yeter.'],
      se: `<p>Maliyet ve gecikme, işlevsel olmayan <b>gereksinimlerdir</b>: yazılır, ölçülür, alarm kurulur.</p>
<ul><li>"95. yüzdelik ilk token süresi 1,5 s altında", "aylık bütçe 300 $" gibi hedefleri belgeye yaz ve panoda izle.</li><li>API cevabındaki <code>usage</code> alanlarını (giriş, önbellek okuma, önbellek yazma, çıkış) her istek için kaydet; önbellek okuması sıfırsa sessiz bir bozucu arıyorsun demektir.</li></ul>`,
      quiz: [
        { q: 'Prompt önbelleği neden sistem promptuna saat eklenince işe yaramaz hâle gelir?', options: ['Saat çok token tutar', 'Önbellek ön ek eşleşmesiyle çalışır ve ön ek her istekte değişir', 'API saati reddeder', 'Önbellek yalnız gece çalışır'], answer: 1, why: 'Önbellek baştan itibaren birebir aynı ön eki arar; değişen bir parça sonrasını yeniden hesaplatır.' },
        { q: 'Gece çalışan ve sonucu ertesi sabah gereken 10 000 sınıflandırma işi için en uygun yol hangisidir?', options: ['Toplu işleme (Batches) ile yarı fiyata göndermek', 'Her birini akışlı istekle göndermek', 'En büyük modeli en yüksek çabayla çalıştırmak', 'Önbelleği kapatmak'], answer: 0, why: 'Gerçek zamanlı olmayan işler toplu işlemeyle yarı fiyata gider; sonuçlar custom_id ile eşleştirilir.' },
        { q: 'Akışlı cevap neyi iyileştirir?', options: ['Toplam token sayısını', 'Aylık faturayı', 'Kullanıcının ilk kelimeyi görme süresini', 'Modelin doğruluğunu'], answer: 2, why: 'Toplam süre ve token aynı kalır; metin üretildikçe gösterildiği için algılanan bekleme kısalır.' },
        { q: '429 hatası alındığında doğru davranış hangisidir?', options: ['Hemen aynı isteği döngüde göndermek', 'Uygulamayı kapatmak', 'Hatayı yok saymak', 'Üstel bekleyerek yeniden denemek, sonra kuyruğa almak ya da kullanıcıya bildirmek'], answer: 3, why: 'Hız sınırı geçicidir; bekleyerek denemek yükü artırmadan toparlar, denemeler biterse kullanıcı bilgilendirilir.' },
      ],
    },
    en: {
      title: 'Serving and cost: token budget, caching, latency',
      summary: 'Cost per request and per month, prompt caching, batch processing, time to first token, rate limits, retries and model choice.',
      goals: ['Calculate an application\'s monthly cost from token counts', 'Explain the effect of prompt caching on cost and time to first token', 'Move work that is not urgent to batch processing', 'Design retries with exponential backoff and a queue for 429 and 5xx errors'],
      notes: `<p>When a prototype is opened to thousands of users, three questions come up: what does it cost per month, how long does the user wait, and what happens when you hit the provider's limits?</p>
<h3>Cost</h3>
<p>Cost is proportional to the token count. In a RAG application most input tokens are the system prompt and documents, which are the same on every request. A <b>prompt cache</b> stores this stable prefix: tokens read from the cache cost a small fraction of normal input tokens; the first write is a little more expensive. The cache works by prefix match: if a single byte in the prefix changes (for example adding the time to the system prompt), everything after it is recomputed.</p>
<div class="eq">monthly = requests_per_day × 30 × (fresh_input × p_input + cache_read × p_read + output × p_output)</div>
<p>Work that need not be real time (a nightly report, bulk classification) can be sent at half price with <b>batch processing</b> (Batches); results arrive within hours and in any order, and are matched by <code>custom_id</code>.</p>
<h3>Latency</h3>
<p>The time a user perceives has two parts: <b>time to first token</b> (processing the input; a long prompt and a cache miss make it longer) and generation time (output tokens ÷ tokens per second). A streaming answer (unit 10) does not change the total time, but the user sees the first word at once. A smaller model or lower thinking effort is both cheaper and faster for simple jobs; the right choice is measured with the evaluation set.</p>
<h3>Limits and errors</h3>
<p>Providers limit requests and tokens per minute; above the limit they return 429. The SDKs retry 429 and 5xx errors a few times with exponential backoff. If the retries run out too, the request goes to a queue or the user sees a clear message. The application also sets its own per-user limit so that a single user cannot use up everyone's budget. The prices in the simulation are example list prices; check the current price on the provider's page.</p>`,
      code: [costPy('en'), batchPy('en')],
      lab: 'In the cost calculator note the monthly cost with the default settings. Lower the cacheable share to 0%: how much did the cost and the time to first token change? Put the share back to 80% and drop the hit rate to 50%; explain the result. Finally move half of the work to batch processing and calculate the saving. Build your own scenario for a class (30 students, 20 questions a day).',
      pitfalls: ['Putting something that changes, such as a date or a request id, into the system prompt and breaking the cache on every request.', 'Looking only at the cost per request: retries and long chat histories also use tokens.', 'Not catching the rate limit error: the user is left with a blank screen.', 'Choosing the largest model for every job: for simple classification a small model or low effort is enough.'],
      se: `<p>Cost and latency are non-functional <b>requirements</b>: written down, measured, alerted on.</p>
<ul><li>Write targets such as "95th percentile time to first token under 1.5 s" and "monthly budget $300" in the documentation and track them on a dashboard.</li><li>Log the <code>usage</code> fields of the API response (input, cache read, cache write, output) for every request; if cache reads are zero, you are looking for a silent invalidator.</li></ul>`,
      quiz: [
        { q: 'Why does the prompt cache stop working when the time is added to the system prompt?', options: ['The time uses many tokens', 'The cache works by prefix match and the prefix changes on every request', 'The API rejects the time', 'The cache only works at night'], answer: 1, why: 'The cache looks for an identical prefix from the start; a changing piece forces everything after it to be recomputed.' },
        { q: 'What is the best way to run 10,000 classification jobs overnight whose results are needed the next morning?', options: ['Send them at half price with batch processing (Batches)', 'Send each one as a streaming request', 'Run the largest model at the highest effort', 'Turn off the cache'], answer: 0, why: 'Work that is not real time goes at half price through batch processing; results are matched by custom_id.' },
        { q: 'What does a streaming answer improve?', options: ['The total token count', 'The monthly bill', 'How soon the user sees the first word', 'The model\'s accuracy'], answer: 2, why: 'Total time and tokens stay the same; because text is shown as it is produced, the perceived wait is shorter.' },
        { q: 'What is the right behaviour on a 429 error?', options: ['Resend the same request in a tight loop', 'Shut down the application', 'Ignore the error', 'Retry with exponential backoff, then queue it or tell the user'], answer: 3, why: 'A rate limit is temporary; waiting before retrying recovers without adding load, and the user is told if the retries run out.' },
      ],
    },
  },
  {
    n: 10, sims: ['stream'],
    related: [
      { href: '/makine-ogrenmesi/olay-dongusu', tr: 'Makine öğrenmesi: olay döngüsü', en: 'Machine learning: the event loop' },
      { href: '/makine-ogrenmesi/ci-cd-hatti', tr: 'Makine öğrenmesi: CI/CD hattı', en: 'Machine learning: the CI/CD pipeline' },
    ],
    tr: {
      title: 'Akışlı web sohbet arayüzü (JavaScript)',
      summary: 'Anahtarı sunucuda tutmak, Server-Sent Events, parça parça gelen baytları tamponlamak, durdurma düğmesi ve sohbet geçmişini sınırlamak.',
      goals: ['API anahtarının neden yalnız sunucuda durduğunu açıklamak', 'SSE olaylarının biçimini ve sırasını okumak', 'Bayt sınırından kesilen parçaları akışlı TextDecoder ve tamponla doğru birleştirmek', 'Durdurma, hata ve geçmiş sınırı olan bir sohbet istemcisi yazmak'],
      notes: `<p>Bir sohbet arayüzünde cevap birkaç saniye sürebilir. <b>Akış</b> (streaming) ile sunucu metni üretildikçe parça parça yollar; kullanıcı ilk kelimeyi hemen görür ve isterse cevabı yarıda durdurur.</p>
<h3>Mimari</h3>
<ul><li><b>Tarayıcı</b>: kullanıcının mesajını kendi sunucuna gönderir, gelen akışı okur ve ekrana yazar. API anahtarı burada asla bulunmaz; tarayıcıdaki her şey kullanıcı tarafından görülebilir.</li><li><b>Senin sunucun</b>: anahtarı ortam değişkeninden okur, Anthropic SDK ile akışlı isteği açar, gelen metni Server-Sent Events olarak tarayıcıya iletir. Kimlik doğrulama, hız sınırı, kişisel veri maskeleme ve kayıt burada yapılır.</li><li><b>API</b>: cevabı olaylar hâlinde yollar: <code>message_start</code>, <code>content_block_delta</code> (metin parçaları), <code>message_delta</code> (durma nedeni, kullanım), <code>message_stop</code>.</li></ul>
<h3>Baytlar, olaylar, metin</h3>
<p>Ağ veriyi olay sınırına göre değil, rastgele bayt sınırlarından keser. Bir parça bir olayın ortasında bitebilir, hatta iki baytlık bir Türkçe harfi ortadan bölebilir. İstemci bu yüzden üç şey yapar: <code>TextDecoder</code>'ı <code>stream: true</code> ile kullanır (yarım karakteri bir sonraki parçaya saklar), metni boş satırla (<code>\\n\\n</code>) biten olaylara böler ve son yarım olayı tamponda bekletir.</p>
<div class="eq">baytlar → akışlı çözme → tampon → olaylar → metin</div>
<h3>Kullanıcı deneyimi</h3>
<p>Durdurma düğmesi bir <code>AbortController</code> ile isteği keser; sunucu da bağlantı kapanınca modele giden akışı durdurur ki boşa token harcanmasın. Sohbet geçmişi her istekte yeniden gönderildiği için uzunluğu sınırlanır ya da eski mesajlar özetlenir. Hata olduğunda yarım kalan cevap işaretlenir ve yeniden deneme seçeneği sunulur. Bu sayfadaki simülasyonda sunucu ve ağ sahtedir; ayrıştırıcı ise gerçek kodun aynısıdır.</p>`,
      code: [streamServerJs('tr'), streamClientJs('tr')],
      lab: 'Akışlı sohbet simülasyonunda bir soru gönder ve ham olay günlüğünde "karakter bölündü" yazan bir parça bul. Azami parça boyunu 4 bayta indir ve yeniden gönder: metin yine doğru birleşti mi? Cevabı yarıda durdur ve durma nedeninin neden boş kaldığını açıkla. Son olarak istemci kodunda stream: true olmasaydı hangi karakterlerin bozulacağını tahmin et.',
      pitfalls: ['API anahtarını tarayıcı koduna ya da ön yüz ortam değişkenine koymak.', 'Her parçayı tek başına JSON sanıp ayrıştırmak: olay iki parçaya bölünmüş olabilir.', 'TextDecoder\'ı stream: true olmadan kullanmak: bölünen Türkçe harfler bozuk görünür.', 'Kullanıcı durdurunca sunucudaki akışı kapatmamak: model boşa token üretmeye devam eder.'],
      se: `<p>Akış ayrıştırıcısı küçük ama hataya açık bir <b>durum makinesidir</b>; deterministik testlerle sınanır.</p>
<ul><li>Aynı SSE metnini farklı tohumlarla rastgele bayt sınırlarından kesip ayrıştıran bir test yaz; çıkan metin her seferinde aynı olmalı (bu dersin testi böyle).</li><li>Sunucu uç noktası için uçtan uca test: sahte bir akış sağlayıcısıyla durdurma, hata ve zaman aşımı durumlarını sına.</li></ul>`,
      quiz: [
        { q: 'API anahtarı neden tarayıcı koduna konmaz?', options: ['Tarayıcı anahtarı okuyamaz', 'Tarayıcıdaki her şey kullanıcı tarafından görülebilir ve anahtar kötüye kullanılabilir', 'API tarayıcıdan gelen isteği yavaşlatır', 'Anahtar çok uzundur'], answer: 1, why: 'Ön yüz kodu ve ağ trafiği kullanıcıya açıktır; anahtar sunucuda, ortam değişkeninde tutulur.' },
        { q: 'TextDecoder\'da stream: true seçeneği ne işe yarar?', options: ['Ortadan bölünen çok baytlı karakteri bir sonraki parçaya saklar', 'Akışı hızlandırır', 'JSON\'u ayrıştırır', 'Bağlantıyı açık tutar'], answer: 0, why: 'Akışlı çözme yarım kalan bayt dizisini bekletir ve sonraki parçayla birleştirir.' },
        { q: 'SSE metninde bir olay neyle biter?', options: ['Noktalı virgülle', 'Kapanış etiketiyle', 'Boş bir satırla (iki satır sonu)', 'Sabit bir uzunlukla'], answer: 2, why: 'Olaylar "\\n\\n" ile ayrılır; son parça yarımsa tamponda beklenir.' },
        { q: 'Kullanıcı durdurma düğmesine bastığında sunucu ne yapmalı?', options: ['Akışı sürdürüp sonucu saklamalı', 'Hata kodu döndürüp yeniden başlatmalı', 'Hiçbir şey yapmamalı', 'Modele giden akışı da kesmeli ki boşa token harcanmasın'], answer: 3, why: 'Bağlantı kapanınca sunucu stream.abort() ile üretimi durdurur; aksi hâlde kimsenin okumadığı tokenlar faturalanır.' },
      ],
    },
    en: {
      title: 'A streaming web chat front-end (JavaScript)',
      summary: 'Keeping the key on the server, Server-Sent Events, buffering bytes that arrive in pieces, a stop button and limiting the chat history.',
      goals: ['Explain why the API key stays only on the server', 'Read the format and order of SSE events', 'Join pieces cut at byte boundaries correctly with a streaming TextDecoder and a buffer', 'Write a chat client with stop, errors and a history limit'],
      notes: `<p>In a chat interface an answer may take several seconds. With <b>streaming</b> the server sends the text piece by piece as it is produced; the user sees the first word at once and can stop the answer halfway.</p>
<h3>Architecture</h3>
<ul><li><b>Browser</b>: sends the user's message to your own server, reads the incoming stream and writes it on screen. The API key is never here; everything in the browser can be seen by the user.</li><li><b>Your server</b>: reads the key from an environment variable, opens a streaming request with the Anthropic SDK and forwards the text to the browser as Server-Sent Events. Authentication, rate limiting, personal data masking and logging happen here.</li><li><b>The API</b>: sends the answer as events: <code>message_start</code>, <code>content_block_delta</code> (text pieces), <code>message_delta</code> (stop reason, usage), <code>message_stop</code>.</li></ul>
<h3>Bytes, events, text</h3>
<p>The network cuts data at random byte boundaries, not at event boundaries. A piece can end in the middle of an event, and can even split a two-byte Turkish letter in half. The client therefore does three things: it uses <code>TextDecoder</code> with <code>stream: true</code> (which keeps a partial character for the next piece), splits the text into events ending in a blank line (<code>\\n\\n</code>), and keeps the last partial event in a buffer.</p>
<div class="eq">bytes → streaming decode → buffer → events → text</div>
<h3>User experience</h3>
<p>The stop button cuts the request with an <code>AbortController</code>; the server also stops the stream to the model when the connection closes, so no tokens are wasted. The chat history is sent again on every request, so its length is limited or old messages are summarised. On an error the partial answer is marked and a retry option is offered. In this page's simulation the server and network are fake; the parser is the same as the real code.</p>`,
      code: [streamServerJs('en'), streamClientJs('en')],
      lab: 'Send a question in the streaming chat simulation and find a piece marked "char split" in the raw event log. Lower the max chunk size to 4 bytes and send again: did the text still join correctly? Stop the answer halfway and explain why the stop reason stays empty. Finally guess which characters would break if the client code did not use stream: true.',
      pitfalls: ['Putting the API key in browser code or a front-end environment variable.', 'Parsing every piece as standalone JSON: an event may be split over two pieces.', 'Using TextDecoder without stream: true: split Turkish letters show up broken.', 'Not closing the stream on the server when the user stops: the model keeps producing tokens for nothing.'],
      se: `<p>A stream parser is a small but error-prone <b>state machine</b>; it is tested with deterministic tests.</p>
<ul><li>Write a test that cuts the same SSE text at random byte boundaries with different seeds and parses it; the resulting text must be the same every time (this course's test does exactly that).</li><li>End-to-end test for the server endpoint: with a fake stream provider, test stop, error and timeout cases.</li></ul>`,
      quiz: [
        { q: 'Why is the API key never put in browser code?', options: ['The browser cannot read the key', 'Everything in the browser can be seen by the user and the key could be abused', 'The API slows down requests from browsers', 'The key is too long'], answer: 1, why: 'Front-end code and network traffic are visible to the user; the key is kept on the server in an environment variable.' },
        { q: 'What does the stream: true option of TextDecoder do?', options: ['Keeps a multi-byte character split in half for the next piece', 'Speeds up the stream', 'Parses the JSON', 'Keeps the connection open'], answer: 0, why: 'Streaming decode holds back an incomplete byte sequence and joins it with the next piece.' },
        { q: 'What ends an event in SSE text?', options: ['A semicolon', 'A closing tag', 'A blank line (two line breaks)', 'A fixed length'], answer: 2, why: 'Events are separated by "\\n\\n"; if the last piece is partial it waits in the buffer.' },
        { q: 'What should the server do when the user presses the stop button?', options: ['Keep streaming and store the result', 'Return an error code and restart', 'Do nothing', 'Also cut the stream to the model so no tokens are wasted'], answer: 3, why: 'When the connection closes the server stops generation with stream.abort(); otherwise tokens nobody reads are billed.' },
      ],
    },
  },
]
