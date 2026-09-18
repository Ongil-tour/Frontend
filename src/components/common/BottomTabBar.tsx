import React from "react";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSettingStore } from "../../stores/useSettingStore";
import { GREEN, DARK } from "../../constants/colors";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

type TabName = "explore" | "storage" | "mypage";

interface BottomTabBarProps {
  activeTab: TabName;
  hidden?: boolean;
}

export default function BottomTabBar({
  activeTab,
  hidden = false,
}: BottomTabBarProps) {
  const navigation = useNavigation<any>();
  const { isDark, fontSize } = useSettingStore();
  const insets = useSafeAreaInsets();

  const colors = {
    background: isDark ? DARK.background : GREEN.screenBg,
    border: isDark ? DARK.border : GREEN.border,
    active: isDark ? DARK.text : GREEN.primary,
    subText: isDark ? DARK.subText : "#8FA89A",
  };

  const goToTab = (tab: TabName) => {
    if (tab === activeTab) return;

    if (tab === "explore") {
      navigation.navigate("Map");
      return;
    }

    if (tab === "storage") {
      navigation.navigate("PlaceStorage");
      return;
    }

    if (tab === "mypage") {
      navigation.navigate("MyPage");
      return;
    }
  };

  return (
    <View
      pointerEvents={hidden ? 'none' : 'auto'}
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          borderColor: colors.border,
          paddingBottom: 10 + insets.bottom,
          opacity: hidden ? 0 : 1,
        },
      ]}
    >
      {/* 탐색 */}
      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => goToTab("explore")}
      >
        <Text
          style={[
            styles.tabText,
            {
              color:
                activeTab === "explore"
                  ? colors.active
                  : colors.subText,
              fontSize,
              fontWeight:
                activeTab === "explore" ? "700" : "400",
            },
          ]}
        >
          탐색
        </Text>
      </TouchableOpacity>

      {/* 보관함 */}
      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => goToTab("storage")}
      >
        <Text
          style={[
            styles.tabText,
            {
              color:
                activeTab === "storage"
                  ? colors.active
                  : colors.subText,
              fontSize,
              fontWeight:
                activeTab === "storage" ? "700" : "400",
            },
          ]}
        >
          보관함
        </Text>
      </TouchableOpacity>

      {/* 마이페이지 */}
      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => goToTab("mypage")}
      >
        <Text
          style={[
            styles.tabText,
            {
              color:
                activeTab === "mypage"
                  ? colors.active
                  : colors.subText,
              fontSize,
              fontWeight:
                activeTab === "mypage" ? "700" : "400",
            },
          ]}
        >
          마이페이지
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,

    flexDirection: "row",
    alignItems: "center",

    paddingTop: 10,
  },

  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  tabText: {
    fontWeight: "400",
  },
});