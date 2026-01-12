import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

type Emotion = {
  label: string;
  emoji: string;
};

type JournalWriteScreenProps = {
  emotion: Emotion;
  onBack: () => void;
};

export default function JournalWriteScreen({ emotion, onBack }: JournalWriteScreenProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>일기 쓰기</Text>
        <View style={styles.backButton} />
      </View>
      
      <View style={styles.content}>
        <Text style={styles.emojiLabel}>오늘의 감정</Text>
        <View style={styles.emojiContainer}>
          <Text style={styles.selectedEmoji}>{emotion.emoji}</Text>
        </View>
        
        <Text style={styles.textLabel}>내용 (선택)</Text>
        <TextInput
          style={styles.textInput}
          placeholder="오늘 하루는 어땠나요?"
          multiline
          numberOfLines={8}
        />
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
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: '#333',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  emojiLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 16,
  },
  emojiContainer: {
    height: 80,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginBottom: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedEmoji: {
    fontSize: 40,
  },
  textLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 16,
    textAlignVertical: 'top',
    fontSize: 16,
  },
});
