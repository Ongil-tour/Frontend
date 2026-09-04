import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useGoogleSignIn } from '../../hooks/useGoogleSignIn';
import { useSocialLoginMutation } from '../../queries/useSocialLoginMutation';
import { colors } from '../../theme/colors';



export default function SocialLoginButtons() {
  const { signIn } = useGoogleSignIn();
  const googleLogin = useSocialLoginMutation('google');

  const handleGooglePress = async () => {
    try {
      const idToken = await signIn();
      if (!idToken) return;
      await googleLogin.mutateAsync({ token: idToken });
    } catch (error) {
      console.log('구글 로그인 에러:', error);
      const message = error instanceof Error ? error.message : String(error);
      Alert.alert('로그인 실패', message);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.googleButton}
        onPress={handleGooglePress}
        disabled={googleLogin.isPending}
        activeOpacity={0.8}
      >
        {googleLogin.isPending ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <Text style={styles.googleButtonText}>Google로 계속하기</Text>
        )}
      </TouchableOpacity>
      {googleLogin.isError ? (
        <Text style={styles.errorText}>로그인에 실패했습니다. 다시 시도해주세요.</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', gap: 10 },
  googleButton: {
    width: '100%',
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },
  googleButtonText: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
  errorText: { fontSize: 13, color: colors.error, textAlign: 'center' },
});
