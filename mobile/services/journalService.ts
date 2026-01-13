import { JournalEntry } from '../types/journal';
import { createDiary, getDiaries, deleteDiary, BackendDiaryEntry } from './api';
import { frontendToBackend, backendToFrontend } from './typeConverter';

// 사용자 ID (나중에 실제 인증 시스템으로 교체)
const USER_ID = 'user123';

// 모든 일기 가져오기 (백엔드에서)
export const getAllJournals = async (): Promise<JournalEntry[]> => {
  try {
    const backendEntries = await getDiaries(USER_ID);
    return backendEntries.map(backendToFrontend);
  } catch (error) {
    console.error('일기 가져오기 실패:', error);
    return [];
  }
};

// 특정 날짜의 일기 가져오기
export const getJournalByDate = async (date: string): Promise<JournalEntry | null> => {
  try {
    const journals = await getAllJournals();
    return journals.find(journal => journal.date === date) || null;
  } catch (error) {
    console.error('일기 가져오기 실패:', error);
    return null;
  }
};

// 일기 생성 (백엔드로 전송)
export const createJournal = async (
  entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>
): Promise<JournalEntry> => {
  try {
    const backendData = frontendToBackend(entry, USER_ID);
    const backendEntry = await createDiary(backendData);
    return backendToFrontend(backendEntry);
  } catch (error) {
    console.error('일기 생성 실패:', error);
    throw error;
  }
};

// 일기 수정 (백엔드 API 추가 필요 - 현재는 없음)
export const updateJournal = async (
  id: string,
  updates: Partial<Omit<JournalEntry, 'id' | 'createdAt'>>
): Promise<JournalEntry | null> => {
  try {
    // 백엔드에 수정 API가 없으므로 삭제 후 재생성
    const existing = await getJournalByDate(updates.date || '');
    if (existing && existing.id === id) {
      await deleteJournal(id);
      return await createJournal({
        date: updates.date || existing.date,
        emotion: updates.emotion || existing.emotion,
        content: updates.content || existing.content,
      });
    }
    return null;
  } catch (error) {
    console.error('일기 수정 실패:', error);
    throw error;
  }
};

// 일기 삭제 (백엔드로 전송)
export const deleteJournal = async (id: string): Promise<boolean> => {
  try {
    // ID를 그대로 전달 (백엔드가 문자열을 받음)
    await deleteDiary(id);
    return true;
  } catch (error) {
    console.error('일기 삭제 실패:', error);
    return false;
  }
};

// 특정 날짜의 일기 삭제
export const deleteJournalByDate = async (date: string): Promise<boolean> => {
  try {
    const journal = await getJournalByDate(date);
    if (journal) {
      return await deleteJournal(journal.id);
    }
    return false;
  } catch (error) {
    console.error('일기 삭제 실패:', error);
    return false;
  }
};
