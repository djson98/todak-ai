import { useMemo, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAllJournals } from '../services/journalService';
import { JournalEntry } from '../types/journal';

type StatsScreenProps = {
  onBack: () => void;
};

// 감정 설정 (HomeScreen과 동일하게)
const EMOTIONS = [
  { label: '기쁨', icon: 'sunny', color: '#fcd34d' },
  { label: '평온', icon: 'leaf', color: '#a5b4fc' },
  { label: '슬픔', icon: 'rainy', color: '#93c5fd' },
  { label: '화남', icon: 'flame', color: '#fca5a5' },
  { label: '불안', icon: 'alert-circle', color: '#fdba74' },
  { label: '지침', icon: 'moon', color: '#94a3b8' },
];

export default function StatsScreen({ onBack }: StatsScreenProps) {
  const [journals, setJournals] = useState<JournalEntry[]>([]);

  // 일기 데이터 로드
  useEffect(() => {
    loadJournals();
  }, []);

  const loadJournals = async () => {
    try {
      const allJournals = await getAllJournals();
      setJournals(allJournals);
    } catch (error) {
      console.error('일기 불러오기 실패:', error);
    }
  };

  // 최근 1달간의 일기만 필터링
  const recentMonthJournals = useMemo(() => {
    const today = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(today.getMonth() - 1);

    return journals.filter(journal => {
      const journalDate = new Date(journal.date + 'T00:00:00');
      return journalDate >= oneMonthAgo && journalDate <= today;
    });
  }, [journals]);

  // 감정별 카운트 계산
  const emotionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    EMOTIONS.forEach(emotion => {
      counts[emotion.label] = 0;
    });

    // 최근 1달간의 일기에서 감정별 카운트
    recentMonthJournals.forEach(journal => {
      const emotionLabel = journal.emotion.label;
      if (counts.hasOwnProperty(emotionLabel)) {
        counts[emotionLabel]++;
      }
    });

    return counts;
  }, [recentMonthJournals]);

  const totalCount = Object.values(emotionCounts).reduce((sum, count) => sum + count, 0);

  // 감정 라벨을 형용사 형태로 변환
  const getEmotionAdjective = (label: string): string => {
    const adjectiveMap: Record<string, string> = {
      '기쁨': '기쁜',
      '평온': '평온한',
      '슬픔': '슬픈',
      '화남': '화난',
      '불안': '불안한',
      '지침': '지친',
    };
    return adjectiveMap[label] || label;
  };

  // 가장 많은 감정 찾기
  const mostFrequentEmotion = useMemo(() => {
    if (totalCount === 0) return null;
    
    let maxCount = 0;
    let maxEmotion = EMOTIONS[0];
    
    EMOTIONS.forEach(emotion => {
      const count = emotionCounts[emotion.label] || 0;
      if (count > maxCount) {
        maxCount = count;
        maxEmotion = emotion;
      }
    });
    
    return maxEmotion;
  }, [emotionCounts, totalCount]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>마음 분석</Text>
          <Text style={styles.headerSubtitle}>오늘 당신의 마음을 토닥여줄게요.</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#1e293b" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 인사 카드 */}
        <View style={styles.greetingCard}>
          <View style={styles.iconContainer}>
            {mostFrequentEmotion ? (
              <Ionicons 
                name={mostFrequentEmotion.icon as any} 
                size={24} 
                color={mostFrequentEmotion.color} 
              />
            ) : (
              <Ionicons name="heart" size={24} color="#6366f1" />
            )}
          </View>
          <Text style={styles.greetingTitle}>
            {mostFrequentEmotion 
              ? `최근 한 달, ${getEmotionAdjective(mostFrequentEmotion.label)} 날이 가장 많았어요.`
              : '첫 기록을 시작해보세요.'}
          </Text>
          {mostFrequentEmotion && (
            <Text style={styles.aiQuestion}>
              {getEmotionAdjective(mostFrequentEmotion.label)} 날이 많았던 이유는 뭐 때문이에요. (에이전트2의 응답을 여기서 받는거입니다 이부분추후업데이트)
            </Text>
          )}
        </View>

        {/* 감정 분포 */}
        <View style={styles.chartCard}>
          <Text style={styles.sectionTitle}>감정 분포 (최근 1개월)</Text>
          
          {totalCount === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>아직 기록이 없습니다.</Text>
            </View>
          ) : (
            <View>
                {EMOTIONS.map((emotion) => {
                  const count = emotionCounts[emotion.label] || 0;
                  const percentage = totalCount > 0 ? (count / totalCount) * 100 : 0;
                  
                  return (
                    <View key={emotion.label} style={styles.emotionItem}>
                      <View style={styles.emotionInfo}>
                        <Ionicons name={emotion.icon as any} size={20} color={emotion.color} style={{ marginRight: 8 }} />
                        <Text style={styles.emotionLabel}>{emotion.label}</Text>
                      </View>
                      <View style={styles.barContainer}>
                        <View 
                          style={[
                            styles.bar, 
                            { 
                              width: `${percentage}%`, 
                              backgroundColor: emotion.color 
                            }
                          ]} 
                        />
                      </View>
                      <Text style={styles.countText}>{count}</Text>
                    </View>
                  );
                })}
              </View>
          )}
        </View>
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
    paddingBottom: 96,
  },
  greetingCard: {
    backgroundColor: '#fff',
    borderRadius: 40,
    padding: 32,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#eef2ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  greetingTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
    textAlign: 'center',
    fontFamily: 'NanumPen',
  },
  aiQuestion: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 12,
    fontFamily: 'NanumPen',
    lineHeight: 20,
  },
  greetingSubtitle: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 16,
  },
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: 40,
    padding: 24,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#cbd5e1',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 24,
    paddingHorizontal: 8,
    fontFamily: 'NanumPen',
  },
  emptyState: {
    height: 192,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#94a3b8',
    fontFamily: 'NanumPen',
  },
  emotionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  emotionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 80,
  },
  emotionLabel: {
    fontSize: 18,
    fontWeight: '500',
    color: '#334155',
    fontFamily: 'NanumPen',
  },
  barContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 4,
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: 4,
  },
  countText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#475569',
    width: 40,
    textAlign: 'right',
    fontFamily: 'NanumPen',
  },
});
