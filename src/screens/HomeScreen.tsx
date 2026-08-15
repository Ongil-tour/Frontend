import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../stores/useAuthStore';

// feature/map과 합쳐지기 전까지 로그인 확인용 임시 화면
// TODO: 프로필(이메일 등) 표시하려면 GET /users/me 따로 호출해서 채워야 함
// (로그인 응답 TokenPair엔 user 정보가 없음)
export default function HomeScreen() {
  const clearAuth = useAuthStore((s) => s.clearAuth);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.name}>로그인 성공</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={() => clearAuth()}>
          <Text style={styles.logoutText}>로그아웃</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, gap: 8 },
  name: { fontSize: 20, fontWeight: '700', color: '#111', marginBottom: 16 },
  logoutButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#f2f2f2',
  },
  logoutText: { fontSize: 14, fontWeight: '600', color: '#333' },
});
