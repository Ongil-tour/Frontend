import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSettingStore } from "../store/settingStore";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Pressable,
  Image,
} from "react-native";

const profileImages = [
  require("../assets/profile/profile1.png"),
  require("../assets/profile/profile2.png"),
  require("../assets/profile/profile3.png"),
  require("../assets/profile/profile4.png"),
];

export default function MyPage() {
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { isDark, setIsDark, fontSize } = useSettingStore();
  const [profileImage, setProfileImage] = useState(profileImages[0]);

  const colors = {
    background: isDark ? "#222222" : "#FFFFFF",
    card: isDark ? "#333333" : "#F5F5F5",
    innerCard: isDark ? "#444444" : "#FFFFFF",
    text: isDark ? "#FFFFFF" : "#000000",
    subText: isDark ? "#BDBDBD" : "#808080",
    divider: isDark ? "#555555" : "#DDDDDD",
    tab: isDark ? "#BDBDBD" : "#808080",
    activeTab: isDark ? "#FFFFFF" : "#000000",
  };

  const sizes = {
    title: fontSize + 12,
    name: fontSize + 8,
    normal: fontSize,
    small: fontSize - 1,
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
        },
      ]}
    >
      {/* 제목 */}
      <Text
        style={[
          styles.title,
          {
            color: colors.text,
            fontSize: sizes.title,
          },
        ]}
      >
        마이페이지
      </Text>

      {/* 프로필 */}
      <View style={styles.profileContainer}>
        <View style={styles.profileWrapper}>
          <Image
            source={profileImage}
            style={styles.profileImage}
          />

          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setShowProfileEdit(true)}
          >
            <Text style={styles.editText}>✎</Text>
          </TouchableOpacity>
        </View>

        <Text
          style={[
            styles.name,
            {
              color: colors.text,
              fontSize: sizes.name,
            },
          ]}
        >
          문서은님
        </Text>

        <Text
          style={[
            styles.email,
            {
              color: colors.subText,
              fontSize: sizes.small,
            },
          ]}
        >
          ez_trip@example.com
        </Text>
      </View>

      {/* 구분선 */}
      <View
        style={[
          styles.divider,
          {
            backgroundColor: colors.divider,
          },
        ]}
      />

      {/* 다크모드 */}
      <View
        style={[
          styles.menuBox,
          {
            backgroundColor: colors.card,
          },
        ]}
      >
        <Text
          style={[
            styles.menuText,
            {
                color: colors.text,
                fontSize: sizes.normal,
            },
          ]}
        >
          다크모드
        </Text>

        <Switch
          value={isDark}
          onValueChange={setIsDark}
        />
      </View>

      {/* 설정 */}
      <TouchableOpacity
        style={[
          styles.menuBox,
          {
            backgroundColor: colors.card,
          }, 
        ]}
        onPress={() => navigation.navigate("Setting")}
      >
        <Text
          style={[
            styles.menuText,
            {
                color: colors.text,
                fontSize: sizes.normal,
            },
          ]}
        >
          설정
        </Text>

        <Text
          style={[
            styles.arrow,
            {
              color: colors.subText,
            },
          ]}
        >
          ›
        </Text>
      </TouchableOpacity>

      {/* 즐겨찾는 장소 */}
      <TouchableOpacity
        style={[
          styles.favoriteWrapper,
          {
            backgroundColor: colors.card,
          },
        ]}
        activeOpacity={0.8}
        onPress={() => navigation.navigate("PlaceStorage")}
      >
        <View style={styles.favoriteHeader}>
          <Text
            style={[
              styles.favoriteTitle,
              {
                color: colors.text,
                fontSize: sizes.normal,
              },
            ]}
          >
            즐겨찾는 장소
          </Text>

          <Text
            style={[
              styles.arrow,
              {
                color: colors.subText,
              },
            ]}
          >
            ›
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.placeCard,
            {
              backgroundColor: colors.innerCard,
            },
          ]}
          activeOpacity={0.8}
          onPress={(e) => {
            e.stopPropagation();
            console.log("장소 상세정보 : 서울숲");
          }}
        >
          <Text
            style={[
              styles.placeName,
              {
                color: colors.text,
                fontSize: sizes.small,
              },
            ]}
          >
            서울숲
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.placeCard,
            {
              backgroundColor: colors.innerCard,
            },
          ]}
          activeOpacity={0.8}
          onPress={(e) => {
            e.stopPropagation();
            console.log("장소 상세정보 : 경복궁");
          }}
        >
          <Text
            style={[
              styles.placeName,
              {
                color: colors.text,
                fontSize: sizes.small,
              },
            ]}
          >
            경복궁
          </Text>
        </TouchableOpacity>
      </TouchableOpacity>

      {/* 하단 탭바 */}
      <View
        style={[
          styles.bottomTab,
          {
            backgroundColor: colors.background,
            borderColor: colors.divider,
          },
        ]}
      >
        <TouchableOpacity style={styles.tabItem}>
                  <Text
                    style={[
                      styles.tabText,
                      {
                        color: colors.subText,
                        fontSize: sizes.normal,
                      },
                    ]}
                  >
                  탐색
                  </Text>
                </TouchableOpacity>
        
                <TouchableOpacity style={styles.tabItem}>
                  <Text
                    style={[
                      styles.tabText,
                      {
                        color: colors.subText,
                        fontSize: sizes.normal,
                      },
                    ]}
                  >
                  보관함
                  </Text>
                </TouchableOpacity>
        
                <TouchableOpacity style={styles.tabItem}>
                  <Text
                    style={[
                      styles.activeTab,
                      {
                        color: colors.text,
                        fontSize: sizes.normal,
                      },
                    ]}
                  >
                  마이페이지
                  </Text>
                </TouchableOpacity>
      </View>

      {showProfileEdit && (
        <Pressable
          style={styles.overlay}
          onPress={() => setShowProfileEdit(false)}
        >
          <Pressable
            style={[
              styles.profileEditSheet,
              {
                backgroundColor: isDark ? '#222222' : '#FFFFFF',
              },
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            <Text
              style={[
                styles.sheetTitle,
                {
                  color: isDark ? '#FFFFFF' : '#000000',
                  fontSize: fontSize + 4,
                },
              ]}
            >
              프로필 사진 변경
            </Text>

            <View style={styles.profileOptions}>
              {profileImages.map((image, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    setProfileImage(image);
                    setShowProfileEdit(false);
                  }}
                >
                  <Image
                    source={image}
                    style={styles.profileBox}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </Pressable>
        </Pressable>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 40,
},

  profileContainer: {
    alignItems: "center",
  },

  profileImage: {
    width: 170,
    height: 170,
    borderRadius: 85,
    marginBottom: 15,
  },

  name: {
    fontSize: 24,
    fontWeight: "bold",
  },

  email: {
    marginTop: 5,
    color: "gray",
  },

  divider: {
    height: 1,
    backgroundColor: "#ddd",
    marginVertical: 20,
  },

  menuBox: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  menuText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000",
  },

  favoriteWrapper: {
    backgroundColor: "#f5f5f5",
    borderRadius: 16,
    padding: 15,
    marginTop: 0,
  },

  favoriteHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  favoriteTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000",
  },

  arrow: {
    fontSize: 24,
    color: "#8A8A8A",
    fontWeight: "400",
  },

  placeCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },

  placeName: {
    fontSize: 15,
  },

  bottomTab: {
    marginTop: "auto",
    borderTopWidth: 1,
    borderColor: "#ddd",
    paddingTop: 15,
    paddingBottom: 15,
    flexDirection: "row",
    alignItems: "center",
  },

  tabText: {
    color: "gray",
  },

  activeTab: {
    fontWeight: "bold",
  },

  profileWrapper: {
    position: "relative",
    width: 170,
    height: 170,
    marginBottom: 15,
  },

  editButton: {
    position: "absolute",
    right: -5,
    bottom: 8,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#CFCFCF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
    elevation: 4,
  },

  editText: {
    color: "#555",
    fontSize: 18,
    fontWeight: "bold",
  },

  tabItem: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  overlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },

  profileEditSheet: {
    height: 260,
    backgroundColor: '#fff',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 24,
  },

  sheetTitle: {
    fontSize: 18,
    fontWeight: '700',
  },

  profileOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 25,
  },

  profileBox: {
    width: 55,
    height: 55,
    borderRadius: 15,
  },

});