// LLM dersi üniteleri 1–5: tokenlar, gömmeler, prompt kalıpları, yapılandırılmış çıktı, RAG. HTML iki dilde aynı etiket dizisinde.
import { bpeStepJs, chunkRerankJs, cosineJs, countTokensPy, embedPy, promptBuilderJs, promptPy, ragPy, schemaPy, validatorJs } from './code-a'
import type { Unit } from './course'

export const UNITS_A: Unit[] = [
  {
    n: 1, sims: ['bpe'],
    related: [
      { href: '/ai-atolyesi', tr: 'AI atölyesi: tokenlaştırıcı ve bağlam penceresi aracı', en: 'AI workshop: tokenizer and context window tool' },
      { href: '/makine-ogrenmesi/mini-dil-modeli', tr: 'Makine öğrenmesi: mini dil modeli', en: 'Machine learning: mini language model' },
      { href: '/makine-ogrenmesi/dikkat-mekanizmasi', tr: 'Makine öğrenmesi: dikkat mekanizması', en: 'Machine learning: the attention mechanism' },
    ],
    tr: {
      title: 'Tokenlar, bağlam penceresi ve maliyet',
      summary: 'Model metni değil token görür. BPE nasıl çalışır, Türkçe neden daha çok token tutar, pencere ve fatura neden tokenla ölçülür.',
      goals: ['Bir dil modelinin bir sonraki tokenı tahmin ederek metin ürettiğini açıklamak', 'BPE birleştirmelerini elle birkaç adım uygulamak', 'Türkçe ve İngilizce metinlerin token sayısını karşılaştırmak', 'Bağlam penceresi, giriş ve çıkış tokenı ile maliyet arasındaki ilişkiyi hesaplamak'],
      notes: `<p>Büyük dil modeli (LLM) bir metnin devamını tahmin eden bir sinir ağıdır. Metni harf harf ya da kelime kelime değil <b>token</b> token işler: sık görülen kelimeler tek token, seyrek kelimeler birkaç parça olur. Model her adımda sözlükteki tüm tokenlar için bir olasılık hesaplar, birini seçer, ekler ve yeniden hesaplar.</p>
<h3>BPE: tokenlar nasıl doğar</h3>
<p>Byte Pair Encoding, derlemi önce karakterlere (gerçek sistemlerde baytlara) böler. Sonra en sık yan yana gelen iki parçayı yeni bir parça olarak birleştirir ve sayımı tekrarlar. Birkaç bin birleştirmeden sonra "motor", "sensör" gibi kelimeler tek parçaya iner. Yeni bir metin kodlanırken öğrenilen birleştirmeler <i>aynı sırayla</i> uygulanır.</p>
<ul><li>Türkçe sondan eklemeli bir dildir: "bağlayamadıklarımızdan" gibi bir kelime çoğu sözlükte birkaç tokena bölünür. Aynı anlamı taşıyan Türkçe metin genellikle İngilizcesinden daha çok token tutar.</li><li>Ş, ğ, ı gibi harfler UTF-8'de iki bayttır; bayt düzeyindeki bir tokenlaştırıcı onları da birleştirmeyi öğrenmek zorundadır.</li><li>Sayılar, kod ve boşluklar da token tüketir; uzun bir JSON şeması prompta sanıldığından pahalıya gelir.</li></ul>
<h3>Bağlam penceresi ve fatura</h3>
<p>Modelin tek istekte gördüğü her şey (sistem promptu, sohbet geçmişi, belgeler, araç tanımları ve üreteceği cevap) <b>bağlam penceresine</b> sığmak zorundadır. API faturası da tokenla kesilir: giriş ve çıkış tokenlarının fiyatı ayrıdır, çıkış genellikle birkaç kat pahalıdır.</p>
<div class="eq">maliyet = giriş_tokenı × giriş_fiyatı + çıkış_tokenı × çıkış_fiyatı</div>
<p>Token sayısını tahmin etmek yerine ölç: Anthropic SDK'daki <code>count_tokens</code> çağrısı isteği göndermeden sayar. Bu derste simülasyonlar tarayıcıda çalışan küçük bir BPE kullanır; gerçek modelin sözlüğü çok daha büyüktür ama mantık aynıdır.</p>`,
      code: [countTokensPy('tr'), bpeStepJs('tr')],
      lab: 'BPE oyun alanında birleştirmeyi 0\'dan 40\'a çıkar ve aynı cümlenin token sayısını izle. Türkçe ve İngilizce derlem arasında geçiş yap: Türkçe cümlen İngilizce derlemle eğitilmiş sözlükte kaç token tutuyor? Son olarak "Kendi derlemim"e kendi alanından on kelime yaz ve hangi birleştirmelerin ilk öğrenildiğine bak.',
      pitfalls: ['Token sayısını kelime sayısı sanmak: Türkçede bir kelime çoğu zaman birkaç tokendır.', 'Maliyet hesabında yalnız giriş tokenını saymak: çıkış tokenı genellikle çok daha pahalıdır.', 'Bağlam penceresine cevap için yer bırakmamak: max_tokens da pencereden pay alır.', 'Farklı modellerin aynı tokenlaştırıcıyı kullandığını varsaymak: model değişince sayımı yeniden ölç.'],
      se: `<p>Token sayısı bir <b>kaynak bütçesidir</b>; bellek ve süre gibi ölçülür ve izlenir.</p>
<ul><li>Her isteğin giriş ve çıkış token sayısını kayıt altına al (API cevabındaki <code>usage</code> alanı); maliyet ve gecikme raporu buradan çıkar.</li><li>Prompt şablonlarını sürüm denetiminde tut ve her değişiklikte token sayısını ölçen küçük bir test yaz: şablon sessizce iki katına çıkmasın.</li></ul>`,
      quiz: [
        { q: 'BPE eğitiminde her adımda ne yapılır?', options: ['Derlemdeki en sık yan yana gelen iki parça birleştirilir', 'En uzun kelime sözlükten çıkarılır', 'Kelimeler alfabetik sıralanır', 'Her harfe rastgele bir numara verilir'], answer: 0, why: 'BPE en sık görülen bitişik çifti yeni bir parça yapar ve sayımı yeniler; bu birkaç bin kez tekrarlanır.' },
        { q: 'Aynı anlamdaki Türkçe bir paragraf İngilizce eğitilmiş bir tokenlaştırıcıda neden genellikle daha çok token tutar?', options: ['Türkçe cümleler daha kısadır', 'Sondan eklemeli kelimeler ve iki baytlık harfler daha çok parçaya bölünür', 'Model Türkçeyi okuyamaz', 'Türkçede noktalama yoktur'], answer: 1, why: 'Ekler kelimeleri uzatır, ş/ğ/ı gibi harfler UTF-8\'de iki bayttır; sözlükte tek parça olarak bulunma olasılıkları düşer.' },
        { q: 'Bir istekte 6000 giriş ve 400 çıkış tokenı var; fiyatlar milyon token başına giriş 2 $, çıkış 10 $. İstek kaç dolar tutar?', options: ['0,0064 $', '0,0120 $', '0,0160 $', '0,0400 $'], answer: 2, why: '6000 × 2 / 1 000 000 = 0,012 $ ve 400 × 10 / 1 000 000 = 0,004 $; toplam 0,016 $.' },
        { q: 'Bağlam penceresine hangisi dahil değildir?', options: ['Sistem promptu', 'Sohbet geçmişi', 'Modelin üreteceği cevap', 'Modelin eğitildiği tüm veri'], answer: 3, why: 'Pencere tek istekte görülen metindir: sistem, geçmiş, belgeler, araçlar ve cevap. Eğitim verisi modelin ağırlıklarındadır, pencerede değil.' },
      ],
    },
    en: {
      title: 'Tokens, the context window and cost',
      summary: 'The model sees tokens, not text. How BPE works, why Turkish takes more tokens, why the window and the bill are measured in tokens.',
      goals: ['Explain that a language model produces text by predicting the next token', 'Apply a few BPE merges by hand', 'Compare the token counts of Turkish and English texts', 'Calculate the link between the context window, input and output tokens and cost'],
      notes: `<p>A large language model (LLM) is a neural network that predicts how a text continues. It does not process text letter by letter or word by word but <b>token</b> by token: frequent words are one token, rare words become several pieces. At each step the model computes a probability for every token in its vocabulary, picks one, appends it and computes again.</p>
<h3>BPE: how tokens are born</h3>
<p>Byte Pair Encoding first splits the corpus into characters (bytes in real systems). It then merges the two pieces that appear next to each other most often into a new piece and repeats the count. After a few thousand merges words like "motor" and "sensor" collapse into single pieces. When a new text is encoded, the learned merges are applied <i>in the same order</i>.</p>
<ul><li>Turkish is agglutinative: a word like "bağlayamadıklarımızdan" splits into several tokens in most vocabularies. A Turkish text with the same meaning usually takes more tokens than its English version.</li><li>Letters such as ş, ğ and ı are two bytes in UTF-8; a byte-level tokenizer has to learn to merge them too.</li><li>Numbers, code and whitespace also use tokens; a long JSON schema costs more in a prompt than you might think.</li></ul>
<h3>Context window and the bill</h3>
<p>Everything the model sees in one request (system prompt, chat history, documents, tool definitions and the answer it will produce) must fit in the <b>context window</b>. The API bill is also counted in tokens: input and output tokens have separate prices, and output is usually several times more expensive.</p>
<div class="eq">cost = input_tokens × input_price + output_tokens × output_price</div>
<p>Measure the token count instead of guessing: the <code>count_tokens</code> call in the Anthropic SDK counts without sending the request. In this course the simulations use a small BPE running in the browser; a real model's vocabulary is far larger but the logic is the same.</p>`,
      code: [countTokensPy('en'), bpeStepJs('en')],
      lab: 'In the BPE playground raise the merges from 0 to 40 and watch the token count of the same sentence. Switch between the Turkish and English corpora: how many tokens does your Turkish sentence take with a vocabulary trained on English? Finally type ten words from your own field into "My own corpus" and see which merges are learned first.',
      pitfalls: ['Taking the token count for the word count: in Turkish one word is often several tokens.', 'Counting only input tokens in a cost estimate: output tokens are usually much more expensive.', 'Leaving no room for the answer in the context window: max_tokens also takes a share of the window.', 'Assuming different models use the same tokenizer: measure again when the model changes.'],
      se: `<p>The token count is a <b>resource budget</b>; it is measured and monitored like memory and time.</p>
<ul><li>Log the input and output token count of every request (the <code>usage</code> field in the API response); cost and latency reports come from there.</li><li>Keep prompt templates under version control and write a small test that measures their token count on every change, so a template does not silently double.</li></ul>`,
      quiz: [
        { q: 'What happens at each step of BPE training?', options: ['The two pieces that appear next to each other most often are merged', 'The longest word is removed from the vocabulary', 'Words are sorted alphabetically', 'Every letter gets a random number'], answer: 0, why: 'BPE turns the most frequent adjacent pair into a new piece and recounts; this repeats a few thousand times.' },
        { q: 'Why does a Turkish paragraph usually take more tokens than the same meaning in English with an English-trained tokenizer?', options: ['Turkish sentences are shorter', 'Agglutinative words and two-byte letters split into more pieces', 'The model cannot read Turkish', 'Turkish has no punctuation'], answer: 1, why: 'Suffixes make words longer and some Turkish letters are two bytes in UTF-8, so they are less likely to exist as single pieces in the vocabulary.' },
        { q: 'A request has 6000 input and 400 output tokens; prices per million tokens are $2 input and $10 output. What does the request cost?', options: ['$0.0064', '$0.0120', '$0.0160', '$0.0400'], answer: 2, why: '6000 × 2 / 1,000,000 = $0.012 and 400 × 10 / 1,000,000 = $0.004; total $0.016.' },
        { q: 'Which of these is not part of the context window?', options: ['The system prompt', 'The chat history', 'The answer the model will produce', 'All the data the model was trained on'], answer: 3, why: 'The window is the text seen in one request: system, history, documents, tools and the answer. Training data lives in the weights, not in the window.' },
      ],
    },
  },
  {
    n: 2, sims: ['embed'],
    related: [
      { href: '/makine-ogrenmesi/kelime-vektorleri', tr: 'Makine öğrenmesi: kelime vektörleri', en: 'Machine learning: word vectors' },
      { href: '/makine-ogrenmesi/pca', tr: 'Makine öğrenmesi: temel bileşen analizi (PCA)', en: 'Machine learning: principal component analysis (PCA)' },
    ],
    tr: {
      title: 'Gömmeler ve anlamsal benzerlik',
      summary: 'Metni sayı vektörüne çevirmek, kosinüs benzerliği, en yakın komşu araması ve yüksek boyutu düzlemde görmek.',
      goals: ['Gömme vektörünün ne olduğunu ve nereden geldiğini açıklamak', 'Kosinüs benzerliğini elle ve kodla hesaplamak', 'Bir soruya en yakın cümleleri vektör aramasıyla bulmak', 'Öğretim gömmesinin sınırını (yüzey ve anlam farkı) göstermek'],
      notes: `<p><b>Gömme</b> (embedding), bir metni sabit uzunlukta bir sayı vektörüne çeviren fonksiyondur. İyi bir gömme modelinde anlamca yakın metinler uzayda yakın düşer: "batarya kaç volta inebilir" ile "hücre gerilimi alt sınırı" farklı kelimelerle aynı şeyi sorar ve vektörleri benzer olur.</p>
<h3>Benzerliği ölçmek</h3>
<div class="eq">kosinüs(a, b) = (a · b) / (|a| |b|)</div>
<p>Kosinüs benzerliği iki vektör arasındaki açıya bakar, uzunluğa değil: 1 aynı yön, 0 ilgisiz, negatif zıt yön demektir. Vektörler birim uzunluğa getirilmişse kosinüs basit bir nokta çarpımıdır; vektör veritabanları bu yüzden çoğu zaman normalize vektör saklar.</p>
<h3>Bu dersteki öğretim gömmesi</h3>
<p>Gerçek gömme modelleri milyarlarca cümleyle eğitilmiş sinir ağlarıdır ve bir sağlayıcının API'si ya da açık bir model üzerinden çağrılır. Bu sayfa hiçbir dış servise istek göndermediği için simülasyonlar küçük bir <b>öğretim gömmesi</b> kullanır: metni kelime gövdelerine ve harf üçlülerine böler, her özelliği sabit bir karma fonksiyonuyla 64 boyuttan birine atar ve toplar (hashing trick).</p>
<ul><li>Deterministiktir: aynı metin her zaman aynı vektörü verir, eğitim gerekmez.</li><li>Yüzey örtüşmesini yakalar: ortak kelime ya da ek paylaşan cümleler yakın düşer.</li><li>Anlamı yakalamaz: eş anlamlı ama farklı yazılan cümleler uzak kalabilir. Bu sınırı simülasyonda bilerek göreceksin.</li></ul>
<h3>Düzlemde görmek</h3>
<p>64 boyut ekrana sığmaz. PCA, verinin en çok yayıldığı iki yönü bulur ve noktaları bu düzleme izdüşürür. İzdüşümde yakın görünen iki nokta gerçekte uzak olabilir; mesafeyi her zaman tam vektörde ölç.</p>`,
      code: [embedPy('tr'), cosineJs('tr')],
      lab: 'Gömme görüntüleyicide "LiPo hücre gerilimi en az kaç volt olmalı?" sorusunun en yakın üç cümlesine bak. Sonra aynı soruyu "Batarya kaç volta kadar boşaltılabilir?" diye yeniden yaz: komşular değişti mi, neden? Özellik türünü "Yalnız harf üçlüsü" yapıp ekleri farklı kelimelerin nasıl yakınlaştığını gözle. Bulduğun bir başarısızlığı (anlamca yakın ama uzak düşen cümle) not et.',
      pitfalls: ['PCA izdüşümündeki görsel mesafeyi gerçek benzerlik sanmak: arama tam vektörde yapılır.', 'Farklı gömme modellerinin vektörlerini aynı dizinde karıştırmak: boyutlar ve uzaylar uyuşmaz.', 'Belgeleri bir modelle, soruları başka bir modelle gömmek.', 'Benzerlik eşiğini bir kez seçip veri değişince yeniden ölçmemek.'],
      se: `<p>Gömme bir <b>sürümlü artefakttır</b>: model değişirse tüm dizin yeniden üretilir.</p>
<ul><li>Dizinde her vektörün yanında gömme modelinin adı ve sürümü saklansın; karışık sürüm sorgusu hata versin.</li><li>Küçük bir altın küme (soru ve beklenen en yakın belge) tut ve gömme değişikliğinden sonra isabet oranını otomatik ölç.</li></ul>`,
      quiz: [
        { q: 'İki birim vektörün nokta çarpımı 0,92. Kosinüs benzerliği kaçtır?', options: ['0,08', '0,46', '0,92', '1,84'], answer: 2, why: 'Birim vektörlerde |a| = |b| = 1 olduğundan kosinüs nokta çarpımına eşittir.' },
        { q: 'Kosinüs benzerliği neden vektör uzunluğundan bağımsızdır?', options: ['Yalnız vektörler arasındaki açıya bakar', 'Uzunluğu her zaman 64 alır', 'Vektörleri sıralar', 'Yalnız ilk boyutu kullanır'], answer: 0, why: 'Nokta çarpımı uzunlukların çarpımına bölünür; geriye açının kosinüsü kalır.' },
        { q: 'Bu dersteki öğretim gömmesi hangi durumda yanılır?', options: ['Aynı kelimeleri paylaşan iki cümlede', 'Eş anlamlı ama hiç ortak kelimesi olmayan iki cümlede', 'Aynı cümlenin iki kopyasında', 'Boş metinde'], answer: 1, why: 'Kelime ve harf üçlüsü karmasına dayanır; ortak yüzey yoksa vektörler yakınlaşmaz. Gerçek gömme modelleri anlamı da öğrenir.' },
        { q: 'Belgeleri yeni bir gömme modeline geçirirken ne yapılmalı?', options: ['Yalnız yeni belgeleri yeni modelle gömmek', 'Soruları eski modelle gömmeye devam etmek', 'Eşiği değiştirmemek', 'Tüm dizini yeni modelle yeniden üretmek ve altın kümeyle ölçmek'], answer: 3, why: 'Farklı modellerin uzayları uyuşmaz; dizin baştan üretilir ve isabet yeniden ölçülür.' },
      ],
    },
    en: {
      title: 'Embeddings and semantic similarity',
      summary: 'Turning text into a vector of numbers, cosine similarity, nearest-neighbour search and seeing high dimensions on a plane.',
      goals: ['Explain what an embedding vector is and where it comes from', 'Compute cosine similarity by hand and in code', 'Find the sentences nearest to a question with vector search', 'Show the limit of the teaching embedding (surface versus meaning)'],
      notes: `<p>An <b>embedding</b> is a function that turns a text into a fixed-length vector of numbers. In a good embedding model, texts with close meanings land close together in space: "how far can a battery be discharged" and "lower limit of cell voltage" ask the same thing with different words, and their vectors are similar.</p>
<h3>Measuring similarity</h3>
<div class="eq">cosine(a, b) = (a · b) / (|a| |b|)</div>
<p>Cosine similarity looks at the angle between two vectors, not their length: 1 means the same direction, 0 unrelated, negative the opposite direction. If the vectors are scaled to unit length, cosine is a simple dot product; that is why vector databases often store normalised vectors.</p>
<h3>The teaching embedding in this course</h3>
<p>Real embedding models are neural networks trained on billions of sentences and called through a provider's API or an open model. Because this page never sends a request to any external service, the simulations use a small <b>teaching embedding</b>: it splits the text into word stems and character trigrams, assigns each feature to one of 64 dimensions with a fixed hash function and adds them up (the hashing trick).</p>
<ul><li>It is deterministic: the same text always gives the same vector, no training needed.</li><li>It captures surface overlap: sentences sharing words or suffixes land close together.</li><li>It does not capture meaning: synonymous sentences written differently can stay far apart. You will see this limit on purpose in the simulation.</li></ul>
<h3>Seeing it on a plane</h3>
<p>64 dimensions do not fit on a screen. PCA finds the two directions along which the data spreads most and projects the points onto that plane. Two points that look close in the projection may be far apart in reality; always measure distance on the full vector.</p>`,
      code: [embedPy('en'), cosineJs('en')],
      lab: 'In the embedding viewer look at the three sentences nearest to "What voltage must a LiPo cell not go below?". Then rewrite the question as "How far can a battery be discharged?": did the neighbours change, and why? Set the feature type to "Character trigrams only" and watch words with different suffixes move closer. Note one failure you found (a sentence close in meaning that lands far away).',
      pitfalls: ['Taking the visual distance in the PCA projection for real similarity: search runs on the full vector.', 'Mixing vectors from different embedding models in one index: dimensions and spaces do not match.', 'Embedding documents with one model and questions with another.', 'Choosing a similarity threshold once and not measuring again when the data changes.'],
      se: `<p>An embedding is a <b>versioned artefact</b>: if the model changes, the whole index is rebuilt.</p>
<ul><li>Store the embedding model name and version next to every vector in the index; a mixed-version query should fail.</li><li>Keep a small gold set (question and expected nearest document) and measure the hit rate automatically after every embedding change.</li></ul>`,
      quiz: [
        { q: 'The dot product of two unit vectors is 0.92. What is their cosine similarity?', options: ['0.08', '0.46', '0.92', '1.84'], answer: 2, why: 'For unit vectors |a| = |b| = 1, so cosine equals the dot product.' },
        { q: 'Why is cosine similarity independent of vector length?', options: ['It only looks at the angle between the vectors', 'It always takes the length as 64', 'It sorts the vectors', 'It only uses the first dimension'], answer: 0, why: 'The dot product is divided by the product of the lengths; what remains is the cosine of the angle.' },
        { q: 'When does the teaching embedding in this course get it wrong?', options: ['With two sentences that share the same words', 'With two synonymous sentences that share no words', 'With two copies of the same sentence', 'With an empty text'], answer: 1, why: 'It relies on hashing words and trigrams; without shared surface the vectors do not move closer. Real embedding models also learn meaning.' },
        { q: 'What should you do when moving documents to a new embedding model?', options: ['Embed only new documents with the new model', 'Keep embedding questions with the old model', 'Leave the threshold unchanged', 'Rebuild the whole index with the new model and measure with the gold set'], answer: 3, why: 'The spaces of different models do not match; the index is rebuilt and the hit rate measured again.' },
      ],
    },
  },
  {
    n: 3, sims: ['prompt'],
    related: [
      { href: '/ai-atolyesi', tr: 'AI atölyesi: prompt kontrolcüsü', en: 'AI workshop: prompt checker' },
      { href: '/moduller/ai-muhendisligi', tr: 'AI Mühendisliği modülü (13+ yaş)', en: 'AI Engineering module (age 13+)' },
    ],
    tr: {
      title: 'Prompt kalıpları: görevi açıkça tarif etmek',
      summary: 'Sıfır atış, birkaç örnekli, rol ve kurallar, adım adım plan ve etiketlerle ayrılmış veri. Sistem promptu ve sıcaklık yerine açıklık.',
      goals: ['Beş temel prompt kalıbını tanımak ve göreve göre seçmek', 'Sistem promptu ile kullanıcı mesajının görevlerini ayırmak', 'Veriyi talimattan etiketlerle ayırmak', 'Bir promptu kontrol listesiyle gözden geçirmek ve sürümlemek'],
      notes: `<p>Prompt, modele verilen iş tanımıdır. İyi bir prompt zeki ama bağlamı bilmeyen yeni bir çalışana verilecek talimat gibi yazılır: kim olduğu, ne yapacağı, neye göre yapacağı, sonucu hangi biçimde vereceği ve emin olmadığında ne yapacağı.</p>
<h3>Beş kalıp</h3>
<ul><li><b>Sıfır atış</b>: yalnız görev. Basit ve iyi tanımlı işlerde yeter.</li><li><b>Birkaç örnekli</b>: iki üç girdi ve beklenen çıktı örneği. Biçimi ve sınır durumlarını göstermenin en kısa yolu.</li><li><b>Rol ve kurallar</b>: modelin rolü, uyacağı kurallar ve çıktı biçimi. Sistem promptunun tipik içeriği.</li><li><b>Adım adım plan</b>: görevi sıralı alt adımlara böler. Çok adımlı hesap ve karar işlerinde hataları azaltır.</li><li><b>Etiketlerle ayrılmış veri</b>: girdiyi <code>&lt;girdi&gt;</code> gibi etiketlerle sarar. Model veriyi talimat sanmaz ve kullanıcı metnindeki "önceki kuralları unut" cümlesi talimat olarak okunmaz (8. ünite).</li></ul>
<h3>Sistem promptu ve mesajlar</h3>
<p>Anthropic API'de <code>system</code> alanı uygulamanın sabit kurallarını, <code>messages</code> dizisi sohbetin kendisini taşır. Kararlı içeriği (kurallar, örnekler, uzun notlar) başa, değişen içeriği (kullanıcının sorusu) sona koymak hem okunurluğu hem önbelleği (9. ünite) iyileştirir.</p>
<h3>Belirsizlik ve çıktı biçimi</h3>
<p>Modele emin olmadığında ne yapacağını söylemezsen boşluğu kendisi doldurur. "Notlarda yoksa bilmiyorum de" gibi bir kural uydurmayı azaltır. Çıktının bir program tarafından okunacağı durumda biçimi açıkça tanımla; daha sağlam yol 4. ünitedeki şemalı çıktıdır.</p>
<p>Prompt yazmak bir kez yapılıp biten iş değildir: her değişiklik bir değerlendirme kümesiyle (7. ünite) ölçülür ve sürüm denetiminde tutulur.</p>`,
      code: [promptPy('tr'), promptBuilderJs('tr')],
      lab: 'Prompt atölyesinde "Öğrenci sorusunu konuya ayır" görevini önce sıfır atışla, sonra etiketlerle ayrılmış veriyle kur. Kontrol listesinde hangi maddeler açıldı, token sayısı ne kadar arttı? Ardından "Ders notunu özetle" görevinde birkaç örnekli kalıbı seç ve örneğin çıktının biçimini nasıl belirlediğini açıkla.',
      pitfalls: ['Modelin bağlamı bildiğini varsaymak: dersin adı, öğrenci düzeyi, çıktının kime gideceği yazılmalı.', 'Kullanıcı metnini talimatın ortasına etiketsiz yapıştırmak.', 'Birbiriyle çelişen kurallar yazmak ("kısa yaz" ve "her ayrıntıyı açıkla").', 'Promptu değiştirip sonucu birkaç örnekte göz kararı denemek, ölçmemek.'],
      se: `<p>Prompt bir <b>kaynak kod</b> parçasıdır: gözden geçirilir, sürümlenir, test edilir.</p>
<ul><li>Promptları koddan ayrı dosyalarda tut, değişkenleri şablonla doldur; her değişiklik bir çekme isteğiyle incelensin.</li><li>Değerlendirme kümesini her prompt değişikliğinde otomatik koştur; puan düşerse birleştirme engellensin.</li></ul>`,
      quiz: [
        { q: 'Kullanıcının yapıştırdığı belgeyi neden etiketlerle sarmak gerekir?', options: ['Daha az token harcar', 'Model veriyi talimattan ayırabilir', 'API etiketsiz metni reddeder', 'Cevabı hızlandırır'], answer: 1, why: 'Etiketler verinin sınırını belirler; belgenin içindeki emir cümleleri talimat olarak değil veri olarak okunur.' },
        { q: 'Çıktı biçimini iki örnekle göstermek hangi kalıptır?', options: ['Sıfır atış', 'Adım adım plan', 'Birkaç örnekli', 'Rol ve kurallar'], answer: 2, why: 'Girdi ve beklenen çıktı örnekleri vermek birkaç örnekli (few-shot) kalıptır.' },
        { q: 'Sistem promptuna en uygun içerik hangisidir?', options: ['Uygulamanın sabit rolü, kuralları ve çıktı biçimi', 'Kullanıcının o anki sorusu', 'Günün saati', 'Rastgele bir örnek'], answer: 0, why: 'Sabit kurallar sistem promptunda, değişen içerik mesajlarda durur; kararlı ön ek önbelleğe de uygundur.' },
        { q: 'Uydurmayı azaltan kural hangisidir?', options: ['"Her zaman bir cevap ver"', '"Uzun yaz"', '"Yaratıcı ol"', '"Cevap notlarda yoksa bilmiyorum de"'], answer: 3, why: 'Modele belirsizlikte ne yapacağını söylemek boşluğu uydurmayla doldurmasını engeller.' },
      ],
    },
    en: {
      title: 'Prompting patterns: describing the task clearly',
      summary: 'Zero-shot, few-shot, role and rules, step-by-step plan and data separated by tags. Clarity over the system prompt and temperature.',
      goals: ['Recognise five basic prompting patterns and choose one for the task', 'Separate the jobs of the system prompt and the user message', 'Separate data from instructions with tags', 'Review a prompt with a checklist and version it'],
      notes: `<p>A prompt is the job description given to the model. A good prompt is written like instructions for a smart new colleague who lacks context: who they are, what to do, based on what, in which format to deliver, and what to do when unsure.</p>
<h3>Five patterns</h3>
<ul><li><b>Zero-shot</b>: the task only. Enough for simple, well-defined jobs.</li><li><b>Few-shot</b>: two or three examples of input and expected output. The shortest way to show the format and edge cases.</li><li><b>Role and rules</b>: the model's role, the rules it follows and the output format. Typical content of a system prompt.</li><li><b>Step-by-step plan</b>: splits the task into ordered sub-steps. Reduces errors in multi-step calculation and decision tasks.</li><li><b>Data separated by tags</b>: wraps the input in tags such as <code>&lt;input&gt;</code>. The model does not mistake data for instructions, and a sentence like "forget the previous rules" in user text is not read as an instruction (unit 8).</li></ul>
<h3>System prompt and messages</h3>
<p>In the Anthropic API the <code>system</code> field carries the application's fixed rules and the <code>messages</code> array carries the conversation itself. Putting stable content (rules, examples, long notes) first and changing content (the user's question) last improves both readability and caching (unit 9).</p>
<h3>Uncertainty and output format</h3>
<p>If you do not tell the model what to do when unsure, it fills the gap itself. A rule like "if it is not in the notes, say you do not know" reduces made-up answers. When a program will read the output, define the format explicitly; the sturdier way is schema output in unit 4.</p>
<p>Writing a prompt is not a one-off job: every change is measured with an evaluation set (unit 7) and kept under version control.</p>`,
      code: [promptPy('en'), promptBuilderJs('en')],
      lab: 'In the prompt workshop build the task "Route a student question to a topic" first as zero-shot, then with data separated by tags. Which checklist items turned on, and how much did the token count grow? Then pick the few-shot pattern for "Summarise a course note" and explain how the example sets the output format.',
      pitfalls: ['Assuming the model knows the context: the course name, the student level and who receives the output must be written.', 'Pasting user text into the middle of the instructions without tags.', 'Writing rules that contradict each other ("be brief" and "explain every detail").', 'Changing the prompt and eyeballing the result on a few examples instead of measuring.'],
      se: `<p>A prompt is a piece of <b>source code</b>: reviewed, versioned, tested.</p>
<ul><li>Keep prompts in files separate from code and fill variables with a template; every change is reviewed through a pull request.</li><li>Run the evaluation set automatically on every prompt change; block the merge if the score drops.</li></ul>`,
      quiz: [
        { q: 'Why wrap a document pasted by the user in tags?', options: ['It uses fewer tokens', 'The model can tell data from instructions', 'The API rejects untagged text', 'It speeds up the answer'], answer: 1, why: 'Tags mark the boundary of the data; command sentences inside the document are read as data, not as instructions.' },
        { q: 'Which pattern shows the output format with two examples?', options: ['Zero-shot', 'Step-by-step plan', 'Few-shot', 'Role and rules'], answer: 2, why: 'Giving examples of input and expected output is the few-shot pattern.' },
        { q: 'Which content fits the system prompt best?', options: ['The application\'s fixed role, rules and output format', 'The user\'s current question', 'The time of day', 'A random example'], answer: 0, why: 'Fixed rules live in the system prompt, changing content in the messages; a stable prefix also suits caching.' },
        { q: 'Which rule reduces made-up answers?', options: ['"Always give an answer"', '"Write long"', '"Be creative"', '"If the answer is not in the notes, say you do not know"'], answer: 3, why: 'Telling the model what to do when unsure stops it from filling the gap with invention.' },
      ],
    },
  },
  {
    n: 4, sims: ['schema'],
    related: [
      { href: '/ai-atolyesi', tr: 'AI atölyesi: JSON çıktı denetimi', en: 'AI workshop: JSON output check' },
    ],
    tr: {
      title: 'Yapılandırılmış çıktı: JSON şeması ve onarım döngüsü',
      summary: 'Modelden programın okuyabileceği veri almak: JSON Schema, doğrulama, hata yolları ve modele geri dönen onarım mesajı.',
      goals: ['Bir JSON şemasında tür, zorunlu alan, enum ve sınır kurallarını yazmak', 'Model çıktısından JSON\'u güvenle çıkarmak', 'Doğrulama hatalarını yollarıyla raporlamak', 'Sınırlı sayıda denemeli bir onarım döngüsü tasarlamak'],
      notes: `<p>Bir modelin cevabını bir program okuyacaksa serbest metin yetmez. "Öğrenci numarası, deney adı, puan" gibi alanları her seferinde aynı biçimde almak için çıktıyı bir <b>JSON şeması</b> ile tanımlarız.</p>
<h3>Şemanın kuralları</h3>
<ul><li><code>type</code>: string, integer, number, boolean, array, object.</li><li><code>required</code> ve <code>additionalProperties: false</code>: hangi alanların şart olduğu ve fazladan alanın kabul edilmeyeceği.</li><li><code>enum</code>, <code>minimum</code>, <code>maximum</code>, <code>pattern</code>, <code>minItems</code>: değerin izin verilen aralığı.</li></ul>
<h3>Üç savunma hattı</h3>
<p>Birincisi, API'nin yapılandırılmış çıktı özelliğidir: Anthropic API'de <code>output_config</code> ile bir şema verildiğinde cevap o şemaya uyacak biçimde üretilir ve SDK'nın <code>parse</code> yardımcısı sonucu doğrudan bir nesneye çevirir. İkincisi, kendi doğrulayıcındır: ağdan, önbellekten ya da eski bir sürümden gelen veriye yine de güvenme, uygulamanın sınırında doğrula. Üçüncüsü, <b>onarım döngüsüdür</b>: doğrulama başarısızsa hataları yollarıyla birlikte modele geri gönder ve yalnız o alanları düzeltmesini iste.</p>
<div class="eq">üret → çıkar → doğrula → (hata varsa) onarım mesajı → en çok N deneme</div>
<h3>Metin çevresinde JSON</h3>
<p>Şemasız istendiğinde model JSON\'u "Tabii, işte özet:" gibi bir cümlenin ve kod bloğunun içine koyabilir. Çıkarıcı önce tüm metni, sonra kod bloğunu, sonra ilk süslü parantezle son süslü parantez arasını dener. Bu bir yamadır; asıl çözüm şemalı çıktı ve açık biçim talimatıdır.</p>
<p>Onarım döngüsü sınırsız olmamalıdır: iki üç denemeden sonra hâlâ geçersizse isteği hatalı say, kaydet ve kullanıcıya anlaşılır bir mesaj göster.</p>`,
      code: [schemaPy('tr'), validatorJs('tr')],
      lab: 'Şema doğrulayıcıda altı örneği sırayla dene ve her birinde hangi kuralın bozulduğunu yaz. "Eksik alan" örneğini elle düzelt: puan alanını ekle ve 101 yap, sonra 100 yap. "Bozuk JSON" örneğinde onarım mesajının şema hatası mesajından nasıl farklı olduğunu karşılaştır.',
      pitfalls: ['Modelin her zaman geçerli JSON döndüreceğini varsaymak ve ayrıştırma hatasını yakalamamak.', 'Sayıyı metin olarak ("88") kabul edip sonra hesapta hata almak.', 'Onarım döngüsüne deneme sınırı koymamak: hata sürerse maliyet büyür.', 'Fazladan alanlara izin verip sonra veritabanına beklenmeyen sütun yazmak.'],
      se: `<p>Şema, model ile uygulaman arasındaki <b>arayüz sözleşmesidir</b>.</p>
<ul><li>Şemayı tek bir yerde tanımla (Pydantic, Zod) ve hem API isteğinde hem doğrulamada aynısını kullan.</li><li>Sözleşme testleri yaz: her örnek çıktı için beklenen hata kodları sabitlensin; şema değişince testler hangi istemcilerin kırılacağını gösterir.</li></ul>`,
      quiz: [
        { q: '"puan": "88" değeri, puan için type: integer olan şemada hangi hatayı verir?', options: ['required', 'type', 'enum', 'pattern'], answer: 1, why: 'Değer bir string; şema integer istiyor. Tür hatası.' },
        { q: 'additionalProperties: false ne sağlar?', options: ['Şemada olmayan alanlar reddedilir', 'Tüm alanlar isteğe bağlı olur', 'Diziler boş olamaz', 'Sayılar yuvarlanır'], answer: 0, why: 'Tanımlanmamış alan geldiğinde doğrulama "extra" hatası verir.' },
        { q: 'Onarım döngüsüne neden bir deneme sınırı konur?', options: ['API iki denemeden fazlasını reddeder', 'Şema değişmesin diye', 'Kalıcı hatada maliyet ve gecikme sınırsız büyümesin diye', 'JSON daha kısa olsun diye'], answer: 2, why: 'Her deneme yeni bir istektir; sınır yoksa kalıcı bir hata sonsuz döngüye ve faturaya dönüşür.' },
        { q: 'API\'nin yapılandırılmış çıktı özelliği kullanılıyorsa kendi doğrulayıcın hâlâ gerekli mi?', options: ['Hayır, asla', 'Yalnız İngilizce metinde', 'Yalnız diziler için', 'Evet, uygulamanın sınırında gelen her veriyi doğrulamak iyi bir alışkanlıktır'], answer: 3, why: 'Veri önbellekten, eski sürümden ya da başka bir yoldan da gelebilir; sınırda doğrulama derinlemesine savunmadır.' },
      ],
    },
    en: {
      title: 'Structured output: JSON schema and the repair loop',
      summary: 'Getting data a program can read from the model: JSON Schema, validation, error paths and the repair message sent back to the model.',
      goals: ['Write type, required field, enum and bound rules in a JSON schema', 'Extract JSON from model output safely', 'Report validation errors with their paths', 'Design a repair loop with a limited number of attempts'],
      notes: `<p>If a program will read the model's answer, free text is not enough. To get fields like "student number, experiment, score" in the same shape every time, we define the output with a <b>JSON schema</b>.</p>
<h3>The rules of a schema</h3>
<ul><li><code>type</code>: string, integer, number, boolean, array, object.</li><li><code>required</code> and <code>additionalProperties: false</code>: which fields are mandatory and that extra fields are not accepted.</li><li><code>enum</code>, <code>minimum</code>, <code>maximum</code>, <code>pattern</code>, <code>minItems</code>: the allowed range of a value.</li></ul>
<h3>Three lines of defence</h3>
<p>The first is the API's structured output feature: in the Anthropic API, when a schema is given through <code>output_config</code>, the answer is produced to match it, and the SDK's <code>parse</code> helper turns the result straight into an object. The second is your own validator: do not trust data coming from the network, a cache or an old version anyway; validate at the boundary of the application. The third is the <b>repair loop</b>: if validation fails, send the errors with their paths back to the model and ask it to fix only those fields.</p>
<div class="eq">generate → extract → validate → (if errors) repair message → at most N attempts</div>
<h3>JSON surrounded by text</h3>
<p>When asked without a schema, the model may put the JSON inside a sentence like "Sure, here is the summary:" and a code block. The extractor first tries the whole text, then the code block, then the span between the first and last curly brace. This is a patch; the real fix is schema output and a clear format instruction.</p>
<p>The repair loop must not be unbounded: if the output is still invalid after two or three attempts, treat the request as failed, log it and show the user a clear message.</p>`,
      code: [schemaPy('en'), validatorJs('en')],
      lab: 'Try the six samples in the schema validator one by one and write down which rule each breaks. Fix the "Missing field" sample by hand: add the score field and set it to 101, then to 100. For the "Broken JSON" sample compare how the repair message differs from the schema error message.',
      pitfalls: ['Assuming the model always returns valid JSON and not catching the parse error.', 'Accepting a number as text ("88") and then failing in a calculation.', 'Putting no attempt limit on the repair loop: if the error persists, cost grows.', 'Allowing extra fields and then writing unexpected columns to the database.'],
      se: `<p>The schema is the <b>interface contract</b> between the model and your application.</p>
<ul><li>Define the schema in one place (Pydantic, Zod) and use the same one in the API request and in validation.</li><li>Write contract tests: pin the expected error codes for every sample output; when the schema changes, the tests show which clients will break.</li></ul>`,
      quiz: [
        { q: 'Which error does "puan": "88" give in a schema where puan is type: integer?', options: ['required', 'type', 'enum', 'pattern'], answer: 1, why: 'The value is a string; the schema wants an integer. A type error.' },
        { q: 'What does additionalProperties: false ensure?', options: ['Fields not in the schema are rejected', 'All fields become optional', 'Arrays cannot be empty', 'Numbers are rounded'], answer: 0, why: 'When an undefined field arrives, validation gives an "extra" error.' },
        { q: 'Why put an attempt limit on the repair loop?', options: ['The API rejects more than two attempts', 'So the schema does not change', 'So cost and latency do not grow without bound on a persistent error', 'So the JSON is shorter'], answer: 2, why: 'Every attempt is a new request; without a limit a persistent error turns into an endless loop and bill.' },
        { q: 'If the API\'s structured output feature is used, is your own validator still needed?', options: ['No, never', 'Only for English text', 'Only for arrays', 'Yes, validating all data at the application boundary is a good habit'], answer: 3, why: 'Data can also arrive from a cache, an old version or another path; validating at the boundary is defence in depth.' },
      ],
    },
  },
  {
    n: 5, sims: ['rag'],
    related: [
      { href: '/makine-ogrenmesi/rag', tr: 'Makine öğrenmesi: RAG dersi', en: 'Machine learning: the RAG lesson' },
      { href: '/ai-atolyesi', tr: 'AI atölyesi: RAG aracı', en: 'AI workshop: RAG tool' },
      { href: '/makine-ogrenmesi/kelime-vektorleri', tr: 'Makine öğrenmesi: kelime vektörleri', en: 'Machine learning: word vectors' },
    ],
    tr: {
      title: 'RAG uçtan uca: belgeden kaynaklı cevap',
      summary: 'Parçalama, gömme, vektör arama, yeniden sıralama, eşik ve kaynak gösteren cevap. Modelin bilmediği notlardan doğru cevap almak.',
      goals: ['RAG hattının beş adımını sırayla açıklamak', 'Parça boyu, örtüşme ve k seçiminin etkisini ölçmek', 'Hibrit yeniden sıralamanın neden işe yaradığını göstermek', 'Cevap notlarda yoksa "bilmiyorum" diyen bir eşik kurmak'],
      notes: `<p>Model eğitildiği tarihten sonraki ya da hiç görmediği belgeleri (dersin notları, şirketin yönetmeliği) bilemez. <b>RAG</b> (retrieval-augmented generation) soruyu cevaplamadan önce ilgili belge parçalarını bulur ve prompta koyar; model cevabı bu parçalara dayanarak yazar ve kaynağını gösterir.</p>
<h3>Hat</h3>
<ul><li><b>Parçala</b>: belgeleri birkaç yüz tokenlık parçalara böl. Örtüşme, bir cümlenin iki parçanın sınırında kaybolmasını önler.</li><li><b>Göm</b>: her parçayı bir vektöre çevir ve bir dizinde sakla (bir kez, çevrimdışı).</li><li><b>Ara</b>: sorunun vektörüne en yakın k parçayı bul.</li><li><b>Yeniden sırala</b>: geniş bir aday kümesini daha pahalı ama daha isabetli bir ölçütle yeniden puanla. Bu derste vektör benzerliği ile anahtar kelime örtüşmesinin karışımı (hibrit) kullanılır; gerçek sistemlerde bir çapraz kodlayıcı model de olabilir.</li><li><b>Üret</b>: seçilen parçaları etiketlerle prompta koy, "yalnız bu notlara dayan, kaynağı [kimlik] olarak yaz, notlarda yoksa söyle" kuralıyla modeli çağır.</li></ul>
<h3>Eşik ve "bilmiyorum"</h3>
<p>En yakın parça bile soruya uzaksa model yine de bir şey yazmaya çalışır. Benzerlik eşiğinin altında kalan parçaları atmak ve hiçbir parça kalmazsa "notlarda yok" demek uydurmayı kökten azaltır. Eşik çok yüksekse doğru cevaplar da kaybolur; doğru değer bir değerlendirme kümesiyle (7. ünite) seçilir.</p>
<h3>Bu sayfadaki mini RAG</h3>
<p>Sekiz kısa Türkçe ders notu, öğretim gömmesi ve şablonla çalışan bir cevap adımı tarayıcıda çalışır. Cevap adımı gerçek bir model değildir: seçilen parçalardan soruya en çok örtüşen cümleleri alıntılar ve kaynağını ekler. Gerçek bir uygulamada aynı prompt Anthropic API'ye gider; kod örneği bunu gösterir.</p>`,
      code: [ragPy('tr'), chunkRerankJs('tr')],
      lab: 'Mini RAG\'da dört hazır soruyu dene ve hangisinin "notlarda yok" cevabı aldığını açıkla. Parça boyunu 15\'e indir, örtüşmeyi 0 yap: "Motor neden doğrudan pine bağlanmaz?" sorusunun cevabı bozuldu mu? Yeniden sıralamayı kapatıp aç ve tabloda sıranın nasıl değiştiğine bak. Son olarak eşiği 0,5\'e çıkar ve hangi doğru cevapların kaybolduğunu yaz.',
      pitfalls: ['Parçaları çok küçük seçmek: cevap iki parçaya bölünür ve hiçbiri tek başına yeterli olmaz.', 'Eşik koymamak: ilgisiz parçalarla da cevap üretilir ve uydurma artar.', 'Kaynak göstermemek: kullanıcı cevabı doğrulayamaz, hata ayıklamak zorlaşır.', 'Belgeler güncellenince dizini yeniden üretmeyi unutmak.'],
      se: `<p>RAG bir <b>veri hattıdır</b>: içeri alma, dizinleme ve sorgu ayrı bileşenlerdir ve ayrı test edilir.</p>
<ul><li>Arama adımını üretimden bağımsız ölç: altın kümede doğru parça ilk k içinde mi (isabet@k)?</li><li>Belge sürümü ve dizin oluşturma tarihi her cevabın kaydında bulunsun; yanlış cevabın eski bir dizinden mi geldiği anlaşılsın.</li></ul>`,
      quiz: [
        { q: 'Parçalar arasında örtüşme neden bırakılır?', options: ['Dizin küçülsün diye', 'Sınırdaki bir cümle iki parçada da bütün kalsın diye', 'Gömme daha hızlı olsun diye', 'Model daha kısa cevap versin diye'], answer: 1, why: 'Örtüşme olmadan bir bilgi iki parçanın arasına bölünebilir ve hiçbiri onu tam taşımaz.' },
        { q: 'Benzerlik eşiğinin altında hiç parça kalmadığında doğru davranış nedir?', options: ['Cevabın notlarda olmadığını söylemek', 'En yakın parçayla yine de cevap üretmek', 'Eşiği otomatik olarak sıfırlamak', 'Soruyu yok saymak'], answer: 0, why: 'Dayanak yoksa cevap uydurulur; "notlarda yok" demek dürüst ve ölçülebilir bir davranıştır.' },
        { q: 'Hibrit yeniden sıralama hangi iki sinyali birleştirir?', options: ['Parça uzunluğu ve tarih', 'Token sayısı ve fiyat', 'Vektör benzerliği ve anahtar kelime örtüşmesi', 'Yazar ve başlık'], answer: 2, why: 'Vektör yakınlığı anlamı (burada yüzeyi), anahtar kelime örtüşmesi sorudaki terimlerin parçada gerçekten geçip geçmediğini ölçer.' },
        { q: 'Arama adımının kalitesini üretimden bağımsız ölçmek için ne kullanılır?', options: ['Cevabın uzunluğu', 'Modelin sıcaklığı', 'Yanıt süresi', 'Altın kümede isabet@k'], answer: 3, why: 'Doğru parçanın ilk k sonuç içinde olup olmadığı, üretim adımı çalışmadan da ölçülebilir.' },
      ],
    },
    en: {
      title: 'RAG end to end: answers with sources from documents',
      summary: 'Chunking, embedding, vector search, reranking, a threshold and an answer that cites its sources. Getting correct answers from notes the model does not know.',
      goals: ['Explain the five steps of a RAG pipeline in order', 'Measure the effect of chunk size, overlap and k', 'Show why hybrid reranking helps', 'Set a threshold that says "I do not know" when the answer is not in the notes'],
      notes: `<p>A model cannot know documents from after its training date or ones it never saw (the course notes, a company's regulations). <b>RAG</b> (retrieval-augmented generation) finds the relevant document chunks before answering and puts them in the prompt; the model writes the answer from these chunks and cites its source.</p>
<h3>The pipeline</h3>
<ul><li><b>Chunk</b>: split the documents into pieces of a few hundred tokens. Overlap stops a sentence being lost on the boundary between two chunks.</li><li><b>Embed</b>: turn every chunk into a vector and store it in an index (once, offline).</li><li><b>Search</b>: find the k chunks nearest to the question's vector.</li><li><b>Rerank</b>: rescore a wider candidate set with a more expensive but more accurate measure. This course uses a mix of vector similarity and keyword overlap (hybrid); real systems may also use a cross-encoder model.</li><li><b>Generate</b>: put the chosen chunks in the prompt inside tags and call the model with the rule "rely only on these notes, cite the source as [id], say so if it is not in the notes".</li></ul>
<h3>Threshold and "I do not know"</h3>
<p>Even when the nearest chunk is far from the question, the model still tries to write something. Dropping chunks below a similarity threshold and saying "not in the notes" when none remain cuts made-up answers at the root. A threshold that is too high also loses correct answers; the right value is chosen with an evaluation set (unit 7).</p>
<h3>The mini RAG on this page</h3>
<p>Eight short course notes, the teaching embedding and a template-based answer step run in the browser. The answer step is not a real model: it quotes the sentences from the chosen chunks that overlap the question most and adds their source. In a real application the same prompt goes to the Anthropic API; the code example shows how.</p>`,
      code: [ragPy('en'), chunkRerankJs('en')],
      lab: 'Try the four preset questions in the mini RAG and explain which one gets the "not in the notes" answer. Lower the chunk size to 15 and set overlap to 0: did the answer to "Why should a motor not be wired straight to the pin?" break? Turn reranking off and on and see how the order changes in the table. Finally raise the threshold to 0.5 and write down which correct answers disappear.',
      pitfalls: ['Choosing chunks that are too small: the answer splits over two chunks and neither is enough alone.', 'Setting no threshold: answers are produced from unrelated chunks too and invention rises.', 'Not citing sources: the user cannot check the answer and debugging becomes hard.', 'Forgetting to rebuild the index when the documents change.'],
      se: `<p>RAG is a <b>data pipeline</b>: ingestion, indexing and querying are separate components and are tested separately.</p>
<ul><li>Measure the search step independently of generation: is the right chunk in the top k on the gold set (hit@k)?</li><li>Record the document version and the index build date with every answer, so you can tell whether a wrong answer came from an old index.</li></ul>`,
      quiz: [
        { q: 'Why leave overlap between chunks?', options: ['To make the index smaller', 'So a sentence on the boundary stays whole in at least one chunk', 'To make embedding faster', 'So the model gives shorter answers'], answer: 1, why: 'Without overlap a fact can be split between two chunks and neither carries it fully.' },
        { q: 'What is the right behaviour when no chunk is left above the similarity threshold?', options: ['Say the answer is not in the notes', 'Generate an answer from the nearest chunk anyway', 'Reset the threshold to zero automatically', 'Ignore the question'], answer: 0, why: 'Without grounding the answer is invented; saying "not in the notes" is honest and measurable.' },
        { q: 'Which two signals does hybrid reranking combine?', options: ['Chunk length and date', 'Token count and price', 'Vector similarity and keyword overlap', 'Author and title'], answer: 2, why: 'Vector closeness measures meaning (surface here); keyword overlap measures whether the question\'s terms really appear in the chunk.' },
        { q: 'What measures the quality of the search step independently of generation?', options: ['The length of the answer', 'The model\'s temperature', 'Response time', 'Hit@k on a gold set'], answer: 3, why: 'Whether the right chunk is in the top k results can be measured without running generation.' },
      ],
    },
  },
]
