# DilGenie VERİ Yol Haritası

> Bu dosya, otomatik AI veri botu (`.github/workflows/data-dev.yml`) tarafından işlenir.
> Bot çalıştığında ilk `- [ ]` görevi alır, veri üretir, PR açar ve kendisi merge eder.
> Görev eklerken formatı bozma. Mevcut yapıları birebir taklit et.

## video/videos.json (Video Listening — yeni)

- [x] **Video: travel kategorisi** — `video/videos.json` dosyasına `travel` anahtarını ekle. Değer TAM 1 video klip objesi içeren dizi: `{"id": "travel_001", "title": "ingilizce_baslik", "title_tr": "turkce_baslik", "videoUrl": "", "thumbnail": "", "subtitle": "ingilizce_aciklama", "subtitle_tr": "turkce_aciklama", "transcript": "ingilizce_diyalog", "transcript_tr": "turkce_ceviri", "questions": [TAM 2 soru {"question","options"[3],"correctOption","translation"}]}`. `correctOption` seçeneklerden biri olmalı. Model videoyu üretemez, sadece transkript+soruları üretir `videoUrl` BOŞ kalsın.
- [x] **Video: food kategorisi** — `video/videos.json` dosyasına `food` anahtarını ekle (ayrı format, `travel` örneğindeki gibi). `transcript` yiyecek/içecek konulu İngilizce kısa diyalog, `questions` TAM 2. `videoUrl` BOŞ.
- [x] **Video: shopping kategorisi** — `video/videos.json` dosyasına `shopping` anahtarını ekle (aynı format). Alışveriş konulu küçük diyalog, `questions` TAM 2. `videoUrl` BOŞ.
- [x] **Video: emotions kategorisi** — `video/videos.json` dosyasına `emotions` anahtarını ekle (aynı format). Duygular/duygular konulu kısa diyalog, `questions` TAM 2. `videoUrl` BOŞ.
- [x] **Video: conversations kategorisi** — `video/videos.json` dosyasına `conversations` anahtarını ekle (aynı format). Genel sohbet konulu diyalog, `questions` TAM 2. `videoUrl` BOŞ.
- [x] **Video: family kategorisi** — `video/videos.json` dosyasına `family` anahtarını ekle (aynı format). Aile konulu diyalog, `questions` TAM 2. `videoUrl` BOŞ.


## A1ListeningData.json (Dinleme Testleri — en kolay)

- [x] **A1ListeningData: animals kategorisi** — `vocabulary/A1ListeningData.json` dosyasına `animals` anahtarı ekle. Format (mevcut `greetings` gibi): JS key'i `animals` olsun, içinde `questions` dizisinde TAM 5 soru. Her soru: `{"question": "ingilizce", "image": "https://random-image-pepebigotes.vercel.app/api/random-image", "options": ["A", "B", "C"], "correctOption": "dogruSecenek", "translation": "turkce"}`. `correctOption` değeri `options` dizisindeki seçeneklerden BİRİSİ olmalı. Konu: hayvanlar (cat, dog, bird, fish, horse vb.).
- [x] **A1ListeningData: food_drinks kategorisi** — `vocabulary/A1ListeningData.json` dosyasına `food_drinks` anahtarı ekle (greetings formatı). `questions` dizisinde TAM 5 soru, konu: yiyecek ve içecekler (bread, milk, apple, water, meat vb.). `correctOption` seçeneklerden biri olmalı, her sorunun `translation`'u Türkçe.
- [x] **A1ListeningData: clothes kategorisi** — `vocabulary/A1ListeningData.json` dosyasına `clothes` anahtarını ekle (aynı format, `food_drinks`'in hemen ardına gelmeli). `questions` dizisinde TAM 5 soru, konu: kıyafetler (shirt, hat, shoes, dress, coat vb.). Sıra bozma, diğer kategorilere dokunma.
- [x] **A1ListeningData: weather kategorisi** — `vocabulary/A1ListeningData.json` dosyasına `weather` anahtarı ekle (aynı format). `questions` dizisinde TAM 5 soru, konu: hava durumu (sunny, rainy, windy, cloudy, snowy vb.). `correctOption` options'tan biri, `translation` Türkçe.
- [x] **A1ListeningData: occupations kategorisi** — `vocabulary/A1ListeningData.json` dosyasına `occupations` anahtarı ekle (aynı format). `questions` dizisinde TAM 5 soru, konu: meslekler (teacher, doctor, engineer, farmer, pilot vb.).
- [ ] **A1ListeningData: body_parts kategorisi** — `vocabulary/A1ListeningData.json` dosyasına `body_parts` anahtarı ekle (aynı format). `questions` dizisinde TAM 5 soru, konu: vücut bölümleri (head, hand, eye, foot, ear vb.).
- [ ] **A1ListeningData: transport kategorisi** — `vocabulary/A1ListeningData.json` dosyasına `transport` anahtarı ekle (aynı format). `questions` dizisinde TAM 5 soru, konu: ulaşım araçları (car, bus, train, plane, bike vb.).
- [ ] **A1ListeningData: school kategorisi** — `vocabulary/A1ListeningData.json` dosyasına `school` anahtarı ekle (aynı format). `questions` dizisinde TAM 5 soru, konu: okul (book, pen, teacher, classroom, homework vb.).

## A1level.json (Kelime Bilgisi)

- [ ] **A1level: animals kelimeleri** — `vocabulary/A1level.json` dosyasına (`A1level[0].vocabulary` içine) `animals` anahtarı ekle. Format mevcut `greetings` ile aynı: `{"en": "Animals", "tr": "Hayvanlar", "category": {"words": [TAM 5 kelime {"en","tr","image"}], "example_sentences": [TAM 2 cümle {"en","tr","image"}]}}`. image değeri her zaman `https://random-image-pepebigotes.vercel.app/api/random-image`.
- [ ] **A1level: food_drinks kelimeleri** — `vocabulary/A1level.json` dosyasına `food_drinks` anahtarı ekle (greetings formatı). `words` TAM 5, `example_sentences` TAM 2. Konu: yiyecek içecek.
- [ ] **A1level: clothes kelimeleri** — `vocabulary/A1level.json` dosyasına `clothes` anahtarı ekle (greetings formatı). `words` TAM 5, `example_sentences` TAM 2. Konu: kıyafetler.

## A1levelQuestions.json (Soru Bankası)

- [ ] **A1levelQuestions: animals soruları** — `vocabulary/A1levelQuestions.json` dosyasına (`A1levelQuestions[0].questions` içine) `animals` anahtarı ekle. Format mevcut `greetings` ile aynı: `{"en": "Animals", "tr": "Hayvanlar", "category": {"questions": [TAM 5 soru]}}`. Her soru: `{"sentence": ["The cat", "", "milk."], "options": [{"id": "1", "text": "sajıkları"}, {"id": "2", "text": "..."}, {"id": "3", "text": "..."}], "answer": "dogru"}`. `answer` değeri options'taki bir `text` ile birebir aynı olmalı. `sentence` her zaman 3 parçalı dizi (boş orta parça cevap yeri).
