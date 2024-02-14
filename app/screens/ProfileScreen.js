import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  Dimensions,
  RefreshControl,
  StatusBar,
  Image,
} from "react-native";
import { getDocs, query, collection, where } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/FontAwesome";
import { db } from "../database/config";
import { signOut } from "firebase/auth";
import { Button } from "react-native-web";
import { useFocusEffect } from "@react-navigation/native";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const screenWidth = Dimensions.get("window").width;

const ProfileScreen = ({ navigation, route }) => {
  const [userData, setUserData] = useState(null);
  const [username, setUsername] = useState("");
  const [currentUserEmail, setCurrentUserEmail] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  //use effect to control auth
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
    });

    return () => unsubscribe();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      if (!isAuthenticated) {
      }
    }, [isAuthenticated])
  );
  console.log("User is authenticated on notifications: " + isAuthenticated);

  function getUserAbout() {
    getDocs(
      query(collection(db, "Users"), where("email", "==", currentUserEmail))
    ).then((docSnap) => {
      let info = [];
      docSnap.forEach((doc) => {
        const { fullName, userBio, username, password, email } = doc.data();

        info.push({
          ...doc.data(),
          id: doc.id,
          fullName,
          userBio,
          username,
          password,
          email,
        });
        setUsername(username);
      });

      setUserData(info);
    });
  }

  useEffect(() => {
    getData();
    getUserAbout();
  }, [currentUserEmail, isRefreshing]);

  const getData = async () => {
    try {
      const value = await AsyncStorage.getItem("userEmail");
      if (value !== null) {
        setCurrentUserEmail(value);
      }
    } catch (e) {
      console.error("Error reading user email from AsyncStorage:", e);
    }
  };

  const handleLogout = async () => {
    setUserData(null);
    setUsername(null);

    const auth = getAuth();
    try {
      await signOut(auth);

      isAuthenticated: false;
      await AsyncStorage.removeItem("userEmail");
      navigation.navigate("HomeScreen", {});
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };
  const handleBookmarkButton = async () => {
    navigation.navigate("EventBookmarks", { currentUserEmail });
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    getUserAbout();
    setIsRefreshing(false);
  };
  return (
    <View style={styles.container}>
      <View style={styles.appHead}>
        <Text style={styles.titleText}>EventFinder</Text>

        <TouchableOpacity style={styles.headButton} onPress={handleLogout}>
          <Text style={styles.logOutButtonText}>Log out</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.buttonCon1}>
        <TouchableOpacity style={styles.eventButton}>
          <Text style={styles.logOutButtonText}>Edit account</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.eventButton}
          onPress={() => handleBookmarkButton(currentUserEmail)}
        >
          <Text style={styles.logOutButtonText}>Saved Events</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.eventButton}>
          <Text style={styles.logOutButtonText}>Event history</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.usernameText}>Welcome, {username}!</Text>
      {userData &&
        userData.map((item) => (
          <View style={styles.innerContainer} key={item.username}>
            <Text style={styles.fullName}>Full Name: {item.fullName}</Text>
            <Text style={styles.userBio}>Bio: {item.userBio}</Text>
            <Text style={styles.userEmail}>Email: {item.email}</Text>
          </View>
        ))}

      {userData && userData.length === 0 && (
        <Text style={styles.noDataText}>No user data</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    marginTop: StatusBar.currentHeight || 40,
  },
  appHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    backgroundColor: "#3498db",
  },
  buttonCon1: {
    flexDirection: "row",
    justifyContent: "center",
  },

  headButton: {
    backgroundColor: "#e74c3c",
    marginRight: "5%",
    borderRadius: 8,
    padding: 12,
    width: 80,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  eventButton: {
    backgroundColor: "#e74c3c",
    margin: "5%",
    borderRadius: 8,
    padding: 12,
    width: "25%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  logOutButtonText: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "bold",
  },
  flatListContainer: {
    flex: 1,
    padding: 16,
  },

  titleText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginLeft: "5%",
  },
  fullName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 8,
  },
  userBio: {
    fontSize: 14,
    color: "#555",
    marginBottom: 12,
  },
  eventTimeDateContainer: {
    justifyContent: "space-between",
    marginTop: 12,
  },
  email: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#333",
  },
  password: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#333",
  },
  username: {
    fontSize: 12,
    fontStyle: "italic",
    color: "#e74c3c",
    padding: 5,
    marginBottom: 5,
  },
  postedTitle: {
    fontSize: 12,
    color: "#7f8c8d",
    marginTop: 8,
  },

  profileContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  usernameText: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  userProfileContainer: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  usernameText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#3498db",
    marginBottom: 16,
  },
  innerContainer: {
    borderWidth: 1,
    backgroundColor: "#FFFFFF",
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  fullName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 8,
  },
  userBio: {
    fontSize: 14,
    color: "#7f8c8d",
    marginBottom: 8,
  },
  userEmail: {
    fontSize: 14,
    color: "#7f8c8d",
  },
});

export default ProfileScreen;
