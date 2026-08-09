import React from "react";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSettingStore } from "../store/settingStore";
import BottomTabBar from "../components/BottomTabBar";
import {
  SafeAreaView,
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

  const colors = {
    background: isDark ? "#222222" : "#FFFFFF",
    card: isDark ? "#333333" : "#F5F5F5",
    innerCard: isDark ? "#444444" : "#FFFFFF",
    buttonBackground: isDark ? "#555555" : "#EAEAEA",
    border: isDark ? "#555555" : "#E5E5E5",
    text: isDark ? "#FFFFFF" : "#000000",
    subText: isDark ? "#BDBDBD" : "#808080",
    danger: "#FF0000",
  };

  const sizes = {
    title: fontSize + 9,
    section: fontSize,
    normal: fontSize,
    small: fontSize - 1,
  };

  const confirmAction = () => {
    console.log('${modalType} 실행');
    console.log("modalType:", modalType);
    setModalVisible(false);
    setToast(
      modalType === "로그아웃"
        ? "로그아웃되었습니다."
        : modalType === "회원 탈퇴"
        ? "회원 탈퇴가 완료되었습니다."
        : `${modalType}가 삭제되었습니다.`
    );

    setTimeout(() => {
      setToast("");
    }, 3000);
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
                  color: colors.text,
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
                  color: colors.text,
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
                  color: colors.text,
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
                      fontWeight: "bold",
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
    backgroundColor: "#fff",
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