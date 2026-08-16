# DilGenie Video İçerikleri

Bu dosya uygulamanın "Video Listening" modülünü besler: `videos.json`

## videoUrl nasıl doldurulur?

**En kolay (test için):**
1. React Native `react-native-video` ile oynatılabilir DIRECT .mp4 linki olmalı (web sayfası değil!)
2. Telifsiz/CC kaynaklar önerilir (yayın güvenliği için)

**Kaynak önerileri:**
- **Pexels Videos** (telifsiz, API key'siz sayfadan indirilebilir): https://www.pexels.com/videos/
- **Pixabay Videos** (telifsiz): https://pixabay.com/videos/
- **Wikimedia Commons** (CC lisanslı): https://commons.wikimedia.org
- **Mixkit** (telifsiz): https://mixkit.co/free-stock-video/

**Kendi film/dizi kesitlerin (kişisel kullanım):**
- İstediğin klibi kırp (ffmpeg) ve dilediğin yere yükle (ör. Google Drive public link, Vercel, GitHub release)
- `videoUrl` alanına direct mp4 linkini koy

## Format

```json
{
  "kategori_adı": [
    {
      "id": "benzersiz",
      "title": "İngilizce başlık",
      "title_tr": "Türkçe başlık",
      "videoUrl": "direct mp4 URL",
      "thumbnail": "",
      "subtitle": "İngilizce kısa açıklama",
      "subtitle_tr": "Türkçe açıklama",
      "transcript": "Diyalog metni (İngilizce)",
      "transcript_tr": "Diyalog çevirisi (Türkçe)",
      "questions": [
        { "question": "...", "options": ["A","B","C"], "correctOption": "A", "translation": "..." }
      ]
    }
  ]
}
```
