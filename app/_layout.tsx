import { Slot } from "expo-router";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from "../contexts/AuthContext";
import { TabBarProvider } from "../contexts/TabBarContext";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <TabBarProvider>
          <Slot />
        </TabBarProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
