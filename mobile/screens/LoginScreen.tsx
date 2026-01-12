import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type LoginScreenProps = {
  onLogin: () => void;
};

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* 로고/타이틀 영역 */}
        <View style={styles.logoSection}>
          <View style={styles.logoCircle}>
            <Ionicons name="heart" size={48} color="#fb7185" />
          </View>
          <Text style={styles.title}>마음 일기</Text>
          <Text style={styles.subtitle}>오늘 당신의 마음을 토닥여줄게요.</Text>
        </View>

        {/* 로그인 버튼 영역 */}
        <View style={styles.buttonSection}>
          <TouchableOpacity 
            style={styles.kakaoButton}
            onPress={onLogin}
            activeOpacity={0.8}
          >
            <View style={styles.kakaoButtonContent}>
              <Text style={styles.kakaoIcon}>K</Text>
              <Text style={[styles.kakaoButtonText, { marginLeft: 12 }]}>카카오로 시작하기</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>또는</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity 
            style={styles.guestButton}
            onPress={onLogin}
            activeOpacity={0.8}
          >
            <Text style={styles.guestButtonText}>게스트로 시작하기</Text>
          </TouchableOpacity>
        </View>

        {/* 하단 안내 */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            로그인 시 개인정보 처리방침 및{'\n'}이용약관에 동의하게 됩니다.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fdfbf7',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 80,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#1e293b',
    letterSpacing: -1,
    marginBottom: 8,
    fontFamily: 'NanumPen', // 필기체 폰트 (폰트 파일 추가 필요)
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
    fontFamily: 'NanumPen',
  },
  buttonSection: {
    width: '100%',
  },
  kakaoButton: {
    width: '100%',
    height: 56,
    backgroundColor: '#FEE500',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 24,
  },
  kakaoButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  kakaoIcon: {
    fontSize: 20,
    fontWeight: '900',
    color: '#000',
  },
  kakaoButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    fontFamily: 'NanumPen',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e2e8f0',
  },
  dividerText: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
    marginHorizontal: 16,
  },
  guestButton: {
    width: '100%',
    height: 56,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  guestButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
    fontFamily: 'NanumPen',
  },
  footer: {
    marginTop: 48,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 16,
  },
});
