import { useState } from 'react';
import HomeScreen from './screens/HomeScreen';
import SettingsScreen from './screens/SettingsScreen';
import JournalWriteScreen from './screens/JournalWriteScreen';

type Emotion = {
  label: string;
  emoji: string;
};

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'home' | 'settings' | 'journalWrite'>('home');
  const [selectedEmotion, setSelectedEmotion] = useState<Emotion | null>(null);

  if (currentScreen === 'settings') {
    return <SettingsScreen onBack={() => setCurrentScreen('home')} />;
  }

  if (currentScreen === 'journalWrite' && selectedEmotion) {
    return (
      <JournalWriteScreen
        emotion={selectedEmotion}
        onBack={() => setCurrentScreen('home')}
      />
    );
  }

  return (
    <HomeScreen
      onNavigateToSettings={() => setCurrentScreen('settings')}
      onNavigateToJournalWrite={(emotion: Emotion) => {
        setSelectedEmotion(emotion);
        setCurrentScreen('journalWrite');
      }}
    />
  );
}
