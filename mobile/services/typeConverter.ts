import { Emotion, JournalEntry } from '../types/journal';
import { BackendDiaryEntry, BackendEmotion, BackendDiaryCreate } from './api';

// 프론트엔드 감정 → 백엔드 감정 변환
const emotionToBackend: Record<string, BackendEmotion> = {
  '기쁨': 'JOY',
  '평온': 'CALM',
  '슬픔': 'SADNESS',
  '화남': 'ANGER',
  '불안': 'ANXIETY',
  '지침': 'EXHAUSTED',
};

// 백엔드 감정 → 프론트엔드 감정 변환
const backendToEmotion: Record<BackendEmotion, Emotion> = {
  'JOY': { label: '기쁨', icon: 'happy-outline', color: '#fbbf24' },
  'CALM': { label: '평온', icon: 'sunny-outline', color: '#60a5fa' },
  'SADNESS': { label: '슬픔', icon: 'rainy-outline', color: '#818cf8' },
  'ANGER': { label: '화남', icon: 'flame-outline', color: '#f87171' },
  'ANXIETY': { label: '불안', icon: 'alert-circle-outline', color: '#fb923c' },
  'EXHAUSTED': { label: '지침', icon: 'moon-outline', color: '#a78bfa' },
};

// 프론트엔드 JournalEntry → 백엔드 DiaryCreate 변환
export function frontendToBackend(
  entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>,
  userId: string
): BackendDiaryCreate {
  // YYYY-MM-DD 형식을 ISO 형식으로 변환 (시간은 00:00:00)
  const isoDate = `${entry.date}T00:00:00`;
  
  return {
    user_id: userId,
    date: isoDate,  // ISO 형식 문자열 (백엔드가 파싱 가능)
    content: entry.content || ' ',  // 빈 내용 방지
    emotion: emotionToBackend[entry.emotion.label] || 'CALM',
  };
}

// 백엔드 DiaryEntry → 프론트엔드 JournalEntry 변환
export function backendToFrontend(entry: BackendDiaryEntry): JournalEntry {
  // ISO 형식 문자열을 YYYY-MM-DD로 변환
  let dateString: string;
  
  if (entry.date) {
    // ISO 형식 (2024-01-15T10:00:00 또는 2024-01-15T00:00:00)
    const date = new Date(entry.date);
    dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  } else {
    // 날짜가 없으면 오늘 날짜 사용
    const today = new Date();
    dateString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  }
  
  return {
    id: entry.id?.toString() || '',
    date: dateString,  // YYYY-MM-DD 형식
    emotion: backendToEmotion[entry.emotion] || backendToEmotion['CALM'],
    content: entry.content || '',
    createdAt: entry.created_at || new Date().toISOString(),
    updatedAt: entry.created_at || new Date().toISOString(),
  };
}
