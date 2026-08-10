import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../stores/useAuthStore';

// feature/map과 합쳐지기 전까지 로그인 확인용 임시 화면
export default function HomeScreen() {
  const { user, clearAuth } = useAuthStore();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.name}>{user?.name}님 환영합니다</Text>
        <Text style={styles.email}>{user?.email}</Text>
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
  name: { fontSize: 20, fontWeight: '700', color: '#111' },
  email: { fontSize: 14, color: '#777', marginBottom: 24 },
  logoutButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#f2f2f2',
  },
  logoutText: { fontSize: 14, fontWeight: '600', color: '#333' },
});
