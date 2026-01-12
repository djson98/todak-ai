import { StatusBar } from 'expo-status-bar';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useState } from 'react';

type Emotion = {
  label: string;
  emoji: string;
};

type HomeScreenProps = {
  onNavigateToSettings: () => void;
  onNavigateToJournalWrite: (emotion: Emotion) => void;
};

export default function HomeScreen({ onNavigateToSettings, onNavigateToJournalWrite }: HomeScreenProps) {
  const [modalVisible, setModalVisible] = useState(false);

  const emotions: Emotion[] = [
    { label: '기쁨', emoji: '😊' },
    { label: '불안', emoji: '😰' },
    { label: '슬픔', emoji: '😢' },
    { label: '화남', emoji: '😤' },
    { label: '평온', emoji: '😌' },
  ];

  const handleDayPress = () => {
    setModalVisible(true);
  };

  const handleEmotionPress = (emotion: Emotion) => {
    setModalVisible(false);
    // Modal이 완전히 닫힌 후 네비게이션 실행
    requestAnimationFrame(() => {
      onNavigateToJournalWrite(emotion);
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerSpacer} />
        <Text style={styles.headerTitle}>마음 일기</Text>
        <TouchableOpacity onPress={onNavigateToSettings} style={styles.settingsButton}>
          <Text style={styles.settingsButtonText}>⚙️</Text>
        </TouchableOpacity>
      </View>
      
      <Calendar
        style={styles.calendar}
        theme={{
          todayTextColor: '#000',
          selectedDayBackgroundColor: '#4A90E2',
          arrowColor: '#4A90E2',
        }}
        onDayPress={handleDayPress}
      />
      <StatusBar style="auto" />

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>오늘 기분은 어때요?</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.emojiContainer}>
              {emotions.map((emotion, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.emojiButton}
                  onPress={() => handleEmotionPress(emotion)}
                >
                  <Text style={styles.emojiText}>{emotion.emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerSpacer: {
    width: 40,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
  },
  settingsButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsButtonText: {
    fontSize: 24,
  },
  calendar: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    margin: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
    maxHeight: '50%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    color: '#666',
  },
  emojiContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  emojiButton: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
    backgroundColor: '#f5f5f5',
  },
  emojiText: {
    fontSize: 32,
  },
});
