import { StatusBar } from 'expo-status-bar';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View, AppState, Alert } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { useState, useEffect, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { getAllJournals, getJournalByDate, deleteJournal } from '../services/journalService';
import { JournalEntry, Emotion } from '../types/journal';

// 커스텀 날짜 컴포넌트
const CustomDay = ({ date, state, marking, onPress }: any) => {
  const journal = marking?.emotion;
  
  return (
    <TouchableOpacity
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 40,
        minWidth: 40,
      }}
      onPress={() => onPress && onPress({ dateString: date.dateString } as DateData)}
    >
      {journal ? (
        // 일기가 있으면 아이콘만 크게 표시
        <Ionicons 
          name={journal.icon as any} 
          size={32} 
          color={journal.color} 
        />
      ) : (
        // 일기가 없으면 날짜 숫자 표시
        <Text style={{
          fontSize: 18,
          fontFamily: 'NanumPen',
          color: state === 'disabled' ? '#cbd5e1' : state === 'today' ? '#b8956a' : '#1e293b',
          fontWeight: (state === 'today' ? '700' : 'normal') as '700' | 'normal',
        }}>
          {date.day}
        </Text>
      )}
    </TouchableOpacity>
  );
};

type HomeScreenProps = {
  onNavigateToSettings: () => void;
  onNavigateToStats: () => void;
  onNavigateToJournalWrite: (emotion: Emotion, selectedDate?: string, existingJournal?: JournalEntry | null) => void;
};

export default function HomeScreen({ onNavigateToSettings, onNavigateToStats, onNavigateToJournalWrite }: HomeScreenProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedJournal, setSelectedJournal] = useState<JournalEntry | null>(null);
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [markedDates, setMarkedDates] = useState<Record<string, any>>({});
  const [listViewMode, setListViewMode] = useState(false);

  const appState = useRef(AppState.currentState);

  // 일기 목록 불러오기
  useEffect(() => {
    loadJournals();
  }, []);

  // 앱이 포그라운드로 돌아올 때 일기 목록 새로고침
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        loadJournals();
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const loadJournals = async () => {
    try {
      const allJournals = await getAllJournals();
      setJournals(allJournals);
      
      // 달력에 표시할 markedDates 생성 (아이콘 정보 포함)
      const marked: Record<string, any> = {};
      allJournals.forEach(journal => {
        marked[journal.date] = {
          marked: true,
          dotColor: journal.emotion.color,
          customStyles: {
            container: {
              position: 'relative',
            },
          },
          emotion: journal.emotion, // 감정 정보 저장
        };
      });
      setMarkedDates(marked);
    } catch (error) {
      console.error('일기 불러오기 실패:', error);
    }
  };

  const emotions: Emotion[] = [
    { label: '기쁨', icon: 'sunny', color: '#fcd34d' },
    { label: '평온', icon: 'leaf', color: '#a5b4fc' },
    { label: '슬픔', icon: 'rainy', color: '#93c5fd' },
    { label: '화남', icon: 'flame', color: '#fca5a5' },
    { label: '불안', icon: 'alert-circle', color: '#fdba74' },
    { label: '지침', icon: 'moon', color: '#a78bfa' },
  ];

  const handleDayPress = async (day: DateData) => {
    const dateString = day.dateString;
    setSelectedDate(dateString);
    
    // 해당 날짜의 일기 확인
    const journal = await getJournalByDate(dateString);
    
    if (journal) {
      // 일기가 있으면 감정 표시
      setSelectedJournal(journal);
      setModalVisible(true);
    } else {
      // 일기가 없으면 감정 선택 모달
      setSelectedJournal(null);
      setModalVisible(true);
    }
  };

  const handleEmotionPress = (emotion: Emotion) => {
    setModalVisible(false);
    // Modal이 완전히 닫힌 후 네비게이션 실행
    requestAnimationFrame(() => {
      onNavigateToJournalWrite(emotion, selectedDate || undefined, selectedJournal);
    });
  };

  // 일기 삭제
  const handleDeleteJournal = async (journal: JournalEntry) => {
    Alert.alert(
      '일기 삭제',
      '정말 이 일기를 삭제하시겠어요?',
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteJournal(journal.id);
              loadJournals();
            } catch (error) {
              console.error('일기 삭제 실패:', error);
              Alert.alert('오류', '일기 삭제에 실패했습니다.');
            }
          },
        },
      ]
    );
  };

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
  };

  // 일기 목록 정렬 (최신순)
  const sortedJournals = [...journals].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });


  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>마음 일기</Text>
          <Text style={styles.headerSubtitle}>오늘 당신의 마음을 토닥여줄게요.</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            onPress={() => setListViewMode(!listViewMode)} 
            style={styles.listButton}
          >
            <Ionicons 
              name={listViewMode ? "calendar-outline" : "document-text-outline"} 
              size={24} 
              color="#b8956a" 
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={onNavigateToStats} style={styles.statsButton}>
            <Ionicons name="stats-chart" size={24} color="#b8956a" />
          </TouchableOpacity>
          <TouchableOpacity onPress={onNavigateToSettings} style={[styles.settingsButton, { marginLeft: 8 }]}>
            <Ionicons name="settings" size={24} color="#b8956a" />
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {listViewMode ? (
          // 목록 보기 모드
          <View style={styles.listContainer}>
            {sortedJournals.length === 0 ? (
              <View style={styles.emptyListContainer}>
                <Text style={styles.emptyListText}>
                  아직 작성한 일기가 없어요.{'\n'}첫 일기를 작성해보세요!
                </Text>
              </View>
            ) : (
              sortedJournals.map((journal) => (
                <View key={journal.id} style={styles.journalListItem}>
                  <View style={styles.journalListItemHeader}>
                    <View style={styles.journalListItemLeft}>
                      <Ionicons 
                        name={journal.emotion.icon as any} 
                        size={24} 
                        color={journal.emotion.color} 
                      />
                      <View style={styles.journalListItemInfo}>
                        <Text style={styles.journalListItemDate}>{formatDate(journal.date)}</Text>
                        <Text style={styles.journalListItemEmotion}>{journal.emotion.label}</Text>
                      </View>
                    </View>
                  </View>
                  <Text style={styles.journalListItemContent} numberOfLines={3}>
                    {journal.content || '내용이 없습니다.'}
                  </Text>
                  <View style={styles.journalListItemActions}>
                    <TouchableOpacity
                      style={styles.editListItemButton}
                      onPress={() => {
                        setSelectedDate(journal.date);
                        setSelectedJournal(journal);
                        onNavigateToJournalWrite(journal.emotion, journal.date, journal);
                      }}
                    >
                      <Ionicons name="create-outline" size={18} color="#b8956a" />
                      <Text style={styles.editListItemButtonText}>수정</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteListItemButton}
                      onPress={() => handleDeleteJournal(journal)}
                    >
                      <Ionicons name="trash-outline" size={18} color="#ef4444" />
                      <Text style={styles.deleteListItemButtonText}>삭제</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        ) : (
          // 달력 보기 모드
          <>
            <View style={styles.calendarCard}>
              <Calendar
                style={styles.calendar}
                theme={{
                  backgroundColor: '#fdfbf7',
                  calendarBackground: '#fdfbf7',
                  todayTextColor: '#b8956a',
                  selectedDayBackgroundColor: '#b8956a',
                  arrowColor: '#b8956a',
                  textDayFontWeight: '600',
                  textMonthFontWeight: '700',
                  textDayHeaderFontWeight: '700',
                  textDayFontFamily: 'NanumPen',
                  textMonthFontFamily: 'NanumPen',
                  textDayHeaderFontFamily: 'NanumPen',
                  textDayFontSize: 18,
                  textMonthFontSize: 22,
                  textDayHeaderFontSize: 16,
                }}
                onDayPress={handleDayPress}
                markedDates={markedDates}
                dayComponent={CustomDay}
              />
            </View>

            <View style={styles.quoteCard}>
              <Text style={styles.quoteText}>
                "기록은 마음을 정리하는 첫 걸음이에요.{'\n'}오늘의 감정을 저에게 살짝 들려주세요."
              </Text>
            </View>
          </>
        )}
      </ScrollView>
      <StatusBar style="auto" />

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                {selectedJournal ? (
                  <>
                    <Text style={styles.modalTitle}>오늘의 감정</Text>
                    <View style={styles.selectedEmotionContainer}>
                      <Ionicons name={selectedJournal.emotion.icon as any} size={32} color={selectedJournal.emotion.color} />
                      <Text style={styles.selectedEmotionLabel}>{selectedJournal.emotion.label}</Text>
                    </View>
                  </>
                ) : (
                  <>
                    <Text style={styles.modalTitle}>지금 어떤 기분인가요?</Text>
                    <Text style={styles.modalSubtitle}>감정을 먼저 골라주세요</Text>
                  </>
                )}
              </View>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={20} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            {selectedJournal ? (
              <View style={styles.journalContentContainer}>
                <Text style={styles.journalContent}>{selectedJournal.content || '내용이 없습니다.'}</Text>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => {
                    setModalVisible(false);
                    requestAnimationFrame(() => {
                      onNavigateToJournalWrite(selectedJournal.emotion, selectedDate || undefined, selectedJournal);
                    });
                  }}
                >
                  <Text style={styles.editButtonText}>수정하기</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.emojiGrid}>
                {emotions.map((emotion, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.emojiButton}
                    onPress={() => handleEmotionPress(emotion)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name={emotion.icon as any} size={48} color={emotion.color} />
                    <Text style={styles.emojiLabel}>{emotion.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>
      </Modal>
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
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
  },
  listButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  statsButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 0,
    paddingTop: 40,
    paddingBottom: 96,
    flexGrow: 1,
    justifyContent: 'center',
  },
  calendarCard: {
    backgroundColor: '#fdfbf7',
    borderRadius: 0,
    padding: 20,
    marginBottom: 24,
    width: '100%',
  },
  calendar: {
    borderRadius: 0,
    backgroundColor: '#fdfbf7',
    width: '100%',
  },
  quoteCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 32,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  quoteText: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 22,
    fontStyle: 'italic',
    textAlign: 'center',
    fontFamily: 'NanumPen',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(99, 102, 241, 0.3)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 48,
    borderTopRightRadius: 48,
    padding: 32,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 32,
  },
  modalHeaderLeft: {
    flex: 1,
    marginRight: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1e293b',
    letterSpacing: -0.5,
    marginBottom: 4,
    fontFamily: 'NanumPen',
  },
  modalSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontFamily: 'NanumPen',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  emojiButton: {
    width: '30%',
    minWidth: 100,
    padding: 20,
    borderRadius: 24,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emojiLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontFamily: 'NanumPen',
  },
  selectedEmotionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  selectedEmotionLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    fontFamily: 'NanumPen',
  },
  journalContentContainer: {
    marginTop: 16,
  },
  journalContent: {
    fontSize: 16,
    color: '#334155',
    lineHeight: 24,
    fontFamily: 'NanumPen',
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 16,
  },
  editButton: {
    backgroundColor: '#b8956a',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    fontFamily: 'NanumPen',
  },
  customDayContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  journalDayContainer: {
    // 일기가 있는 날짜는 아이콘이 꽉 차도록
    width: '100%',
    height: '100%',
  },
  customDayText: {
    fontSize: 18,
    fontFamily: 'NanumPen',
    color: '#1e293b',
  },
  todayContainer: {
    borderRadius: 20,
  },
  todayText: {
    color: '#b8956a',
    fontWeight: '700',
  },
  disabledText: {
    color: '#cbd5e1',
  },
  listContainer: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  emptyListContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyListText: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    fontFamily: 'NanumPen',
    lineHeight: 24,
  },
  journalListItem: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  journalListItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  journalListItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  journalListItemInfo: {
    marginLeft: 12,
    flex: 1,
  },
  journalListItemDate: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    fontFamily: 'NanumPen',
    marginBottom: 4,
  },
  journalListItemEmotion: {
    fontSize: 14,
    color: '#64748b',
    fontFamily: 'NanumPen',
  },
  journalListItemContent: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 22,
    fontFamily: 'NanumPen',
    marginBottom: 16,
  },
  journalListItemActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  editListItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  editListItemButtonText: {
    fontSize: 14,
    color: '#b8956a',
    fontFamily: 'NanumPen',
    marginLeft: 6,
    fontWeight: '600',
  },
  deleteListItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fee2e2',
  },
  deleteListItemButtonText: {
    fontSize: 14,
    color: '#ef4444',
    fontFamily: 'NanumPen',
    marginLeft: 6,
    fontWeight: '600',
  },
});