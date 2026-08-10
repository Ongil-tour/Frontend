import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useGoogleSignIn } from '../../hooks/useGoogleSignIn';
import { useSocialLoginMutation } from '../../queries/useSocialLoginMutation';

export default function SocialLoginButtons() {
  const { signIn } = useGoogleSignIn();
  const googleLogin = useSocialLoginMutation('google');

  const handleGooglePress = async () => {
    try {
      const idToken = await signIn();
      if (!idToken) return;
      googleLogin.mutate({ idToken });
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
      >
        {googleLogin.isPending ? (
          <ActivityIndicator color="#333" />
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
  container: { width: '100%', gap: 8 },
  googleButton: {
    width: '100%',
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  googleButtonText: { fontSize: 15, fontWeight: '600', color: '#333' },
  errorText: { fontSize: 13, color: '#D64545', textAlign: 'center' },
});
