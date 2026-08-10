import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";

import MyPage from "./screens/MyPage";
import Setting from "./screens/Setting";
import PlaceStorageScreen from "./screens/PlaceStorage";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen
            name="MyPage"
            component={MyPage}
          />

          <Stack.Screen
            name="Setting"
            component={Setting}
          />

          <Stack.Screen
            name="PlaceStorage"
            component={PlaceStorageScreen}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}