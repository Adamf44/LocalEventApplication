import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  ImageBackground,
  Dimensions,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  collection,
  query,
  getDocs,
  updateDoc,
  where,
} from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

const AttendEvent = ({ navigation, route }) => {
  const { eventName } = route.params || {};
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    getEmailData();
  }, []);

  const getEmailData = async () => {
    try {
      const value = await AsyncStorage.getItem("userEmail");
      setUserEmail(value);
    } catch (error) {
      console.error("Error reading email from AsyncStorage:", error);
    }
  };

  const handleGoBack = () => {
    navigation.navigate("HomeScreen");
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("../assets/s.png")}
        style={styles.backgroundImage}
      >
        <View style={styles.appHead}>
          <Text style={styles.titleText}>EventFinder</Text>
          <Text style={styles.screenText}>Registration confirmation</Text>
        </View>

        <TouchableOpacity
          style={styles.navButtons}
          onPress={() => navigation.goBack()}
        >
          <Image
            style={styles.navHomeImg}
            source={require("../assets/left.png")}
          />
        </TouchableOpacity>
      </ImageBackground>
      <Text style={styles.thankYouMessage}>
        Thank you, <Text style={styles.eventName}>{userEmail}</Text>, you are
        now registered to attend the event,{" "}
        <Text style={styles.eventName}>{eventName}!</Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "lightgrey",
    marginTop: StatusBar.currentHeight || 40,
  },
  appHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    backgroundColor: "#3498db",
  },
  backButton: {
    marginBottom: 16,
    padding: 20,
  },
  backButtonText: {
    fontSize: 16,
    color: "#3498db",
  },
  navButtons: { padding: 10 },
  navHomeImg: { height: 30, width: 30, opacity: 1 },
  titleText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  screenText: {
    fontSize: 18,
    color: "#fff",
  },
  thankYouMessage: {
    fontSize: 45,
    color: "#2c3e50",
    textAlign: "center",
    paddingHorizontal: 20,
    marginTop: 20,
  },
  backgroundImage: {
    height: screenHeight * 0.5,
    width: screenWidth,
  },
  eventName: {
    fontWeight: "bold",
    fontSize: 25,
    color: "#3498db",
    textAlign: "center",
    paddingHorizontal: 20,
  },
});

export default AttendEvent;
