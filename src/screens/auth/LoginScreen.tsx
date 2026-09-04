import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SocialLoginButtons from '../../components/auth/SocialLoginButtons';
import { colors } from '../../theme/colors';

export default function LoginScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoBadge}>
          <Text style={styles.logoText}>온</Text>
        </View>
        <Text style={styles.title}>온길</Text>
        <Text style={styles.subtitle}>로그인하고 시작하기</Text>
      </View>
      <View style={styles.footer}>
        <SocialLoginButtons />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10 },
  logoBadge: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  logoText: { fontSize: 30, fontWeight: '700', color: colors.primary },
  title: { fontSize: 26, fontWeight: '700', color: colors.textPrimary, letterSpacing: 0.5 },
  subtitle: { fontSize: 14, color: colors.textSecondary },
  footer: { paddingHorizontal: 24, paddingBottom: 32 },
});
