import React from "react";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSettingStore } from "../../stores/useSettingStore";
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomTabBar from "../../components/common/BottomTabBar";
import { GREEN, DARK } from "../../constants/colors";
import { useLogoutMutation } from "../../queries/useLogoutMutation";
import { useDeleteAccountMutation } from "../../queries/useDeleteAccountMutation";
import { useClearAllFavoritesMutation } from "../../queries/useClearAllFavoritesMutation";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
} from "react-native";

export default function Setting() {
  const { isDark, fontSize, setFontSize } = useSettingStore();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [modalVisible, setModalVisible] = React.useState(false);
  const [modalType, setModalType] = React.useState("");
  const [toast, setToast] = React.useState("");
  const openModal = (type: string) => {
    setModalType(type);
    setModalVisible(true);
  };
  const logoutMutation = useLogoutMutation();
  const deleteAccountMutation = useDeleteAccountMutation();
  const clearAllFavoritesMutation = useClearAllFavoritesMutation();

  const colors = {
    background: isDark ? DARK.background : GREEN.screenBg,
    card: isDark ? DARK.card : "#FFFFFF",
    innerCard: isDark ? DARK.innerCard : GREEN.softer,
    buttonBackground: isDark ? DARK.border : GREEN.soft,
    border: isDark ? DARK.border : GREEN.border,
    text: isDark ? DARK.text : "#000000",
    subText: isDark ? DARK.subText : "#808080",
    selectedText: isDark ? DARK.text : GREEN.primaryText,
    danger: "#FF0000",
  };

  const sizes = {
    title: fontSize + 9,
    section: fontSize,
    normal: fontSize,
    small: fontSize - 1,
  };

  const confirmAction = () => {
    if (modalType === "로그아웃")
      logoutMutation.mutate();
    else if (modalType === "회원 탈퇴")
      deleteAccountMutation.mutate();
    else if (modalType === "검색 기록")
      console.log("검색 기록 삭제 실행");
    else if (modalType === "즐겨찾기")
      clearAllFavoritesMutation.mutate();
    
    setModalVisible(false);

    setToast(
      modalType === "검색 기록"
        ? "검색 기록 전체가 삭제되었습니다."
        : modalType === "즐겨찾기"
        ? "즐겨찾기 전체가 삭제되었습니다."
        : modalType === "로그아웃"
        ? "로그아웃되었습니다."
        : "회원 탈퇴가 완료되었습니다."
    );

    setTimeout(() => {
      setToast("");
    }, 3000);
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
      {/* 상단 */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text
            style={[
              styles.back,
              {
                color: colors.text,
                fontSize: sizes.title + 6,
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
              fontSize: sizes.title,
            },
          ]}
        >
          설정
        </Text>
      </View>

      {/* 화면 설정 */}
      <Text
        style={[
          styles.section,
          {
            color: colors.subText,
            fontSize: sizes.section,
          },
        ]}
      >
        화면 설정
      </Text>

      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
          },
        ]}
      >
        <Text
          style={[
            styles.label,
            {
              color: colors.text,
              fontSize: sizes.normal,
            },
          ]}
        >
          글자크기
        </Text>

        <View
          style={[
            styles.sizeContainer,
            {
              backgroundColor: colors.buttonBackground,
            },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.sizeBtn,
              fontSize === 15 && {
                backgroundColor: colors.innerCard,
                borderRadius: 10,
              },
            ]}
            onPress={() => setFontSize(15)}
          >
            <Text
              style={{
                fontSize: 15,
                color: fontSize === 15 ? colors.selectedText : colors.text,
                fontWeight: fontSize === 15 ? '700' : '400',
              }}
            >
              기본
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.sizeBtn,
              fontSize === 17 && {
                backgroundColor: colors.innerCard,
                borderRadius: 10,
              },
            ]}
            onPress={() => setFontSize(17)}
          >
            <Text
              style={{
                fontSize: 17,
                color: fontSize === 17 ? colors.selectedText : colors.text,
                fontWeight: fontSize === 17 ? '700' : '400',
              }}
            >
              크게
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.sizeBtn,
              fontSize === 19 && {
                backgroundColor: colors.innerCard,
                borderRadius: 10,
              },
            ]}
            onPress={() => setFontSize(19)}
          >
            <Text
              style={{
                fontSize: 19,
                color: fontSize === 19 ? colors.selectedText : colors.text,
                fontWeight: fontSize === 19 ? '700' : '400',
              }}
            >
              더 크게
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 기록 관리 */}
      <Text
        style={[
          styles.section,
          {
            color: colors.subText,
            fontSize: sizes.section,
          },
        ]}
      >
        기록 관리
      </Text>

      <TouchableOpacity
        style={[
          styles.menu,
          {
            backgroundColor: colors.innerCard,
            borderColor: colors.border,
          },
        ]}
        onPress={() => openModal("검색 기록")}
      >
        <Text
          style={{
            color: colors.text,
            fontSize: sizes.normal,
          }}
        >
          검색 기록 전체 삭제
        </Text>
        <Text
          style={{
            color: colors.subText,
          }}
        >
        ›
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.menu,
          {
            backgroundColor: colors.innerCard,
            borderColor: colors.border,
          },
        ]}
        onPress={() => openModal("즐겨찾기")}
      >
        <Text
          style={{
            color: colors.text,
            fontSize: sizes.normal,
          }}
        >
        즐겨찾기 전체 삭제
        </Text>
        <Text
          style={{
            color: colors.subText,
          }}
        >
        ›
        </Text>
      </TouchableOpacity>

      {/* 계정 */}
      <Text
        style={[
          styles.section,
          {
            color: colors.subText,
            fontSize: sizes.section,
          },
        ]}
      >
        계정
      </Text>

      <TouchableOpacity
        style={styles.accountBtn}
        onPress={() => openModal("로그아웃")}
      >
        <Text
          style={{
          color: colors.text,
          fontSize: sizes.normal,
        }}
      >
      로그아웃
      </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.accountBtn}
        onPress={() => openModal("회원 탈퇴")}
      >
        <Text
          style={{
            color: colors.danger,
            fontSize: sizes.normal,
          }}
        >
        회원 탈퇴
        </Text>
      </TouchableOpacity>

      {/* 삭제 확인 모달 */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
      >
        <View style={styles.modalBackground}>

          <View
            style={[
              styles.modalBox,
              {
                backgroundColor: colors.card,
              },
            ]}
          >

          <Text
            style={[
              styles.modalTitle,
              {
                color: colors.text,
                fontSize: sizes.normal + 2,
              },
            ]}
          >
            {modalType === "로그아웃" || modalType === "회원 탈퇴"
              ? modalType
              : `${modalType} 삭제`}
          </Text>

          <Text
            style={[
              styles.modalText,
              {
                color: colors.subText,
                fontSize: sizes.normal,
              },
            ]}
          >
            {modalType === "회원 탈퇴"
              ? "정말 회원 탈퇴하시겠습니까?\n탈퇴 후에는 계정을 복구할 수 없습니다."
              : modalType === "로그아웃"
              ? "정말 로그아웃하시겠습니까?"
              : "정말 삭제하시겠습니까?"}
            </Text>
          <View style={styles.modalButtons}>

            <Pressable
              onPress={() => setModalVisible(false)}
            >
              <Text
                style={{
                  color: colors.subText,
                  fontSize: sizes.normal,
                }}
              >
                취소
              </Text>
            </Pressable>


            <Pressable
              onPress={confirmAction}
            >
              <Text
                style={{
                  color: colors.text,
                  fontSize: sizes.normal,
                  fontWeight:"bold",
                }}
              >
                확인
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>

    {/* 삭제 완료 알림 */}
    {toast !== "" && (
      <View
        style={[
          styles.toast,
          {
            backgroundColor: colors.card,
          },
        ]}
      >
        <Text
          style={{
            color: colors.text,
            fontSize: sizes.normal,
          }}
        >
          {toast}
        </Text>
      </View>
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

  content: {
    flex: 1,
    padding: 20,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
  },

  back: {
    fontSize: 28,
  },

  backButton: {
    padding: 10,
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
  },

  section: {
    color: "gray",
    marginBottom: 10,
    marginTop: 20,
  },

  card: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    padding: 15,
  },

  label: {
    fontWeight: "600",
    marginBottom: 10,
  },

  sizeContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    backgroundColor: "#EAEAEA",
    borderRadius: 10,
    paddingVertical: 4,
  },

  sizeBtn: {
    width: 80,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },

  menu: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    padding: 15,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  accountBtn: {
    paddingVertical: 15,
  },

  modalBackground:{
    flex:1,
    backgroundColor:"rgba(0,0,0,0.4)",
    justifyContent:"center",
    alignItems:"center",
  },


  modalBox:{
    width:"80%",
    borderRadius:15,
    padding:25,
  },


  modalTitle:{
    fontWeight:"bold",
    marginBottom:15,
  },


  modalText:{
    marginBottom:25,
  },


  modalButtons:{
    flexDirection:"row",
    justifyContent:"flex-end",
    gap:25,
  },


  toast:{
    position:"absolute",
    bottom:100,
    alignSelf:"center",
    paddingHorizontal:20,
    paddingVertical:12,
    borderRadius:20,
  },

});