#!/usr/bin/env node
/**
 * DilGenie VERİ Botu — `dilgenie` repo'sundaki JSON verilerini otomatik genişletir.
 * DATA-ROADMAP.md'deki ilk [ ] görevi alır -> OpenRouter'a ürettirir -> JSON doğrular
 * -> branch + commit + PR + otomatik squash merge.
 * Env: OPENROUTER_API_KEY (zorunlu), GH_TOKEN (zorunlu), BOT_MODEL (ops.)
 */
import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';

const API_KEY = process.env.OPENROUTER_API_KEY;
const GH_TOKEN = process.env.GH_TOKEN;
const MODEL = process.env.BOT_MODEL || 'nvidia/nemotron-3-super-120b-a12b:free';
const REPO = 'hasangonen91/dilgenie';

const sh = (cmd) => {
  try { return execSync(cmd, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }).trim(); }
  catch (e) { console.error('CMD HATA:', cmd, e.message); return ''; }
};
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// ---------- OpenRouter çağrısı ----------
async function callModel(prompt) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 6000,
          temperature: 0.3,
          response_format: { type: 'json_object' },
        }),
        signal: AbortSignal.timeout(180000),
      });
      if (!res.ok) { console.log(`⚠️ Deneme ${attempt} API hatası: ${res.status} ${await res.text()}`); await sleep(5000); continue; }
      const data = await res.json();
      const text = data.choices?.[0]?.message?.content || '';
      if (!text) { console.log(`⚠️ Deneme ${attempt} boş yanıt`); await sleep(5000); continue; }
      return text;
    } catch (e) { console.log(`⚠️ Deneme ${attempt} ağ hatası: ${e.message}`); await sleep(5000); }
  }
  return '';
}

// ---------- JSON çıkarma ----------
function extractJson(text) {
  // ```json ... ``` bloklarını temizle
  let t = text.replace(/```(?:json)?\s*/g, '').replace(/```/g, '');
  const s = t.indexOf('{');
  const e = t.lastIndexOf('}');
  if (s < 0 || e < 0) return null;
  try { return JSON.parse(t.slice(s, e + 1)); } catch { return null; }
}

// ---------- görev parse ----------
function parseTask(roadmapText) {
  const lines = roadmapText.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^\s*-\s+\[ \]\s+\*\*(.+?)\*\*\s*—\s*(.+)$/);
    if (m) return { title: m[1], detail: m[2], line: lines[i], idx: i };
  }
  return null;
}

// ---------- hedef dosya + kategori ----------
function parseTarget(detail) {
  const file = (detail.match(/`([^`]+\.json)`/) || [])[1];
// "`<key>` anahtarINI" veya "<key> kategorisi" veya "**<key> kategorisi**" desenlerini yakala.
  // Önce "anahtarını/anahtari ekle" kalıbını dene (SONRA-gibi dolguları atlar).
  const m = detail.match(/`([a-z_]+)`\s*anahtar(?:ını)?\s*ekle/i) ||
            detail.match(/`([a-z_]+)`\s*kategorisini?\s*ekle/i) ||
            detail.match(/`([a-z_]+)`\s*anahtar/i) ||
            detail.match(/`([a-z_]+)`\s*kategorisi/i) ||
            detail.match(/([a-z_]+)\s*anahtarı\s*ekle/i) ||
            detail.match(/\*\*([a-z_]+)\s*kategorisi\*\*/i) ||
            detail.match(/\*\*([a-z_]+)\*\*/i);
  const key = m ? m[1] : null;
  return { file, key };
}

async function main() {
  const roadmap = readFileSync('DATA-ROADMAP.md', 'utf-8');
  const task = parseTask(roadmap);
  if (!task) { console.log('✅ Yeni görev yok — ROADMAP tamam.'); return; }
  console.log(`🎯 Görev: ${task.title}`);

  const { file, key } = parseTarget(task.detail);
  if (!file || !key) { console.error('❌ Hedef dosya/key çözülemedi:', task.detail); process.exit(1); }
  console.log(`  Dosya: ${file} | Key: ${key}`);

  // Mevcut JSON'u oku
  if (!readFileSync(file, 'utf-8').trim()) { console.error('❌ Dosya boş:', file); process.exit(1); }
  const data = JSON.parse(readFileSync(file, 'utf-8'));

  // Rötuş: hedef konumu bul
  const targetContainer = findContainer(data, file);
  if (targetContainer === undefined) { console.error('❌ Hedef konteyner bulunamadı:', file); process.exit(1); }
  if (targetContainer && typeof targetContainer === 'object' && key in targetContainer) {
    console.log(`⚠️ '${key}' zaten var, atlıyorum.`);
    sh('git checkout DATA-ROADMAP.md 2>/dev/null || true');
    return;
  }

  // Örnek kategori bloğu (greetings) context olarak ver
  const sample = extractSample(targetContainer);

  const prompt = `Sen DilGenie uygulamasının veri üretim botusun.
Görev: ${task.title}
Detay: ${task.detail}

Hedef dosya: ${file}
Eklenecek yeni anahtar (JS key): "${key}"

MEVCUT dosya yapısındaki örnek (tam olarak bu formatı taklit et, AYNI key'leri kullan):
${JSON.stringify(sample, null, 2)}

Kurallar:
- SADECE yeni "${key}" anahtarının değerini içeren geçerli bir JSON objesi üret. (Kök hedef dosyanın tamamını ASLA yeniden üretme.)
- Boşluk/boş dizi bırakma, TAM sayıda öğe üret (görevde belirtilen).
- İngilizce cümleler/kelimeler dilbilgisi açısından doğru, Türkçe çeviriler doğru ve doğal olmalı.
- "image" alanı varsa değeri her zaman aynı dizi: https://random-image-pepebigotes.vercel.app/api/random-image
- "correctOption"/"answer" değeri options dizisindeki seçeneklerden BİRİ ile birebir aynı olmalı.
- Çıktı: sadece JSON.`;
  const raw = await callModel(prompt);
  if (!raw) { console.error('❌ Model yanıtı alınamadı'); process.exit(1); }
  const newBlock = extractJson(raw);
  if (!newBlock) { console.error('❌ Model çıktısından JSON çıkarılamadı:', raw.slice(0, 300)); process.exit(1); }
  if (!(key in newBlock)) {
    console.log(`⚠️ Üretilen blok ${key} içermiyor. İçindekiler: ${Object.keys(newBlock).join(',')}`);
    // tek anahtarlıysa onu kullan
    const only = Object.keys(newBlock)[0];
    if (only && Object.keys(newBlock).length === 1) newBlock[key] = newBlock[only];
    else { console.error('❌ Blok formatı hatalı'); process.exit(1); }
  }
  console.log('✅ Model blok üretti:');

  // Ekleyip yaz — format koruması:
  // B1/Listening dosyalarında kategori değeri {questions:[...]} olmalı,
  // model düz dizi üretirse {questions} içine sar.
  let val = newBlock[key];
  const isListeningFile = file === 'vocabulary/A1ListeningData.json';
  if (isListeningFile && Array.isArray(val)) val = { questions: val };
  targetContainer[key] = val;
  const pretty = JSON.stringify(data, null, 2);
  writeFileSync(file, pretty);

  // JSON doğrula
  try {
    const verified = JSON.parse(readFileSync(file, 'utf-8'));
    const check = findContainer(verified, file);
    if (!check || !(key in check)) { console.error('❌ Doğrulama başarısız: key eklenmemiş'); process.exit(1); }
    console.log(`✅ JSON geçerli, "${key}" eklendi`);
  } catch (e) { console.error('❌ Üretilen dosya geçersiz JSON:', e.message); process.exit(1); }

  // ROADMAP işaretle
  const newRoadmap = roadmap.replace(task.line, task.line.replace('- [ ]', '- [x]'));
  writeFileSync('DATA-ROADMAP.md', newRoadmap);

  // Commit + branch + PR + merge
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const branch = `data/${date}`;
  if (sh(`git branch --list ${branch}`)) sh(`git branch -D ${branch}`);
  sh(`git config user.email "45069041+hasangonen91@users.noreply.github.com"`);
  sh(`git config user.name "DilGenie Data Bot"`);
  sh(`git checkout -b ${branch}`);
  sh(`git add ${file} DATA-ROADMAP.md`);
  sh(`git commit -m "🤖 ${task.title} (otomatik AI veri üretimi)"`);
  sh(`git push --force-with-lease origin ${branch} 2>/dev/null || git push origin ${branch}`);

  const prBody = `## 🤖 Otomatik AI Veri Güncellemesi
**Görev:** ${task.title}

${task.detail}

---
Otomatik olarak üretildi, JSON doğrulandı.`;
  const createRes = sh(`gh pr create --repo ${REPO} --base main --head ${branch} --title "🤖 ${task.title}" --body '${prBody.replace(/'/g, "'\\''")}'`);
  if (!createRes) { console.error('❌ PR oluşturulamadı'); process.exit(1); }
  console.log('PR:', createRes);

  // Otonom squash merge (PR numarası ver)
  await sleep(12000);
  const prNum = (createRes.match(/(\d+)$/) || [])[1];
  if (!prNum) { console.log('⚠️ PR numarası çözülemedi, merge atlandı:', createRes); return; }
  const mergeRes = sh(`gh pr merge ${prNum} --repo ${REPO} --squash --delete-branch --admin`);
  if (mergeRes.includes('already merged')) console.log('⚠️ PR zaten merge edilmiş');
  else console.log('✅ Merge:', mergeRes.slice(0, 100));

  console.log('🎉 Görev tamamlandı!');
}

// ---------- yardımcılar ----------
function findContainer(data, file) {
  if (file === 'vocabulary/A1ListeningData.json') return data;
  if (file === 'vocabulary/A1level.json') return data.A1level?.[0]?.vocabulary;
  if (file === 'vocabulary/A1levelQuestions.json') return data.A1levelQuestions?.[0]?.questions;
  if (file === 'video/videos.json') return data;
  return undefined;
}
function extractSample(container) {
  if (!container || typeof container !== 'object') return null;
  // video/videos.json için örnek bir klip
  if (Array.isArray(container['greetings']) && container['greetings'][0]?.transcript) {
    return container['greetings'][0];
  }
  const pick = ['greetings', 'family', 'months', 'days', 'places', 'food_drinks', 'animals', 'clothes'];
  for (const k of pick) if (container[k]) return container[k];
  const keys = Object.keys(container);
  const valid = keys.filter(k => k !== 'en' && k !== 'tr');
  return valid.length ? container[valid[0]] : container;
}

main().catch(e => { console.error('FATAL:', e); process.exit(1); });