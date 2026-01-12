import AsyncStorage from '@react-native-async-storage/async-storage';
import { JournalEntry } from '../types/journal';

const STORAGE_KEY = '@todak_journals';

// 모든 일기 가져오기
export const getAllJournals = async (): Promise<JournalEntry[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
    return [];
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

// 일기 생성
export const createJournal = async (entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<JournalEntry> => {
  try {
    const journals = await getAllJournals();
    const newEntry: JournalEntry = {
      ...entry,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    journals.push(newEntry);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(journals));
    return newEntry;
  } catch (error) {
    console.error('일기 생성 실패:', error);
    throw error;
  }
};

// 일기 수정
export const updateJournal = async (id: string, updates: Partial<Omit<JournalEntry, 'id' | 'createdAt'>>): Promise<JournalEntry | null> => {
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
  } catch (error) {
    console.error('일기 수정 실패:', error);
    throw error;
  }
};

// 일기 삭제
export const deleteJournal = async (id: string): Promise<boolean> => {
  try {
    const journals = await getAllJournals();
    const filtered = journals.filter(journal => journal.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('일기 삭제 실패:', error);
    return false;
  }
};

// 특정 날짜의 일기 삭제
export const deleteJournalByDate = async (date: string): Promise<boolean> => {
  try {
    const journals = await getAllJournals();
    const filtered = journals.filter(journal => journal.date !== date);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('일기 삭제 실패:', error);
    return false;
  }
};
