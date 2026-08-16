import { LocalNotifications } from '@capacitor/local-notifications';

export const PrayerNotificationManager = {
  
  // طلب الأذن لعرض الإشعارات (مهم جداً لأول مرة على الآيفون والأنظمة)
  async requestPermissions() {
    try {
      const result = await LocalNotifications.requestPermissions();
      return result.display === 'granted';
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  },

  // جدولة إشعار "قبل الصلاة بقليل" (مثلاً قبل الأذان بـ 5 أو 10 دقائق)
  async schedulePrePrayerAlert(prayerName: string, prayerTime: Date, minutesBefore: number = 5) {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) return;

    // حساب وقت الإشعار قبل الصلاة
    const triggerTime = new Date(prayerTime.getTime() - minutesBefore * 60000);

    // إذا كان الوقت قد فات، لا تقم بالجدولة
    if (triggerTime.getTime() <= Date.now()) return;

    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            title: `${prayerName} بعد قليل 🕌`,
            body: `تشتاق لمرافقة النبي ﷺ؟ مفتاحها كثرة السجود. توضأ لتدرك الصلاة من أولها ➡️`,
            id: Math.floor(Math.random() * 1000000), // معرف فريد للإشعار
            schedule: { at: triggerTime },
            sound: 'default', // يمكن استبداله بصوت الآذان المخصص إن توفر
            smallIcon: 'ic_stat_icon_config_sample',
            iconColor: '#10B981',
            extra: {
              type: 'pre-prayer',
              prayer: prayerName
            }
          }
        ]
      });
      console.log(`تم جدولة إشعار التذكير لـ ${prayerName} في تمام الساعة: ${triggerTime.toLocaleTimeString()}`);
    } catch (e) {
      console.error('فشل في جدولة إشعار التذكير:', e);
    }
  },

  // جدولة إشعار وقت الأذان الفعلي (عند دخول الوقت تماماً)
  async scheduleExactAdhanAlert(prayerName: string, prayerTime: Date) {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) return;

    if (prayerTime.getTime() <= Date.now()) return;

    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            title: `حَان الآن موعد ${prayerName} 🕋`,
            body: `حي على الصلاة، حي على الفلاح. استعد لأداء الصلاة في وقتها.`,
            id: Math.floor(Math.random() * 1000000) + 1,
            schedule: { at: prayerTime },
            sound: 'default', // سينطلق صوت الإشعار أو الآذان على شاشة القفل وفي الخلفية
            smallIcon: 'ic_stat_icon_config_sample',
            iconColor: '#047857',
            extra: {
              type: 'adhan-time',
              prayer: prayerName
            }
          }
        ]
      });
      console.log(`تم جدولة أذان ${prayerName} تماماً في: ${prayerTime.toLocaleTimeString()}`);
    } catch (e) {
      console.error('فشل في جدولة وقت الأذان:', e);
    }
  },

  // إلغاء جميع الإشعارات القديمة لتجنب التكرار عند إعادة حساب الأوقات يومياً
  async clearAllPendingNotifications() {
    try {
      const pending = await LocalNotifications.getPending();
      if (pending.notifications.length > 0) {
        await LocalNotifications.cancel(pending);
      }
    } catch (e) {
      console.error('Error clearing notifications:', e);
    }
  },

  // دالة جدولة تلقائية لجميع صلوات اليوم
  async scheduleAllDailyPrayers(timesMap: { Fajr: string; Dhuhr: string; Asr: string; Maghrib: string; Isha: string }) {
    const granted = await this.requestPermissions();
    if (!granted) return;

    await this.clearAllPendingNotifications();

    const now = new Date();
    const prayerEntries = [
      { name: 'الفجر', timeStr: timesMap.Fajr },
      { name: 'الظهر', timeStr: timesMap.Dhuhr },
      { name: 'العصر', timeStr: timesMap.Asr },
      { name: 'المغرب', timeStr: timesMap.Maghrib },
      { name: 'العشاء', timeStr: timesMap.Isha },
    ];

    for (const p of prayerEntries) {
      if (!p.timeStr) continue;
      const [h, m] = p.timeStr.split(':').map(Number);
      let prayerDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0);

      // If passed today, schedule for tomorrow
      if (prayerDate.getTime() <= now.getTime()) {
        prayerDate.setDate(prayerDate.getDate() + 1);
      }

      // Pre-prayer alert 5 mins before
      await this.schedulePrePrayerAlert(p.name, prayerDate, 5);
      // Exact adhan alert
      await this.scheduleExactAdhanAlert(p.name, prayerDate);
    }
  },

  // دالة تهيئة واستماع للنقرات داخل التطبيق
  initListener(onNotificationTap?: (action: any) => void) {
    try {
      LocalNotifications.addListener('localNotificationActionPerformed', (notificationAction) => {
        console.log('تم الضغط على الإشعار من المستخدم:', notificationAction);
        if (onNotificationTap) {
          onNotificationTap(notificationAction);
        }
      });
    } catch (e) {
      console.error('Listener error:', e);
    }
  }
};
