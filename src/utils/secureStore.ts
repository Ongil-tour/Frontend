import * as SecureStore from "expo-secure-store";

export const removeRefreshToken = async () => {
  await SecureStore.deleteItemAsync("refreshToken");
};