import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSettingStore } from "../../stores/useSettingStore";
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomTabBar from "../../components/common/BottomTabBar";
import { GREEN, DARK } from "../../constants/colors";
import { useFavoriteListWithFacilities } from "../../queries/useFavoriteListWithFacilities";
import { useMyProfileQuery } from "../../queries/useMyProfileQuery";
import { useUpdateMySettingsMutation } from "../../queries/useUpdateMySettingsMutation";
import { getAvailableAccessibilityIcons } from "../../utils/accessibility";
import { mapFacilityToKakaoPlace } from "../../utils/facility";
import { ProfileImageFile } from "../../types/user";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Pressable,
  Image,
} from "react-native";

const PROFILE_IMAGE_FILES: ProfileImageFile[] = [
  "profile1.png",
  "profile2.png",
  "profile3.png",
  "profile4.png",
];

const profileImages = [
  require("../../../assets/profile/profile1.png"),
  require("../../../assets/profile/profile2.png"),
  require("../../../assets/profile/profile3.png"),
  require("../../../assets/profile/profile4.png"),
];

export default function MyPage() {
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { isDark, setIsDark, fontSize } = useSettingStore();
  const [profileImageIndex, setProfileImageIndex] = useState(0);
  const { rows: favoriteRows } = useFavoriteListWithFacilities('FREQUENT', 2);
  const { data: profile } = useMyProfileQuery();
  const updateSettingsMutation = useUpdateMySettingsMutation();

  const handleToggleDark = (value: boolean) => {
    setIsDark(value);
    updateSettingsMutation.mutate({ dark_mode: value });
  };

  const handleSelectProfileImage = (index: number) => {
    setProfileImageIndex(index);
    setShowProfileEdit(false);
    updateSettingsMutation.mutate({ profile_image: PROFILE_IMAGE_FILES[index] });
  };

  const colors = {
    background: isDark ? DARK.background : GREEN.screenBg,
    card: isDark ? DARK.card : "#FFFFFF",
    innerCard: isDark ? DARK.innerCard : GREEN.softer,
    text: isDark ? DARK.text : "#000000",
    subText: isDark ? DARK.subText : "#808080",
    divider: isDark ? DARK.border : GREEN.border,
    tab: isDark ? DARK.subText : "#808080",
    activeTab: isDark ? DARK.text : GREEN.primary,
    iconBackground: isDark ? "#3A5A46" : GREEN.tint,
    accent: GREEN.primary,
    editButton: isDark ? DARK.innerCard : GREEN.primary,
    editIcon: isDark ? DARK.text : "#FFFFFF",
  };

  const sizes = {
    title: fontSize + 12,
    name: fontSize + 8,
    normal: fontSize,
    small: fontSize - 1,
  };

  return (
    <SafeAreaView
      edges={['top']}
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
        },
      ]}
    >
      <View style={styles.content}>
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
              source={profileImages[profileImageIndex]}
              style={styles.profileImage}
            />

            <TouchableOpacity
              style={[styles.editButton, { backgroundColor: colors.editButton }]}
              onPress={() => setShowProfileEdit(true)}
            >
              <Text style={[styles.editText, { color: colors.editIcon }]}>✎</Text>
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
            {profile?.email ?? '로그인이 필요해요'}
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
            onValueChange={handleToggleDark}
            trackColor={{ false: '#D8D8D8', true: GREEN.primary }}
            thumbColor="#FFFFFF"
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

          {favoriteRows.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.subText, fontSize: sizes.small }]}>
              즐겨찾는 장소가 없어요.
            </Text>
          ) : (
            favoriteRows.map((row) => {
              if (!row.facility) return null;
              const facility = row.facility;
              return (
                <TouchableOpacity
                  key={row.item.id}
                  style={[
                    styles.placeCard,
                    {
                      backgroundColor: colors.innerCard,
                    },
                  ]}
                  activeOpacity={0.8}
                  onPress={(e) => {
                    e.stopPropagation();
                    navigation.navigate("PlaceDetail", { place: mapFacilityToKakaoPlace(facility) });
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
                    numberOfLines={1}
                  >
                    {facility.name}
                  </Text>

                  <View style={styles.iconContainer}>
                    {getAvailableAccessibilityIcons(facility.accessibility).map((icon, index) => (
                      <View
                        key={index}
                        style={[
                          styles.iconBox,
                          {
                            backgroundColor: colors.iconBackground,
                          },
                        ]}
                      >
                        <Text style={styles.iconText}>{icon}</Text>
                      </View>
                    ))}
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </TouchableOpacity>

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
                    onPress={() => handleSelectProfileImage(index)}
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
      </View>

      <BottomTabBar activeTab="mypage" />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    flexDirection: "row",
    alignItems: "center",
  },

  placeName: {
    fontSize: 15,
  },

  emptyText: {
    paddingVertical: 8,
  },

  iconContainer: {
    flexDirection: "row",
    marginLeft: "auto",
    gap: 6,
  },

  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },

  iconText: {
    fontSize: 17,
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
    backgroundColor: '#fff',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 70,
  },

  sheetTitle: {
    fontSize: 18,
    fontWeight: '700',
  },

  profileOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },

  profileBox: {
    width: 55,
    height: 55,
    borderRadius: 15,
  },

  content: {
    flex: 1,
    padding: 20,
  },

});