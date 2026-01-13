import { useState, useEffect } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createJournal, getJournalByDate, updateJournal } from '../services/journalService';
import { Emotion, JournalEntry } from '../types/journal';

type JournalWriteScreenProps = {
  emotion: Emotion;
  selectedDate?: string; // 선택한 날짜 (YYYY-MM-DD 형식)
  existingJournal?: JournalEntry | null; // 기존 일기 (수정 시)
  onBack: () => void;
  onSave?: () => void; // 저장 후 콜백
};

export default function JournalWriteScreen({ emotion, selectedDate, existingJournal, onBack, onSave }: JournalWriteScreenProps) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  
  // 선택한 날짜가 있으면 사용, 없으면 오늘 날짜 사용
  const dateString = selectedDate || (() => {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  })();
  
  // 날짜 포맷팅
  const date = selectedDate ? new Date(selectedDate + 'T00:00:00') : new Date();
  const formattedDate = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')} ${date.toLocaleDateString('ko-KR', { weekday: 'long' })}`;

  // 기존 일기 불러오기
  useEffect(() => {
    loadExistingJournal();
  }, []);

  const loadExistingJournal = async () => {
    try {
      // props로 전달된 기존 일기가 있으면 사용
      if (existingJournal) {
        setContent(existingJournal.content);
        return;
      }
      
      // 없으면 날짜로 조회
      const existing = await getJournalByDate(dateString);
      if (existing) {
        setContent(existing.content);
      }
    } catch (error) {
      console.error('일기 불러오기 실패:', error);
    }
  };

  const handleSave = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      // 기존 일기 확인
      const existing = await getJournalByDate(dateString);
      
      if (existing) {
        // 수정
        await updateJournal(existing.id, {
          content,
          emotion,
        });
      } else {
        // 새로 생성
        await createJournal({
          date: dateString,
          emotion: {
            label: emotion.label,
            icon: emotion.icon,
            color: emotion.color,
          },
          content,
        });
      }
      
      if (onSave) {
        onSave();
      }
      onBack();
    } catch (error: any) {
      console.error('일기 저장 실패:', error);
      
      // 에러 메시지 추출
      const errorMessage = error?.message || '일기 저장에 실패했습니다.';
      
      // Firebase 미설정 에러인 경우 명확한 메시지 표시
      if (errorMessage.includes('데이터베이스가 설정되지 않았습니다') || 
          errorMessage.includes('Firebase')) {
        Alert.alert(
          '데이터베이스 미설정',
          'Firebase가 설정되지 않아 일기를 저장할 수 없습니다.\n\nFirebase 설정 후 다시 시도해주세요.',
          [{ text: '확인' }]
        );
      } else {
        Alert.alert('오류', errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#94a3b8" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={20} color="#94a3b8" />
        </TouchableOpacity>
        <View style={styles.backButton} />
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.emojiCircle}>
          <Ionicons name={emotion.icon as any} size={60} color={emotion.color} />
        </View>

        <TouchableOpacity style={styles.dateButton}>
          <Text style={styles.dateText}>{formattedDate}</Text>
          <Ionicons name="chevron-forward" size={14} color="#94a3b8" style={{ marginLeft: 4 }} />
        </TouchableOpacity>

        <TextInput
          autoFocus
          value={content}
          onChangeText={setContent}
          placeholder="오늘 하루를 기록해보세요"
          placeholderTextColor="#cbd5e1"
          multiline
          style={styles.textInput}
          textAlignVertical="top"
        />
      </ScrollView>

      <View style={styles.toolbar}>
        <View style={styles.toolbarLeft}>
          <TouchableOpacity style={styles.toolbarButton}>
            <Ionicons name="camera-outline" size={22} color="#94a3b8" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolbarButton}>
            <Ionicons name="document-text-outline" size={22} color="#94a3b8" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolbarButton}>
            <Ionicons name="time-outline" size={22} color="#94a3b8" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={handleSave}
          disabled={loading}
        >
          <Ionicons name="checkmark" size={28} color="#1e293b" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -8,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 32,
    paddingTop: 32,
    paddingBottom: 100,
  },
  emojiCircle: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 24,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 48,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#94a3b8',
  },
  textInput: {
    minHeight: 300,
    fontSize: 17,
    color: '#334155',
    lineHeight: 24,
    padding: 8,
  },
  toolbar: {
    height: 80,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  toolbarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toolbarButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 24,
  },
  saveButton: {
    padding: 12,
  },
});
