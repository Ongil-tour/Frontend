import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSettingStore } from "../../stores/useSettingStore";
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomTabBar from "../../components/common/BottomTabBar";
import { GREEN, DARK } from "../../constants/colors";
import { useFavoriteListWithFacilities } from "../../queries/useFavoriteListWithFacilities";
import { useMyProfileQuery } from "../../queries/useMyProfileQuery";
import { useMySettingsQuery } from "../../queries/useMySettingsQuery";
import { useUpdateMySettingsMutation } from "../../queries/useUpdateMySettingsMutation";
import { getAvailableAccessibilityIcons } from "../../utils/accessibility";
import { facilityToAccessibilityInfo, mapFacilityToKakaoPlace } from "../../utils/facility";
import { fontSizeToPx } from "../../utils/fontSize";
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
  const { isDark, setIsDark, fontSize, setFontSize } = useSettingStore();
  const [profileImageIndex, setProfileImageIndex] = useState(0);
  const { rows: favoriteRows } = useFavoriteListWithFacilities('FREQUENT', 2);
  const { data: profile } = useMyProfileQuery();
  const { data: settings } = useMySettingsQuery();
  const updateSettingsMutation = useUpdateMySettingsMutation();

  // 로그인 직후 서버에 저장된 설정(다크모드/글자크기/프로필사진)으로 초기화.
  // 이후 로컬 변경은 handleToggleDark/handleSelectProfileImage가 즉시 반영한다.
  // useUpdateMySettingsMutation의 onSuccess가 매번 이 쿼리 캐시를 갱신하므로,
  // didInitRef 없이 [settings]에만 의존하면 우리 쪽 저장이 성공할 때마다 이 효과가
  // 다시 돌면서 그 사이 진행 중이던 다른 낙관적 변경을 옛 스냅샷으로 되돌려버린다.
  const didInitRef = React.useRef(false);
  React.useEffect(() => {
    if (!settings || didInitRef.current) return;
    didInitRef.current = true;
    setIsDark(settings.dark_mode);
    setFontSize(fontSizeToPx(settings.font_size));
    const index = PROFILE_IMAGE_FILES.indexOf(settings.profile_image);
    if (index !== -1) setProfileImageIndex(index);
  }, [settings]);

  // 각 필드마다 "가장 최근 시도"를 따로 추적해서, 늦게 실패한 옛날 요청의 롤백이
  // 그 사이 성공한 더 최신 변경을 덮어쓰지 않게 한다.
  const darkToggleAttempt = React.useRef(0);
  const profileImageAttempt = React.useRef(0);

  const handleToggleDark = (value: boolean) => {
    const previous = isDark;
    const attempt = ++darkToggleAttempt.current;
    setIsDark(value);
    updateSettingsMutation.mutate(
      { dark_mode: value },
      { onError: () => { if (attempt === darkToggleAttempt.current) setIsDark(previous); } }
    );
  };

  const handleSelectProfileImage = (index: number) => {
    const previous = profileImageIndex;
    const attempt = ++profileImageAttempt.current;
    setProfileImageIndex(index);
    setShowProfileEdit(false);
    updateSettingsMutation.mutate(
      { profile_image: PROFILE_IMAGE_FILES[index] },
      { onError: () => { if (attempt === profileImageAttempt.current) setProfileImageIndex(previous); } }
    );
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
              if (!row.facility) {
                // 카카오 소스로 저장된 즐겨찾기는 이름/주소를 어디서도 다시 가져올 수
                // 없어서(백엔드가 id만 저장) 목록에서 조용히 빠지는 대신 자리만 표시한다.
                if (row.item.source === 'kakao') {
                  return (
                    <View
                      key={row.item.id}
                      style={[styles.placeCard, { backgroundColor: colors.innerCard }]}
                    >
                      <Text
                        style={[styles.placeName, { color: colors.subText, fontSize: sizes.small }]}
                        numberOfLines={1}
                      >
                        카카오 장소 (상세 정보 없음)
                      </Text>
                    </View>
                  );
                }
                return null;
              }
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
                    {getAvailableAccessibilityIcons(facilityToAccessibilityInfo(facility)).map((icon, index) => (
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