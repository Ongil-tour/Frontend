import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSettingStore } from "../store/settingStore";

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
    height: 65,
    borderTopWidth: 1,
    flexDirection: "row",
    alignItems: "center",
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