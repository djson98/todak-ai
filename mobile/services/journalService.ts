/**
 * 일기 서비스
 * 
 * 백엔드 API를 사용하여 일기 데이터를 관리합니다.
 * Firebase가 설정되지 않은 경우를 대비해 AsyncStorage를 fallback으로 사용할 수 있습니다.
 */
import { JournalEntry } from '../types/journal';
import { 
  getDiaries, 
  createDiary, 
  updateDiary, 
  deleteDiary,
  BackendDiaryUpdate,
  BackendEmotion
} from './api';
import { getUserId } from './userService';
import { backendToJournalEntry, journalEntryToBackend, emotionLabelToBackend } from '../utils/journalConverter';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@todak_journals';

/**
 * 모든 일기 가져오기
 */
export const getAllJournals = async (): Promise<JournalEntry[]> => {
  try {
    const userId = getUserId();
    const backendEntries = await getDiaries(userId);
    return backendEntries.map(backendToJournalEntry);
  } catch (error) {
    console.error('일기 가져오기 실패 (백엔드):', error);
    // 백엔드 실패 시 AsyncStorage fallback
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (storageError) {
      console.error('일기 가져오기 실패 (AsyncStorage):', storageError);
    }
    return [];
  }
};

/**
 * 특정 날짜의 일기 가져오기
 */
export const getJournalByDate = async (date: string): Promise<JournalEntry | null> => {
  try {
    const journals = await getAllJournals();
    return journals.find(journal => journal.date === date) || null;
  } catch (error) {
    console.error('일기 가져오기 실패:', error);
    return null;
  }
};

/**
 * 일기 생성
 */
export const createJournal = async (
  entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>
): Promise<JournalEntry> => {
  try {
    const userId = getUserId();
    const backendEntry = journalEntryToBackend(entry, userId);
    const created = await createDiary(backendEntry);
    return backendToJournalEntry(created);
  } catch (error) {
    console.error('일기 생성 실패 (백엔드):', error);
    // 백엔드 실패 시 AsyncStorage fallback
    try {
      const newEntry: JournalEntry = {
        ...entry,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const journals = await getAllJournals();
      journals.push(newEntry);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(journals));
      return newEntry;
    } catch (storageError) {
      console.error('일기 생성 실패 (AsyncStorage):', storageError);
      throw error; // 원래 에러를 throw
    }
  }
};

/**
 * 일기 수정
 */
export const updateJournal = async (
  id: string, 
  updates: Partial<Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<JournalEntry | null> => {
  try {
    const backendUpdates: BackendDiaryUpdate = {};
    
    if (updates.content !== undefined) {
      backendUpdates.content = updates.content;
    }
    
    if (updates.emotion !== undefined) {
      backendUpdates.emotion = emotionLabelToBackend(updates.emotion.label);
    }
    
    const updated = await updateDiary(id, backendUpdates);
    return backendToJournalEntry(updated);
  } catch (error) {
    console.error('일기 수정 실패 (백엔드):', error);
    // 백엔드 실패 시 AsyncStorage fallback
    try {
      const journals = await getAllJournals();
      const index = journals.findIndex(journal => journal.id === id);
      
      if (index === -1) {
        return null;
      }
      
      journals[index] = {
        ...journals[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(journals));
      return journals[index];
    } catch (storageError) {
      console.error('일기 수정 실패 (AsyncStorage):', storageError);
      throw error; // 원래 에러를 throw
    }
  }
};

/**
 * 일기 삭제
 */
export const deleteJournal = async (id: string): Promise<boolean> => {
  try {
    await deleteDiary(id);
    return true;
  } catch (error) {
    console.error('일기 삭제 실패 (백엔드):', error);
    // 백엔드 실패 시 AsyncStorage fallback
    try {
      const journals = await getAllJournals();
      const filtered = journals.filter(journal => journal.id !== id);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      return true;
    } catch (storageError) {
      console.error('일기 삭제 실패 (AsyncStorage):', storageError);
      return false;
    }
  }
};

/**
 * 특정 날짜의 일기 삭제
 */
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
