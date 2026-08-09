import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useSettingStore } from '../store/settingStore';
import BottomTabBar from "../components/BottomTabBar";
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
    background: isDark ? '#121212' : '#FFFFFF',
    text: isDark ? '#FFFFFF' : '#000000',
    subText: isDark ? '#BBBBBB' : '#777777',
    card: isDark ? '#2A2A2A' : '#F5F5F5',
    image: isDark ? '#444444' : '#D9D9D9',
    barrier : isDark ? '#444444' : '#FFFFFF',
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
      },
    ],

    want: [
      {
        id: 2,
        name: '남산서울타워',
        address: '서울특별시 용산구',
      },
    ],

    visited: [
      {
        id: 3,
        name: '경복궁',
        address: '서울특별시 종로구',
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
                    color: colors.text,
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
                        backgroundColor: colors.text,
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
                  color: bookmarked ? "#FFD700" : "#D3D3D3",
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
              <View
                style={[
                  styles.barrierBox,
                  {
                    backgroundColor: colors.barrier,
                  },
                ]}
              />

              <View
                style={[
                  styles.barrierBox,
                  {
                    backgroundColor: colors.barrier,
                  },
                ]}
              />

              <View
                style={[
                  styles.barrierBox,
                  {
                    backgroundColor: colors.barrier,
                  },
                ]}
              />
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

  barrierBox:{
    width:30,
    height:30,
    borderRadius:8,
    backgroundColor:'#DDDDDD',
    marginRight:6,
  },

});