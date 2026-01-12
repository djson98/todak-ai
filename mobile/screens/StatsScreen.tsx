import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Emotion = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
};

type StatsScreenProps = {
  onBack: () => void;
  entries?: any[]; // 나중에 실제 데이터 타입으로 변경
};

// 감정 설정
const EMOTIONS: Emotion[] = [
  { label: '기쁨', icon: 'sunny', color: '#fcd34d' },
  { label: '평온', icon: 'leaf', color: '#a5b4fc' },
  { label: '슬픔', icon: 'rainy', color: '#93c5fd' },
  { label: '화남', icon: 'flame', color: '#fca5a5' },
  { label: '불안', icon: 'alert-circle', color: '#fdba74' },
];

export default function StatsScreen({ onBack, entries = [] }: StatsScreenProps) {
  // 감정별 카운트 계산
  const emotionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    EMOTIONS.forEach(emotion => {
      counts[emotion.label] = 0;
    });
    // entries가 있으면 카운트 (나중에 실제 데이터 연동)
    return counts;
  }, [entries]);

  const totalCount = Object.values(emotionCounts).reduce((sum, count) => sum + count, 0);

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
            <Ionicons name="heart" size={24} color="#6366f1" />
          </View>
          <Text style={styles.greetingTitle}>
            {totalCount > 0 ? '마음을 잘 돌보고 계시네요.' : '첫 기록을 시작해보세요.'}
          </Text>
          <Text style={styles.greetingSubtitle}>
            꾸준한 기록은 마음 근육을 키워줍니다.
          </Text>
        </View>

        {/* 감정 분포 */}
        <View style={styles.chartCard}>
          <Text style={styles.sectionTitle}>감정 분포</Text>
          
          {totalCount === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>아직 기록이 없습니다.</Text>
            </View>
          ) : (
            <>
              {/* 중앙 숫자 표시 */}
              <View style={styles.centerCircle}>
                <Text style={styles.totalCount}>{totalCount}</Text>
                <Text style={styles.totalLabel}>기록수</Text>
              </View>

              <View>
                {EMOTIONS.map((emotion) => {
                  const count = emotionCounts[emotion.label] || 0;
                  const percentage = totalCount > 0 ? (count / totalCount) * 100 : 0;
                  
                  return (
                    <View key={emotion.label} style={styles.emotionItem}>
                      <View style={styles.emotionInfo}>
                        <Ionicons name={emotion.icon} size={20} color={emotion.color} style={{ marginRight: 8 }} />
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
            </>
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
    fontSize: 10,
    fontWeight: '700',
    color: '#cbd5e1',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  centerCircle: {
    height: 192,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  totalCount: {
    fontSize: 48,
    fontWeight: '900',
    color: '#1e293b',
  },
  totalLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#cbd5e1',
    textTransform: 'uppercase',
    marginTop: 4,
  },
  emptyState: {
    height: 192,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#94a3b8',
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
    fontSize: 14,
    fontWeight: '500',
    color: '#334155',
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
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    width: 32,
    textAlign: 'right',
  },
});
