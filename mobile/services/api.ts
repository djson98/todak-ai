// 백엔드 서버 주소
// 개발용: 실제 기기에서는 맥의 IP 주소 사용
const API_BASE_URL = __DEV__ 
  ? 'http://192.168.0.36:8000'  // 실제 기기 (맥의 IP 주소)
  : 'https://api.todak-ai.com';  // 프로덕션

// 백엔드 API 타입 (백엔드 schemas.py와 일치)
export type BackendEmotion = 'JOY' | 'CALM' | 'SADNESS' | 'ANGER' | 'ANXIETY' | 'EXHAUSTED';

export interface BackendDiaryEntry {
  id?: number | string;  // Firebase는 문자열 ID를 반환할 수 있음
  user_id: string;
  date: string;  // ISO 형식
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

// 일기 저장 API
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
    
    // Firebase 미설정 에러인 경우 명확한 메시지
    if (response.status === 503 || errorText.includes('데이터베이스가 설정되지 않았습니다')) {
      throw new Error('데이터베이스가 설정되지 않았습니다. Firebase 설정이 필요합니다.');
    }
    
    throw new Error(`일기 저장 실패: ${errorText}`);
  }

  return response.json();
}

// 일기 목록 조회 API
export async function getDiaries(userId: string): Promise<BackendDiaryEntry[]> {
  const response = await fetch(`${API_BASE_URL}/api/diary?user_id=${userId}`);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('일기 목록 조회 API 에러:', response.status, errorText);
    // Firebase 미설정 시 빈 배열 반환 (임시 해결)
    if (response.status === 500) {
      return [];
    }
    throw new Error(`일기 목록을 가져오는데 실패했습니다: ${errorText}`);
  }

  return response.json();
}

// 특정 일기 조회 API
export async function getDiary(diaryId: string | number): Promise<BackendDiaryEntry> {
  const response = await fetch(`${API_BASE_URL}/api/diary/${diaryId}`);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('일기 조회 API 에러:', response.status, errorText);
    throw new Error(`일기를 가져오는데 실패했습니다: ${errorText}`);
  }

  return response.json();
}

// 일기 삭제 API
export async function deleteDiary(diaryId: string | number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/diary/${diaryId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('일기 삭제 API 에러:', response.status, errorText);
    throw new Error(`일기 삭제에 실패했습니다: ${errorText}`);
  }
}
