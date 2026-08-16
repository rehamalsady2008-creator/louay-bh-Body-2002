/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CityInfo {
  ar: string;
  en: string;
  baseTimes: {
    Fajr: string;
    Sunrise: string;
    Dhuhr: string;
    Asr: string;
    Maghrib: string;
    Isha: string;
  };
}

export interface CountryInfo {
  ar: string;
  en: string;
  code: string;
  cities: CityInfo[];
}

export const PRAYER_COUNTRIES: CountryInfo[] = [
  {
    ar: 'مملكة البحرين',
    en: 'Bahrain',
    code: 'BH',
    cities: [
      { ar: 'المنامة', en: 'Manama', baseTimes: { Fajr: '03:48', Sunrise: '05:10', Dhuhr: '11:46', Asr: '15:12', Maghrib: '18:23', Isha: '19:53' } },
      { ar: 'المحرق', en: 'Muharraq', baseTimes: { Fajr: '03:48', Sunrise: '05:10', Dhuhr: '11:46', Asr: '15:12', Maghrib: '18:23', Isha: '19:53' } },
      { ar: 'الرفاع', en: 'Riffa', baseTimes: { Fajr: '03:49', Sunrise: '05:11', Dhuhr: '11:46', Asr: '15:12', Maghrib: '18:23', Isha: '19:53' } },
      { ar: 'مدينة حمد', en: 'Hamad Town', baseTimes: { Fajr: '03:49', Sunrise: '05:11', Dhuhr: '11:46', Asr: '15:12', Maghrib: '18:23', Isha: '19:53' } },
      { ar: 'مدينة عيسى', en: 'Isa Town', baseTimes: { Fajr: '03:48', Sunrise: '05:10', Dhuhr: '11:46', Asr: '15:12', Maghrib: '18:23', Isha: '19:53' } },
      { ar: 'سترة', en: 'Sitra', baseTimes: { Fajr: '03:48', Sunrise: '05:10', Dhuhr: '11:46', Asr: '15:12', Maghrib: '18:23', Isha: '19:53' } },
    ]
  },
  {
    ar: 'المملكة العربية السعودية',
    en: 'Saudi Arabia',
    code: 'SA',
    cities: [
      { ar: 'الرياض', en: 'Riyadh', baseTimes: { Fajr: '04:05', Sunrise: '05:26', Dhuhr: '11:58', Asr: '15:21', Maghrib: '18:30', Isha: '20:00' } },
      { ar: 'مكة المكرمة', en: 'Makkah', baseTimes: { Fajr: '04:30', Sunrise: '05:50', Dhuhr: '12:20', Asr: '15:38', Maghrib: '18:50', Isha: '20:20' } },
      { ar: 'المدينة المنورة', en: 'Madinah', baseTimes: { Fajr: '04:26', Sunrise: '05:48', Dhuhr: '12:20', Asr: '15:42', Maghrib: '18:52', Isha: '20:22' } },
      { ar: 'جدة', en: 'Jeddah', baseTimes: { Fajr: '04:32', Sunrise: '05:52', Dhuhr: '12:22', Asr: '15:40', Maghrib: '18:52', Isha: '20:22' } },
      { ar: 'الدمام', en: 'Dammam', baseTimes: { Fajr: '03:52', Sunrise: '05:14', Dhuhr: '11:48', Asr: '15:13', Maghrib: '18:22', Isha: '19:52' } },
      { ar: 'الخبر', en: 'Khobar', baseTimes: { Fajr: '03:51', Sunrise: '05:13', Dhuhr: '11:47', Asr: '15:12', Maghrib: '18:21', Isha: '19:51' } },
      { ar: 'أبها', en: 'Abha', baseTimes: { Fajr: '04:30', Sunrise: '05:46', Dhuhr: '12:15', Asr: '15:31', Maghrib: '18:44', Isha: '20:14' } },
      { ar: 'تبوك', en: 'Tabuk', baseTimes: { Fajr: '04:28', Sunrise: '05:53', Dhuhr: '12:32', Asr: '16:02', Maghrib: '19:10', Isha: '20:40' } },
      { ar: 'بريدة / القصيم', en: 'Buraidah', baseTimes: { Fajr: '04:12', Sunrise: '05:34', Dhuhr: '12:08', Asr: '15:33', Maghrib: '18:41', Isha: '20:11' } },
      { ar: 'حائل', en: 'Hail', baseTimes: { Fajr: '04:15', Sunrise: '05:39', Dhuhr: '12:13', Asr: '15:41', Maghrib: '18:48', Isha: '20:18' } },
      { ar: 'جازان', en: 'Jazan', baseTimes: { Fajr: '04:32', Sunrise: '05:47', Dhuhr: '12:15', Asr: '15:29', Maghrib: '18:43', Isha: '20:13' } },
      { ar: 'نجران', en: 'Najran', baseTimes: { Fajr: '04:24', Sunrise: '05:40', Dhuhr: '12:08', Asr: '15:23', Maghrib: '18:36', Isha: '20:06' } },
      { ar: 'الطائف', en: 'Taif', baseTimes: { Fajr: '04:28', Sunrise: '05:48', Dhuhr: '12:18', Asr: '15:36', Maghrib: '18:48', Isha: '20:18' } }
    ]
  },
  {
    ar: 'الإمارات العربية المتحدة',
    en: 'United Arab Emirates',
    code: 'AE',
    cities: [
      { ar: 'أبوظبي', en: 'Abu Dhabi', baseTimes: { Fajr: '04:12', Sunrise: '05:32', Dhuhr: '12:22', Asr: '15:44', Maghrib: '19:12', Isha: '20:42' } },
      { ar: 'دبي', en: 'Dubai', baseTimes: { Fajr: '04:08', Sunrise: '05:28', Dhuhr: '12:18', Asr: '15:40', Maghrib: '19:08', Isha: '20:38' } },
      { ar: 'الشارقة', en: 'Sharjah', baseTimes: { Fajr: '04:07', Sunrise: '05:27', Dhuhr: '12:17', Asr: '15:39', Maghrib: '19:07', Isha: '20:37' } },
      { ar: 'عجمان', en: 'Ajman', baseTimes: { Fajr: '04:07', Sunrise: '05:27', Dhuhr: '12:17', Asr: '15:39', Maghrib: '19:07', Isha: '20:37' } },
      { ar: 'رأس الخيمة', en: 'Ras Al Khaimah', baseTimes: { Fajr: '04:05', Sunrise: '05:25', Dhuhr: '12:15', Asr: '15:38', Maghrib: '19:05', Isha: '20:35' } },
      { ar: 'الفجيرة', en: 'Fujairah', baseTimes: { Fajr: '04:05', Sunrise: '05:24', Dhuhr: '12:14', Asr: '15:36', Maghrib: '19:04', Isha: '20:34' } },
      { ar: 'العين', en: 'Al Ain', baseTimes: { Fajr: '04:09', Sunrise: '05:29', Dhuhr: '12:18', Asr: '15:40', Maghrib: '19:07', Isha: '20:37' } }
    ]
  },
  {
    ar: 'دولة الكويت',
    en: 'Kuwait',
    code: 'KW',
    cities: [
      { ar: 'مدينة الكويت', en: 'Kuwait City', baseTimes: { Fajr: '03:42', Sunrise: '05:07', Dhuhr: '11:48', Asr: '15:22', Maghrib: '18:29', Isha: '20:01' } },
      { ar: 'الأحمدي', en: 'Ahmadi', baseTimes: { Fajr: '03:43', Sunrise: '05:08', Dhuhr: '11:48', Asr: '15:22', Maghrib: '18:29', Isha: '20:01' } },
      { ar: 'حولي', en: 'Hawalli', baseTimes: { Fajr: '03:42', Sunrise: '05:07', Dhuhr: '11:48', Asr: '15:22', Maghrib: '18:29', Isha: '20:01' } },
      { ar: 'الجهراء', en: 'Jahra', baseTimes: { Fajr: '03:43', Sunrise: '05:08', Dhuhr: '11:49', Asr: '15:23', Maghrib: '18:30', Isha: '20:02' } }
    ]
  },
  {
    ar: 'دولة قطر',
    en: 'Qatar',
    code: 'QA',
    cities: [
      { ar: 'الدوحة', en: 'Doha', baseTimes: { Fajr: '03:46', Sunrise: '05:08', Dhuhr: '11:43', Asr: '15:08', Maghrib: '18:18', Isha: '19:48' } },
      { ar: 'الريان', en: 'Al Rayyan', baseTimes: { Fajr: '03:46', Sunrise: '05:08', Dhuhr: '11:43', Asr: '15:08', Maghrib: '18:18', Isha: '19:48' } },
      { ar: 'الوكرة', en: 'Al Wakrah', baseTimes: { Fajr: '03:46', Sunrise: '05:08', Dhuhr: '11:43', Asr: '15:08', Maghrib: '18:18', Isha: '19:48' } }
    ]
  },
  {
    ar: 'سلطنة عمان',
    en: 'Oman',
    code: 'OM',
    cities: [
      { ar: 'مسقط', en: 'Muscat', baseTimes: { Fajr: '04:02', Sunrise: '05:22', Dhuhr: '12:08', Asr: '15:28', Maghrib: '18:54', Isha: '20:24' } },
      { ar: 'صلالة', en: 'Salalah', baseTimes: { Fajr: '04:35', Sunrise: '05:51', Dhuhr: '12:28', Asr: '15:43', Maghrib: '19:05', Isha: '20:35' } },
      { ar: 'صحار', en: 'Sohar', baseTimes: { Fajr: '04:05', Sunrise: '05:25', Dhuhr: '12:12', Asr: '15:32', Maghrib: '18:58', Isha: '20:28' } }
    ]
  },
  {
    ar: 'جمهورية مصر العربية',
    en: 'Egypt',
    code: 'EG',
    cities: [
      { ar: 'القاهرة', en: 'Cairo', baseTimes: { Fajr: '03:48', Sunrise: '05:20', Dhuhr: '11:58', Asr: '15:34', Maghrib: '18:36', Isha: '20:06' } },
      { ar: 'الإسكندرية', en: 'Alexandria', baseTimes: { Fajr: '03:49', Sunrise: '05:24', Dhuhr: '12:03', Asr: '15:41', Maghrib: '18:42', Isha: '20:13' } },
      { ar: 'الجيزة', en: 'Giza', baseTimes: { Fajr: '03:49', Sunrise: '05:21', Dhuhr: '11:58', Asr: '15:34', Maghrib: '18:36', Isha: '20:06' } },
      { ar: 'طنطا', en: 'Tanta', baseTimes: { Fajr: '03:46', Sunrise: '05:20', Dhuhr: '11:59', Asr: '15:36', Maghrib: '18:38', Isha: '20:09' } },
      { ar: 'المنصورة', en: 'Mansoura', baseTimes: { Fajr: '03:44', Sunrise: '05:19', Dhuhr: '11:58', Asr: '15:35', Maghrib: '18:37', Isha: '20:08' } },
      { ar: 'أسوان', en: 'Aswan', baseTimes: { Fajr: '04:01', Sunrise: '05:25', Dhuhr: '11:52', Asr: '15:17', Maghrib: '18:19', Isha: '19:43' } },
      { ar: 'الأقصر', en: 'Luxor', baseTimes: { Fajr: '03:57', Sunrise: '05:23', Dhuhr: '11:52', Asr: '15:20', Maghrib: '18:21', Isha: '19:47' } }
    ]
  },
  {
    ar: 'المملكة الأردنية الهاشمية',
    en: 'Jordan',
    code: 'JO',
    cities: [
      { ar: 'عمان', en: 'Amman', baseTimes: { Fajr: '04:02', Sunrise: '05:35', Dhuhr: '12:35', Asr: '16:15', Maghrib: '19:35', Isha: '21:05' } },
      { ar: 'الزرقاء', en: 'Zarqa', baseTimes: { Fajr: '04:01', Sunrise: '05:34', Dhuhr: '12:35', Asr: '16:15', Maghrib: '19:35', Isha: '21:05' } },
      { ar: 'إربد', en: 'Irbid', baseTimes: { Fajr: '04:00', Sunrise: '05:35', Dhuhr: '12:36', Asr: '16:16', Maghrib: '19:37', Isha: '21:07' } },
      { ar: 'العقبة', en: 'Aqaba', baseTimes: { Fajr: '04:12', Sunrise: '05:42', Dhuhr: '12:39', Asr: '16:14', Maghrib: '19:36', Isha: '21:02' } }
    ]
  },
  {
    ar: 'جمهورية العراق',
    en: 'Iraq',
    code: 'IQ',
    cities: [
      { ar: 'بغداد', en: 'Baghdad', baseTimes: { Fajr: '03:38', Sunrise: '05:12', Dhuhr: '12:12', Asr: '15:52', Maghrib: '19:12', Isha: '20:42' } },
      { ar: 'الموصل', en: 'Mosul', baseTimes: { Fajr: '03:32', Sunrise: '05:12', Dhuhr: '12:17', Asr: '16:01', Maghrib: '19:22', Isha: '20:55' } },
      { ar: 'البصرة', en: 'Basra', baseTimes: { Fajr: '03:42', Sunrise: '05:10', Dhuhr: '11:53', Asr: '15:28', Maghrib: '18:36', Isha: '20:06' } },
      { ar: 'أربيل', en: 'Erbil', baseTimes: { Fajr: '03:30', Sunrise: '05:10', Dhuhr: '12:14', Asr: '15:59', Maghrib: '19:19', Isha: '20:52' } },
      { ar: 'النجف الأشرف', en: 'Najaf', baseTimes: { Fajr: '03:43', Sunrise: '05:16', Dhuhr: '12:14', Asr: '15:52', Maghrib: '19:12', Isha: '20:41' } }
    ]
  },
  {
    ar: 'دولة فلسطين',
    en: 'Palestine',
    code: 'PS',
    cities: [
      { ar: 'القدس الشريف', en: 'Jerusalem', baseTimes: { Fajr: '04:05', Sunrise: '05:38', Dhuhr: '12:38', Asr: '16:18', Maghrib: '19:38', Isha: '21:08' } },
      { ar: 'غزة', en: 'Gaza', baseTimes: { Fajr: '04:10', Sunrise: '05:42', Dhuhr: '12:41', Asr: '16:20', Maghrib: '19:40', Isha: '21:10' } },
      { ar: 'رام الله', en: 'Ramallah', baseTimes: { Fajr: '04:05', Sunrise: '05:38', Dhuhr: '12:38', Asr: '16:18', Maghrib: '19:38', Isha: '21:08' } },
      { ar: 'نابلس', en: 'Nablus', baseTimes: { Fajr: '04:03', Sunrise: '05:37', Dhuhr: '12:38', Asr: '16:18', Maghrib: '19:39', Isha: '21:09' } }
    ]
  },
  {
    ar: 'الجمهورية اللبنانية',
    en: 'Lebanon',
    code: 'LB',
    cities: [
      { ar: 'بيروت', en: 'Beirut', baseTimes: { Fajr: '03:58', Sunrise: '05:35', Dhuhr: '12:38', Asr: '16:20', Maghrib: '19:41', Isha: '21:12' } },
      { ar: 'طرابلس', en: 'Tripoli', baseTimes: { Fajr: '03:56', Sunrise: '05:34', Dhuhr: '12:38', Asr: '16:21', Maghrib: '19:42', Isha: '21:14' } },
      { ar: 'صيدا', en: 'Sidon', baseTimes: { Fajr: '03:59', Sunrise: '05:36', Dhuhr: '12:38', Asr: '16:20', Maghrib: '19:40', Isha: '21:11' } }
    ]
  },
  {
    ar: 'الجمهورية العربية السورية',
    en: 'Syria',
    code: 'SY',
    cities: [
      { ar: 'دمشق', en: 'Damascus', baseTimes: { Fajr: '03:55', Sunrise: '05:32', Dhuhr: '12:35', Asr: '16:17', Maghrib: '19:38', Isha: '21:08' } },
      { ar: 'حلب', en: 'Aleppo', baseTimes: { Fajr: '03:47', Sunrise: '05:27', Dhuhr: '12:33', Asr: '16:18', Maghrib: '19:39', Isha: '21:12' } },
      { ar: 'حمص', en: 'Homs', baseTimes: { Fajr: '03:52', Sunrise: '05:30', Dhuhr: '12:34', Asr: '16:17', Maghrib: '19:38', Isha: '21:10' } }
    ]
  },
  {
    ar: 'المملكة المغربية',
    en: 'Morocco',
    code: 'MA',
    cities: [
      { ar: 'الرباط', en: 'Rabat', baseTimes: { Fajr: '03:52', Sunrise: '05:30', Dhuhr: '12:35', Asr: '16:18', Maghrib: '19:40', Isha: '21:10' } },
      { ar: 'الدار البيضاء', en: 'Casablanca', baseTimes: { Fajr: '03:55', Sunrise: '05:33', Dhuhr: '12:37', Asr: '16:20', Maghrib: '19:41', Isha: '21:11' } },
      { ar: 'مراكش', en: 'Marrakech', baseTimes: { Fajr: '04:02', Sunrise: '05:38', Dhuhr: '12:38', Asr: '16:18', Maghrib: '19:38', Isha: '21:06' } },
      { ar: 'طنجة', en: 'Tangier', baseTimes: { Fajr: '03:48', Sunrise: '05:28', Dhuhr: '12:35', Asr: '16:20', Maghrib: '19:42', Isha: '21:15' } },
      { ar: 'فاس', en: 'Fes', baseTimes: { Fajr: '03:48', Sunrise: '05:26', Dhuhr: '12:31', Asr: '16:13', Maghrib: '19:35', Isha: '21:05' } }
    ]
  },
  {
    ar: 'الجمهورية الجزائرية',
    en: 'Algeria',
    code: 'DZ',
    cities: [
      { ar: 'الجزائر العاصمة', en: 'Algiers', baseTimes: { Fajr: '03:46', Sunrise: '05:25', Dhuhr: '12:48', Asr: '16:32', Maghrib: '20:11', Isha: '21:43' } },
      { ar: 'وهران', en: 'Oran', baseTimes: { Fajr: '03:58', Sunrise: '05:36', Dhuhr: '12:58', Asr: '16:42', Maghrib: '20:20', Isha: '21:51' } },
      { ar: 'قسنطينة', en: 'Constantine', baseTimes: { Fajr: '03:36', Sunrise: '05:15', Dhuhr: '12:38', Asr: '16:22', Maghrib: '20:01', Isha: '21:33' } }
    ]
  },
  {
    ar: 'الجمهورية التونسية',
    en: 'Tunisia',
    code: 'TN',
    cities: [
      { ar: 'تونس العاصمة', en: 'Tunis', baseTimes: { Fajr: '03:26', Sunrise: '05:06', Dhuhr: '12:28', Asr: '16:12', Maghrib: '19:50', Isha: '21:23' } },
      { ar: 'صفاقس', en: 'Sfax', baseTimes: { Fajr: '03:32', Sunrise: '05:09', Dhuhr: '12:27', Asr: '16:09', Maghrib: '19:45', Isha: '21:16' } },
      { ar: 'سوسة', en: 'Sousse', baseTimes: { Fajr: '03:28', Sunrise: '05:07', Dhuhr: '12:27', Asr: '16:10', Maghrib: '19:47', Isha: '21:19' } }
    ]
  },
  {
    ar: 'الجمهورية اليمنية',
    en: 'Yemen',
    code: 'YE',
    cities: [
      { ar: 'صنعاء', en: 'Sanaa', baseTimes: { Fajr: '04:22', Sunrise: '05:38', Dhuhr: '12:12', Asr: '15:26', Maghrib: '18:38', Isha: '19:52' } },
      { ar: 'عدن', en: 'Aden', baseTimes: { Fajr: '04:25', Sunrise: '05:39', Dhuhr: '12:10', Asr: '15:22', Maghrib: '18:34', Isha: '19:47' } },
      { ar: 'تعز', en: 'Taiz', baseTimes: { Fajr: '04:26', Sunrise: '05:41', Dhuhr: '12:13', Asr: '15:26', Maghrib: '18:38', Isha: '19:51' } }
    ]
  },
  {
    ar: 'جمهورية السودان',
    en: 'Sudan',
    code: 'SD',
    cities: [
      { ar: 'الخرطوم', en: 'Khartoum', baseTimes: { Fajr: '04:12', Sunrise: '05:30', Dhuhr: '12:02', Asr: '15:22', Maghrib: '18:25', Isha: '19:43' } },
      { ar: 'أم درمان', en: 'Omdurman', baseTimes: { Fajr: '04:12', Sunrise: '05:30', Dhuhr: '12:02', Asr: '15:22', Maghrib: '18:25', Isha: '19:43' } },
      { ar: 'بورتسودان', en: 'Port Sudan', baseTimes: { Fajr: '03:53', Sunrise: '05:13', Dhuhr: '11:47', Asr: '15:08', Maghrib: '18:12', Isha: '19:31' } }
    ]
  },
  {
    ar: 'دولة ليبيا',
    en: 'Libya',
    code: 'LY',
    cities: [
      { ar: 'طرابلس', en: 'Tripoli', baseTimes: { Fajr: '04:12', Sunrise: '05:48', Dhuhr: '13:08', Asr: '16:51', Maghrib: '20:28', Isha: '21:56' } },
      { ar: 'بنغازي', en: 'Benghazi', baseTimes: { Fajr: '03:52', Sunrise: '05:28', Dhuhr: '12:48', Asr: '16:31', Maghrib: '20:08', Isha: '21:36' } }
    ]
  },
  {
    ar: 'الجمهورية التركية',
    en: 'Turkey',
    code: 'TR',
    cities: [
      { ar: 'اسطنبول', en: 'Istanbul', baseTimes: { Fajr: '03:42', Sunrise: '05:32', Dhuhr: '13:08', Asr: '17:01', Maghrib: '20:34', Isha: '22:15' } },
      { ar: 'أنقرة', en: 'Ankara', baseTimes: { Fajr: '03:32', Sunrise: '05:20', Dhuhr: '12:53', Asr: '16:47', Maghrib: '20:20', Isha: '22:00' } }
    ]
  }
];

// Calculation Method ID for Aladhan API
export const METHOD_IDS: { [key: string]: number } = {
  UmmAlQura: 4,
  MWL: 3,
  ISNA: 2,
  Egypt: 5,
};

// Helper to find Country & City
export function findCountryAndCity(countryName?: string, cityName?: string) {
  let countryObj = PRAYER_COUNTRIES.find(c => c.ar === countryName || c.en === countryName);
  
  if (!countryObj) {
    // Search city in all countries if country not explicitly set
    countryObj = PRAYER_COUNTRIES.find(c => c.cities.some(city => city.ar === cityName || city.en === cityName)) || PRAYER_COUNTRIES[0]; // Default Bahrain
  }

  const cityObj = countryObj.cities.find(c => c.ar === cityName || c.en === cityName) || countryObj.cities[0];

  return { country: countryObj, city: cityObj };
}

export function calculateDuhaTime(sunriseTime: string): string {
  if (!sunriseTime || !sunriseTime.includes(':')) return '05:45';
  const [hStr, mStr] = sunriseTime.split(':');
  let h = parseInt(hStr, 10);
  let m = parseInt(mStr, 10) + 18; // ~18 minutes after sunrise
  if (m >= 60) {
    h += Math.floor(m / 60);
    m = m % 60;
  }
  h = (h + 24) % 24;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

// Fetch or Calculate accurate timings by latitude & longitude GPS
export async function getPrayerTimesByCoordinates(
  lat: number,
  lng: number,
  method: string = 'UmmAlQura'
) {
  const methodId = METHOD_IDS[method] || 4;
  try {
    const res = await fetch(
      `https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lng}&method=${methodId}`
    );
    if (res.ok) {
      const json = await res.json();
      if (json && json.data && json.data.timings) {
        const t = json.data.timings;
        const meta = json.data.meta;
        const sunrise = t.Sunrise?.substring(0, 5) || '05:30';
        return {
          source: 'api',
          timezone: meta?.timezone || 'Auto-Detected',
          hijriDate: json.data.date?.hijri ? `${json.data.date.hijri.day} ${json.data.date.hijri.month.ar} ${json.data.date.hijri.year} هـ` : undefined,
          times: {
            Fajr: t.Fajr?.substring(0, 5),
            Sunrise: sunrise,
            Duha: calculateDuhaTime(sunrise),
            Dhuhr: t.Dhuhr?.substring(0, 5),
            Asr: t.Asr?.substring(0, 5),
            Maghrib: t.Maghrib?.substring(0, 5),
            Isha: t.Isha?.substring(0, 5),
          }
        };
      }
    }
  } catch (err) {
    console.error('GPS Aladhan API fetch error:', err);
  }
  return null;
}

// Fetch or Calculate accurate timings
export async function getAccuratePrayerTimes(
  countryName: string = 'مملكة البحرين',
  cityName: string = 'المنامة',
  method: string = 'UmmAlQura'
) {
  const { country, city } = findCountryAndCity(countryName, cityName);
  const methodId = METHOD_IDS[method] || 4;

  try {
    // Try Aladhan API for exact current live times
    const res = await fetch(
      `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(city.en)}&country=${encodeURIComponent(country.en)}&method=${methodId}`
    );
    if (res.ok) {
      const json = await res.json();
      if (json && json.data && json.data.timings) {
        const t = json.data.timings;
        const sunrise = t.Sunrise?.substring(0, 5) || city.baseTimes.Sunrise;
        return {
          source: 'api',
          country: country.ar,
          city: city.ar,
          hijriDate: json.data.date?.hijri ? `${json.data.date.hijri.day} ${json.data.date.hijri.month.ar} ${json.data.date.hijri.year} هـ` : undefined,
          times: {
            Fajr: t.Fajr?.substring(0, 5) || city.baseTimes.Fajr,
            Sunrise: sunrise,
            Duha: calculateDuhaTime(sunrise),
            Dhuhr: t.Dhuhr?.substring(0, 5) || city.baseTimes.Dhuhr,
            Asr: t.Asr?.substring(0, 5) || city.baseTimes.Asr,
            Maghrib: t.Maghrib?.substring(0, 5) || city.baseTimes.Maghrib,
            Isha: t.Isha?.substring(0, 5) || city.baseTimes.Isha,
          }
        };
      }
    }
  } catch (err) {
    console.log('Aladhan API offline or unreachable, using seasonal calculation fallback', err);
  }

  // Fallback calculation using base times + seasonal shift
  const today = new Date();
  const start = new Date(today.getFullYear(), 0, 0);
  const diff = today.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  const seasonalShift = Math.round(15 * Math.sin((dayOfYear + 80) * 2 * Math.PI / 365));

  const formatAndShift = (timeStr: string, shiftMins: number) => {
    const [hStr, mStr] = timeStr.split(':');
    let h = parseInt(hStr);
    let m = parseInt(mStr) + shiftMins;
    if (m >= 60) {
      h += Math.floor(m / 60);
      m = m % 60;
    } else if (m < 0) {
      h -= Math.ceil(Math.abs(m) / 60);
      m = 60 - (Math.abs(m) % 60);
    }
    h = (h + 24) % 24;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  const base = city.baseTimes;
  const sunriseShifted = formatAndShift(base.Sunrise, seasonalShift - 3);
  return {
    source: 'fallback',
    country: country.ar,
    city: city.ar,
    times: {
      Fajr: formatAndShift(base.Fajr, seasonalShift),
      Sunrise: sunriseShifted,
      Duha: calculateDuhaTime(sunriseShifted),
      Dhuhr: formatAndShift(base.Dhuhr, seasonalShift + 2),
      Asr: formatAndShift(base.Asr, seasonalShift + 5),
      Maghrib: formatAndShift(base.Maghrib, seasonalShift + 2),
      Isha: formatAndShift(base.Isha, seasonalShift + 1),
    }
  };
}
