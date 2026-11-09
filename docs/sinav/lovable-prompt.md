# muratarslan.site/nisantasi — Lovable istemi (ESOF 323 sınav sistemi)

Aşağıdaki metni Lovable'a olduğu gibi yapıştır. Sınav sistemi robotix.macademia.com.tr'de çalışır; portal yalnız bağlantı verir
(iframe kullanılmaz: farklı alan adında oturum çerezleri tarayıcılarca engellendiği için giriş ve otomatik kayıt bozulur).

---

Connect the course portal to the ESOF 323 online exam system that runs at https://robotix.macademia.com.tr. Make only the changes below; do not change the text, order or design of any other section. All links open in a new tab (target="_blank", rel="noopener"). Do not use iframes.

1. Admin panel: add a section titled "ESOF 323 Robotics Exam", styled like the existing admin cards, visible only to the admin. It contains a short line "Exams run on the MacademiaX lab. Sign in there once with the instructor account." and these buttons:
   - "Manage exams" → https://robotix.macademia.com.tr/sinav/yonetim
   - "Preview the 25 projects" → https://robotix.macademia.com.tr/sinav/yonetim/projeler
   - "Student exam page" → https://robotix.macademia.com.tr/sinav
   - "Instructor sign-in" → https://robotix.macademia.com.tr/giris?next=/sinav/yonetim

2. ESOF 323 Robotics course page (students and guests): add a card at the top, above the existing tabs, styled like the existing cards:
   - Title: "Online Exam"
   - Text: "The ESOF 323 exam runs on the MacademiaX lab. You will get one robot project: build its circuit and write its Arduino code. Use a laptop with Chrome or Edge. Your instructor will give you a 6-character exam code in class."
   - Button: "Open the exam →" → https://robotix.macademia.com.tr/sinav
   Also add an "Exam" item to the ESOF 323 course tabs (next to Materials / Assignments) that shows the same card.

3. Do not add anything to ESOF301.

Acceptance criteria: the admin section is visible only to the admin; the student card and tab are visible to guests and logged-in students on desktop and mobile; every button opens the right address in a new tab; the existing layout and colours are unchanged; no new console errors.
