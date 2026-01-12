import { useState, useEffect } from 'react';
import { useFonts } from 'expo-font';
import HomeScreen from './screens/HomeScreen';
import SettingsScreen from './screens/SettingsScreen';
import JournalWriteScreen from './screens/JournalWriteScreen';
import StatsScreen from './screens/StatsScreen';
import LoginScreen from './screens/LoginScreen';
import { Emotion, JournalEntry } from './types/journal';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<'home' | 'settings' | 'journalWrite' | 'stats'>('home');
  const [selectedEmotion, setSelectedEmotion] = useState<Emotion | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | undefined>(undefined);
  const [existingJournal, setExistingJournal] = useState<JournalEntry | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // 폰트 로드 (ongle_font.ttf)
  const [fontsLoaded] = useFonts({
    'NanumPen': require('./assets/fonts/ongle_font.ttf'),
  });

  // 폰트가 로드될 때까지 대기 (선택사항)
  if (!fontsLoaded) {
    return null; // 또는 로딩 화면 표시
  }

  if (!isLoggedIn) {
    return <LoginScreen onLogin={() => setIsLoggedIn(true)} />;
  }

  if (currentScreen === 'settings') {
    return (
      <SettingsScreen 
        onBack={() => setCurrentScreen('home')} 
        onLogout={() => setIsLoggedIn(false)}
      />
    );
  }

  if (currentScreen === 'stats') {
    return <StatsScreen onBack={() => setCurrentScreen('home')} />;
  }

  if (currentScreen === 'journalWrite' && selectedEmotion) {
    return (
      <JournalWriteScreen
        emotion={selectedEmotion}
        selectedDate={selectedDate}
        existingJournal={existingJournal}
        onBack={() => {
          setCurrentScreen('home');
          setSelectedDate(undefined);
          setExistingJournal(null);
          setRefreshKey(prev => prev + 1); // 홈으로 돌아갈 때 새로고침
        }}
        onSave={() => {
          setCurrentScreen('home');
          setSelectedDate(undefined);
          setExistingJournal(null);
          setRefreshKey(prev => prev + 1); // 저장 후 홈으로 돌아가면서 새로고침
        }}
      />
    );
  }

  return (
    <HomeScreen
      key={refreshKey}
      onNavigateToSettings={() => setCurrentScreen('settings')}
      onNavigateToStats={() => setCurrentScreen('stats')}
      onNavigateToJournalWrite={(emotion: Emotion, date?: string, journal?: JournalEntry | null) => {
        setSelectedEmotion(emotion);
        setSelectedDate(date);
        setExistingJournal(journal || null);
        setCurrentScreen('journalWrite');
      }}
    />
  );
}
