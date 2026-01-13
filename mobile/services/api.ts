/**
 * 백엔드 API 호출 함수
 * 
 * 환경 변수를 통해 API 베이스 URL을 설정합니다.
 * mobile/.env 파일에 EXPO_PUBLIC_API_BASE_URL을 설정하거나,
 * 개발 환경에서는 자동으로 localhost를 사용합니다.
 */
import { API_BASE_URL } from '../config/api';

export type BackendEmotion = 'JOY' | 'CALM' | 'SADNESS' | 'ANGER' | 'ANXIETY' | 'EXHAUSTED';

export interface BackendDiaryEntry {
  id?: number | string;
  user_id: string;
  date: string;
  content: string;
  emotion: BackendEmotion;
  created_at?: string;
}

export interface BackendDiaryCreate {
  user_id: string;
  date: string;
  content: string;
  emotion: BackendEmotion;
}

/**
 * 일기 생성
 */
export async function createDiary(diary: BackendDiaryCreate): Promise<BackendDiaryEntry> {
  const response = await fetch(`${API_BASE_URL}/api/diary/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(diary),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('일기 저장 API 에러:', response.status, errorText);
    if (response.status === 503 || errorText.includes('데이터베이스가 설정되지 않았습니다')) {
      throw new Error('데이터베이스가 설정되지 않았습니다. Firebase 설정이 필요합니다.');
    }
    throw new Error(`일기 저장 실패: ${errorText}`);
  }
  return response.json();
}

/**
 * 사용자의 모든 일기 가져오기
 */
export async function getDiaries(userId: string): Promise<BackendDiaryEntry[]> {
  const response = await fetch(`${API_BASE_URL}/api/diary?user_id=${userId}`);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('일기 목록 조회 API 에러:', response.status, errorText);
    if (response.status === 500) {
      // Firebase 미설정 시 빈 배열 반환
      return [];
    }
    throw new Error(`일기 목록을 가져오는데 실패했습니다: ${errorText}`);
  }
  return response.json();
}

/**
 * 특정 일기 가져오기
 */
export async function getDiary(diaryId: string | number): Promise<BackendDiaryEntry> {
  const response = await fetch(`${API_BASE_URL}/api/diary/${diaryId}`);
  if (!response.ok) {
    const errorText = await response.text();
    console.error('특정 일기 조회 API 에러:', response.status, errorText);
    throw new Error('일기를 가져오는데 실패했습니다.');
  }
  return response.json();
}

/**
 * 일기 삭제
 */
export async function deleteDiary(diaryId: string | number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/diary/${diaryId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const errorText = await response.text();
    console.error('일기 삭제 API 에러:', response.status, errorText);
    throw new Error('일기 삭제에 실패했습니다.');
  }
}
