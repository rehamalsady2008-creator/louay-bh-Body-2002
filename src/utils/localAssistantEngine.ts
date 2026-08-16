/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { offlineSurahs } from '../data/quran_text';
import { quranMetadata } from '../data/quran_metadata';
import { hadithsData } from '../data/hadith';
import { azkarData } from '../data/azkar';

export function generateLocalIslamicAnswer(question: string, isEn: boolean = false): string {
  const q = question.toLowerCase().trim();

  // Search local Quran
  const matchedAyahs: Array<{ surahName: string; surahNum: number; ayahNum: number; text: string; tafsir?: string }> = [];
  
  Object.values(offlineSurahs).forEach(surah => {
    const meta = quranMetadata.find(s => s.number === surah.number);
    const sName = meta?.name || surah.name || `سورة ${surah.number}`;

    surah.ayahs.forEach(ayah => {
      if (
        q.includes('صلاة') || q.includes('صبر') || q.includes('والدين') || q.includes('استغفار') ||
        q.includes('رزق') || q.includes('جنة') || q.includes('قيام') || q.includes('ذكر') ||
        ayah.text.toLowerCase().includes(q) ||
        (ayah.tafsir && ayah.tafsir.toLowerCase().includes(q))
      ) {
        if (matchedAyahs.length < 3) {
          matchedAyahs.push({
            surahName: sName,
            surahNum: surah.number,
            ayahNum: ayah.number,
            text: ayah.text,
            tafsir: ayah.tafsir
          });
        }
      }
    });
  });

  // Search local Hadiths
  const matchedHadiths = hadithsData.filter(h => 
    h.text.toLowerCase().includes(q) || 
    h.narrator.toLowerCase().includes(q) || 
    (h.chapter && h.chapter.toLowerCase().includes(q))
  ).slice(0, 2);

  // Search local Azkar
  const matchedAzkar: Array<{ catName: string; zekrText: string; reward?: string }> = [];
  azkarData.forEach(cat => {
    cat.items.forEach(item => {
      if (item.text.toLowerCase().includes(q) || (item.reward && item.reward.toLowerCase().includes(q))) {
        if (matchedAzkar.length < 2) {
          matchedAzkar.push({
            catName: cat.name,
            zekrText: item.text,
            reward: item.reward
          });
        }
      }
    });
  });

  if (isEn) {
    let ans = `**Peace be upon you! (Offline Mode - Local Verified Search)**\n\n`;
    ans += `Here is what was found in the verified local Islamic database regarding your request:\n\n`;
    if (matchedAyahs.length > 0) {
      ans += `### 📖 Holy Quran Reference\n`;
      matchedAyahs.forEach(a => {
        ans += `> "${a.text}"\n*— Surah ${a.surahName} (${a.surahNum}:${a.ayahNum})*\n\n`;
      });
    }
    if (matchedHadiths.length > 0) {
      ans += `### 📜 Sahih Hadith\n`;
      matchedHadiths.forEach(h => {
        ans += `> "${h.text}"\n*— Recorded in Sahih ${h.source} (Narrated by ${h.narrator})*\n\n`;
      });
    }
    ans += `\n*Note: This answer was retrieved locally from the device database without requiring internet.*`;
    return ans;
  }

  let response = `السلام عليكم ورحمة الله وبركاته، حيّاك الله وبارك فيك ونفع بك.\n\n`;
  response += `بالاعتماد على **قاعدة البيانات الإسلامية المحلية الموثوقة المخزنة بداخل التطبيق**، إليك ما تيسر إيراده بشأن تساؤلك:\n\n`;

  if (matchedAyahs.length > 0) {
    response += `### 📖 من دلائل القرآن الكريم:\n`;
    matchedAyahs.forEach(a => {
      response += `> ﴿ ${a.text} ﴾\n**[سورة ${a.surahName} - الآية ${a.ayahNum}]**\n`;
      if (a.tafsir) {
        response += `*التفسير الميسر:* ${a.tafsir}\n`;
      }
      response += `\n`;
    });
  } else {
    // Standard Islamic fallback for core concepts if no direct substring match
    response += `### 📖 من التوجيهات القرآنية:\n`;
    response += `> ﴿ ٱلَّذِينَ ءَامَنُوا۟ وَتَطْمَئِنُّ قُلُوبُهُم بِذِكْرِ ٱللَّهِ ۗ أَلَا بِذِكْرِ ٱللَّهِ تَطْمَئِنُّ ٱلْقُلُوبُ ﴾\n**[سورة الرعد - الآية 28]**\n\n`;
  }

  if (matchedHadiths.length > 0) {
    response += `### 📜 من السنة النبوية المطهرة:\n`;
    matchedHadiths.forEach(h => {
      response += `قال رسول الله صلى الله عليه وسلم:\n> "${h.text}"\n**[صحيح ${h.source} - عن ${h.narrator}]**\n\n`;
    });
  } else {
    response += `### 📜 من السنة النبوية الشريفة:\n`;
    response += `عن أمير المؤمنين أبي حفص عمر بن الخطاب رضي الله عنه قال: سمعت رسول الله صلى الله عليه وسلم يقول:\n> "إنما الأعمال بالنيات، وإنما لكل امرئ ما نوى..."\n**[رواه البخاري ومسلم]**\n\n`;
  }

  if (matchedAzkar.length > 0) {
    response += `### 🤲 من الأذكار والأدعية المأثورة:\n`;
    matchedAzkar.forEach(az => {
      response += `> "${az.zekrText}"\n*— ${az.catName}${az.reward ? ` (${az.reward})` : ''}*\n\n`;
    });
  }

  response += `---\n`;
  response += `⚡ **حالة المحرك:** تم توليد هذه الإجابة محلياً بدون إنترنت بالاعتماد على نصوص القرآن والحديث المخزنة.\n`;
  response += `💡 **تنبيه شرعي:** هذا المحتوى المكتوب مأخوذ من مصادره الموثوقة للاسترشاد والتعليم؛ والمسائل الفقهية المعقدة يُرجع فيها لكبار العلماء والدور الإفتائية الرسمية.`;

  return response;
}
