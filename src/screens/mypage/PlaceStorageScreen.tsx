import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useSettingStore } from '../../stores/useSettingStore';
import BottomTabBar from "../../components/common/BottomTabBar";
import { GREEN, DARK } from "../../constants/colors";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

export default function PlaceStorage() {
  const navigation = useNavigation();
  const { isDark, fontSize } = useSettingStore();
  const colors = {
    background: isDark ? DARK.background : GREEN.screenBg,
    text: isDark ? DARK.text : '#000000',
    subText: isDark ? DARK.subText : '#777777',
    card: isDark ? DARK.card : '#FFFFFF',
    image: isDark ? DARK.innerCard : '#D9D9D9',
    iconBackground: isDark ? "#3A5A46" : GREEN.tint,
    accentText: isDark ? DARK.text : GREEN.primaryText,
    accent: isDark ? DARK.text : GREEN.primary,
  };
  const [bookmarked, setBookmarked] = useState(true);
  const [selectedTab, setSelectedTab] =
    useState<'favorite' | 'want' | 'visited'>('favorite');

  const places = {
    favorite: [
      {
        id: 1,
        name: '서울숲',
        address: '서울특별시 성동구',
        icons: ['♿', '🚻', '🅿️'],
      },
    ],

    want: [
      {
        id: 2,
        name: '남산서울타워',
        address: '서울특별시 용산구',
        icons: ['🛗', '🐕', '🍼'],
      },
    ],

    visited: [
      {
        id: 3,
        name: '경복궁',
        address: '서울특별시 종로구',
        icons: ['♿', '🛗', '🚻'],
      },
    ],
  };

  const currentPlaces = places[selectedTab];

  const tabs: {
    id: 'favorite' | 'want' | 'visited';
    title: string;
  }[] = [
    {
      id:'favorite',
      title:'즐겨찾는 곳'
    },
    {
      id:'want',
      title:'가고싶은 곳'
    },
    {
      id:'visited',
      title:'방문했던 곳'
    }
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

        {/* 장소 카드 */}
        <TouchableOpacity
          style={[
            styles.placeCard,
            {
              backgroundColor: colors.card,
            },
          ]}
        >

          <TouchableOpacity
            style={styles.starButton}
            onPress={() => setBookmarked(!bookmarked)}
          >
            <Text
              style={[
                styles.star,
                {
                  color: bookmarked ? GREEN.primary : "#D3D3D3",
                },
              ]}
            >
              {bookmarked ? "★" : "☆"}
            </Text>
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
              >
                {currentPlaces[0].name}
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
            >
              {currentPlaces[0].address}
            </Text>

            <View style={styles.barrierContainer}>
              {currentPlaces[0].icons.map((icon, index) => (
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
    marginTop:30,
    height:140,
    borderRadius:15,
    flexDirection:'row',
    alignItems:'center',
    padding:15,
    position:"relative",
  },

  info:{
    flex:1,
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

});