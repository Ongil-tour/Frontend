import React from "react";
import { useNavigation } from "@react-navigation/native";
import { useSettingStore } from "../store/settingStore";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

type TabName = "explore" | "storage" | "mypage";

interface BottomTabBarProps {
  activeTab: TabName;
}

export default function BottomTabBar({
  activeTab,
}: BottomTabBarProps) {
  const navigation = useNavigation<any>();
  const { isDark, fontSize } = useSettingStore();

  const colors = {
    background: isDark ? "#222222" : "#FFFFFF",
    border: isDark ? "#555555" : "#DDDDDD",
    text: isDark ? "#FFFFFF" : "#000000",
    subText: isDark ? "#BDBDBD" : "#808080",
  };

  const goToTab = (tab: TabName) => {
    if (tab === "storage") {
      navigation.navigate("PlaceStorage");
      return;
    }

    if (tab === "mypage") {
      navigation.navigate("MyPage");
      return;
    }

    // 탐색은 지금 연결하지 않음
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          borderColor: colors.border,
        },
      ]}
    >
      {/* 탐색 */}
      <TouchableOpacity style={styles.tabItem}>
        <Text
          style={[
            styles.tabText,
            {
              color:
                activeTab === "explore"
                  ? colors.text
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
                  ? colors.text
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
                  ? colors.text
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
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,

    height: 65,

    borderTopWidth: 1,

    flexDirection: "row",
    alignItems: "center",

    zIndex: 999,
  },

  tabItem: {
    flex: 1,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },

  tabText: {
    fontWeight: "400",
  },
});