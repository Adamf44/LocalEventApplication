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
import { getAuth, signOut } from "firebase/auth"; // Import signOut from firebase/auth
import { Button } from "react-native-web";

const screenWidth = Dimensions.get("window").width;
const ProfileScreen = ({ navigation }) => {
  // State variables
  const [userData, setUserData] = useState(null);
  const [username, setUsername] = useState("");
  const [currentUserEmail, setCurrentUserEmail] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  // useEffect for any initial data fetching or setup
  useEffect(() => {
    getData();
    getUserAbout();
  }, [currentUserEmail, isRefreshing]); // Include isRefreshi// Run the effect whenever currentUserEmail changes

  const getData = async () => {
    try {
      const value = await AsyncStorage.getItem("userEmail");
      if (value !== null) {
        setCurrentUserEmail(value);
      }
    } catch (e) {
      // Handle error reading value
    }
  };
  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      // Clear AsyncStorage and navigate to the login screen
      await AsyncStorage.removeItem("userEmail");
      navigation.navigate("LoginScreen");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Trigger data fetching again
    getUserAbout();
    setIsRefreshing(false);
  };
  return (
    <View style={styles.container}>
      <View style={styles.appHead}>
        <Text style={styles.titleText}>EventFinder</Text>
        <View style={styles.searchContainer}>
          <TextInput placeholder="Search..." style={styles.searchBar} />
          <TouchableOpacity style={styles.logOutButton} onPress={handleLogout}>
            <Text style={styles.logOutButtonText}>Log out</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.buttonCon1}>
        <TouchableOpacity style={styles.eventButton}>
          <Text style={styles.logOutButtonText}>Events</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.editButton}>
          <Text style={styles.logOutButtonText}>Edit account</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.usernameText}>@{username}</Text>

      <View style={styles.flatListContainer}>
        <FlatList
          data={userData}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
            />
          }
          keyExtractor={(item) => item.username}
          renderItem={({ item }) => (
            <View style={styles.innerContainer}>
              <Text style={styles.fullName}>Full name: {item.fullName}</Text>
              <Text style={styles.userBio}>Bio: {item.userBio}</Text>
              <Text style={styles.userEmail}>Email: {item.email}</Text>

              {/* ... (existing code) */}
            </View>
          )}
        />
      </View>
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
    flexDirection: "column",
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
    margin: 10,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  searchBar: {
    backgroundColor: "#ecf0f1",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    height: 40,
    width: screenWidth * 0.6,
    borderColor: "#bdc3c7",
    borderWidth: 1,
    fontSize: 16,
    color: "#2c3e50",
    marginRight: 10,
  },
  logInButton: {
    backgroundColor: "#e74c3c",
    borderRadius: 8,
    padding: 15,
    width: 80,
    alignItems: "center",
  },
  eventButton: {
    backgroundColor: "#e74c3c",
    borderRadius: 8,
    padding: 15,
    width: 80,
    alignItems: "center",
    margin: 5,
  },
  editButton: {
    backgroundColor: "#e74c3c",
    borderRadius: 8,
    padding: 15,
    width: 100,
    alignItems: "center",
    margin: 5,
  },
  logInButtonText: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "bold",
  },
  flatListContainer: {
    flex: 1,
    padding: 16,
  },
  innerContainer: {
    borderWidth: 1,
    backgroundColor: "#fff",
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    width: Dimensions.get("window").width * 0.8,
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  titleText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
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
  buttonContainer: {
    flexDirection: "column",
  },
  logOutButton: {
    backgroundColor: "#e74c3c",
    borderRadius: 8,
    padding: 15,
    width: 80,
    alignItems: "center",
  },
  logOutButtonText: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "bold",
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
});

export default ProfileScreen;
