import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSettingStore } from '../../stores/useSettingStore';
import BottomTabBar from "../../components/common/BottomTabBar";
import { GREEN, DARK } from "../../constants/colors";
import { useFavoriteListWithFacilities } from '../../queries/useFavoriteListWithFacilities';
import { useRemoveFavoriteMutation } from '../../queries/useRemoveFavoriteMutation';
import { getAvailableAccessibilityIcons } from '../../utils/accessibility';
import { mapFacilityToKakaoPlace } from '../../utils/facility';
import { FavoriteListType } from '../../types/favorite';
import { RootStackParamList } from '../../navigation/types';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';

type TabId = 'favorite' | 'want' | 'visited';

const TAB_TO_LIST_TYPE: Record<TabId, FavoriteListType> = {
  favorite: 'FREQUENT',
  want: 'WISHLIST',
  visited: 'VISITED',
};

export default function PlaceStorage() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { isDark, fontSize } = useSettingStore();
  const colors = {
    background: isDark ? DARK.background : GREEN.screenBg,
    text: isDark ? DARK.text : '#000000',
    subText: isDark ? DARK.subText : '#777777',
    card: isDark ? DARK.card : '#FFFFFF',
    iconBackground: isDark ? "#3A5A46" : GREEN.tint,
    accentText: isDark ? DARK.text : GREEN.primaryText,
    accent: isDark ? DARK.text : GREEN.primary,
  };
  const [selectedTab, setSelectedTab] = React.useState<TabId>('favorite');

  const { rows, isLoading, isError } = useFavoriteListWithFacilities(TAB_TO_LIST_TYPE[selectedTab]);
  const removeFavoriteMutation = useRemoveFavoriteMutation();

  const tabs: { id: TabId; title: string }[] = [
    { id: 'favorite', title: '즐겨찾는 곳' },
    { id: 'want', title: '가고싶은 곳' },
    { id: 'visited', title: '방문했던 곳' },
  ];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
        },
      ]}
    >

      <View style={styles.content}>
        {/* 상단 */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
          >
            <Text
              style={[
                styles.back,
                {
                  color: colors.text,
                  fontSize: fontSize + 15,
                },
              ]}
            >
              ‹
            </Text>
          </TouchableOpacity>
          <Text
            style={[
              styles.title,
              {
                color: colors.text,
                fontSize: fontSize + 8,
              },
            ]}
          >
            장소 보관함
          </Text>
        </View>

        <View style={styles.tabContainer}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={styles.tab}
              onPress={() => setSelectedTab(tab.id)}
            >

              <Text
                style={[
                  styles.tabText,
                  {
                    color: selectedTab === tab.id ? colors.accentText : colors.text,
                    opacity: selectedTab === tab.id ? 1 : 0.4,
                    fontSize: fontSize,
                  }
                ]}
              >
                {tab.title}
              </Text>

              {
                selectedTab === tab.id &&
                (
                  <View
                    style={[
                      styles.underline,
                      {
                        backgroundColor: colors.accent,
                      }
                    ]}
                  />
                )
              }
            </TouchableOpacity>
          ))}
        </View>

        {/* 장소 목록 */}
        {isLoading ? (
          <ActivityIndicator style={styles.statusBox} color={colors.accent} />
        ) : isError ? (
          <Text style={[styles.statusText, { color: colors.subText }]}>
            불러오지 못했습니다.
          </Text>
        ) : rows.length === 0 ? (
          <Text style={[styles.statusText, { color: colors.subText }]}>
            저장된 장소가 없어요.
          </Text>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            {rows.map((row) => {
              if (!row.facility) return null;
              const facility = row.facility;
              return (
                <TouchableOpacity
                  key={row.item.id}
                  style={[
                    styles.placeCard,
                    {
                      backgroundColor: colors.card,
                    },
                  ]}
                  onPress={() =>
                    navigation.navigate('PlaceDetail', { place: mapFacilityToKakaoPlace(facility) })
                  }
                >

                  <TouchableOpacity
                    style={styles.starButton}
                    onPress={() =>
                      removeFavoriteMutation.mutate({
                        favoriteId: row.item.id,
                        facilityId: row.item.facility_id,
                      })
                    }
                  >
                    <Text style={[styles.star, { color: GREEN.primary }]}>★</Text>
                  </TouchableOpacity>

                  <View style={styles.info}>

                    <View style={styles.topRow}>
                      <Text
                        style={[
                          styles.placeName,
                          {
                            color: colors.text,
                            fontSize: fontSize + 2,
                          },
                        ]}
                        numberOfLines={1}
                      >
                        {facility.name}
                      </Text>
                    </View>

                    <Text
                      style={[
                        styles.address,
                        {
                          color: colors.subText,
                          fontSize: fontSize - 2,
                        },
                      ]}
                      numberOfLines={1}
                    >
                      {facility.address || '주소 정보 없음'}
                    </Text>

                    <View style={styles.barrierContainer}>
                      {getAvailableAccessibilityIcons(facility.accessibility).map((icon, index) => (
                        <View
                          key={index}
                          style={[
                            styles.barrierBox,
                            {
                              backgroundColor: colors.iconBackground,
                            },
                          ]}
                        >
                          <Text style={styles.barrierIcon}>
                            {icon}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </View>

      <BottomTabBar activeTab="storage" />

    </View>
  );
}

const styles = StyleSheet.create({
  container:{
    flex:1,
  },

  content: {
    flex: 1,
    padding: 20,
  },

  header:{
    marginTop:60,
    flexDirection:'row',
    alignItems:'center',
  },

  back:{
    marginRight:15,
  },

  title:{
    fontWeight:'700',
  },

  placeCard:{
    marginTop:16,
    minHeight:120,
    borderRadius:15,
    flexDirection:'row',
    alignItems:'center',
    padding:15,
    position:"relative",
  },

  info:{
    flex:1,
    paddingRight: 32,
  },

  address:{
    marginBottom:12,
  },

  placeName:{
    fontWeight:'600',
    marginBottom:4,
  },

  tabContainer:{
    flexDirection:'row',
    marginTop:30,
    justifyContent:'space-around',
  },

  tab:{
    alignItems:'center',
  },

  tabText:{
    fontWeight:'600',
  },

  underline:{
    height:2,
    width:60,
    marginTop:8,
  },

  topRow:{
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'center',
  },

  starButton:{
    position:"absolute",
    right:16,
    top:16,
  },

  star:{
    fontSize:28,
  },

  barrierContainer:{
    flexDirection:'row',
    marginTop:0,
  },

  barrierBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
  },

  barrierIcon: {
    fontSize: 21,
  },

  statusBox: {
    marginTop: 40,
  },

  statusText: {
    marginTop: 40,
    fontSize: 14,
    textAlign: 'center',
  },

});
