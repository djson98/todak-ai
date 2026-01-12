import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Calendar from 'expo-calendar';
import { Ionicons } from '@expo/vector-icons';

type SettingsScreenProps = {
  onBack: () => void;
  onLogout?: () => void;
};

type CalendarEvent = {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
};

export default function SettingsScreen({ onBack, onLogout }: SettingsScreenProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [tone, setTone] = useState<string>('귀여운 말투');
  const [proactiveMode, setProactiveMode] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(false);

  const toneOptions = ['귀여운 말투', '친근한 말투', '정중한 말투'];
  
  // 임의의 아이디 (가짜 데이터)
  const currentUserId = 'user_1234';

  useEffect(() => {
    loadCalendarEvents();
  }, []);

  const loadCalendarEvents = async () => {
    try {
      // 권한 요청
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status !== 'granted') {
        console.log('캘린더 권한이 거부되었습니다.');
        setLoading(false);
        return;
      }

      // 캘린더 목록 가져오기
      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      if (calendars.length === 0) {
        setLoading(false);
        return;
      }

      // 오늘부터 7일 후까지의 일정 가져오기
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 7);

      const eventsData = await Calendar.getEventsAsync(
        calendars.map(cal => cal.id),
        startDate,
        endDate
      );

      const formattedEvents: CalendarEvent[] = eventsData.map(event => ({
        id: event.id,
        title: event.title,
        startDate: new Date(event.startDate),
        endDate: new Date(event.endDate),
      }));

      setEvents(formattedEvents);
    } catch (error) {
      console.error('캘린더 일정 가져오기 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return `${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>설정</Text>
          <Text style={styles.headerSubtitle}>오늘 당신의 마음을 토닥여줄게요.</Text>
        </View>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#1e293b" />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View>
          {/* 현재 아이디 표시 */}
          <View style={[styles.settingItem, { marginBottom: 16 }]}>
            <View>
              <Text style={styles.settingLabel}>현재 아이디</Text>
              <Text style={styles.userIdText}>{currentUserId}</Text>
            </View>
          </View>

          <View style={[styles.settingItem, { marginBottom: 16 }]}>
            <Text style={styles.settingLabel}>말투 선택</Text>
            <View style={styles.toneSelector}>
              {toneOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.toneOption,
                    tone === option && styles.toneOptionActive
                  ]}
                  onPress={() => setTone(option)}
                >
                  <Text style={[
                    styles.toneOptionText,
                    tone === option && styles.toneOptionTextActive
                  ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={[styles.settingItem, { marginBottom: 16 }]}>
            <Text style={styles.settingLabel}>선톡 모드</Text>
            <TouchableOpacity
              style={[styles.toggle, proactiveMode && styles.toggleActive]}
              onPress={() => setProactiveMode(!proactiveMode)}
            >
              <View style={[
                styles.toggleThumb,
                proactiveMode && styles.toggleThumbActive
              ]} />
            </TouchableOpacity>
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>다크 모드</Text>
            <TouchableOpacity
              style={[styles.toggle, darkMode && styles.toggleActive]}
              onPress={() => setDarkMode(!darkMode)}
            >
              <View style={[
                styles.toggleThumb,
                darkMode && styles.toggleThumbActive
              ]} />
            </TouchableOpacity>
          </View>
        </View>

        {/* 로그아웃 버튼 */}
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={onLogout}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={20} color="#ef4444" style={{ marginRight: 8 }} />
          <Text style={styles.logoutButtonText}>로그아웃</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Todak-AI v1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fdfbf7',
  },
  header: {
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    letterSpacing: -0.5,
    fontFamily: 'NanumPen',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '500',
    marginTop: 2,
    fontFamily: 'NanumPen',
  },
  heartIcon: {
    width: 40,
    height: 40,
    borderRadius: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
    marginRight: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 96,
  },
  settingItem: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
    fontFamily: 'NanumPen',
    marginBottom: 12,
  },
  userIdText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
    fontFamily: 'NanumPen',
    marginTop: 4,
  },
  toneSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  toneOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginRight: 8,
    marginBottom: 8,
  },
  toneOptionActive: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  toneOptionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    fontFamily: 'NanumPen',
  },
  toneOptionTextActive: {
    color: '#fff',
  },
  toggle: {
    width: 48,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    position: 'relative',
  },
  toggleActive: {
    backgroundColor: '#6366f1',
  },
  toggleThumb: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
    position: 'absolute',
    left: 4,
    top: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  toggleThumbActive: {
    left: 28,
  },
  logoutButton: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#fee2e2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
    fontFamily: 'NanumPen',
  },
  version: {
    fontSize: 10,
    color: '#cbd5e1',
    textAlign: 'center',
    marginTop: 40,
  },
});