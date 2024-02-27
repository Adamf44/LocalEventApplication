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

//Globals
const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

const ProfileScreen = ({ navigation, route }) => {
  const [userData, setUserData] = useState(null);
  const [username, setUsername] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  //use effect to get auth status
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      if (user) {
        console.log("User is authenticated on profile screen.");
      }
    });

    return () => unsubscribe();
  }, [setIsAuthenticated]);

  useEffect(() => {
    const getUserAbout = async () => {
      try {
        const value = await AsyncStorage.getItem("userEmail");
        setUserEmail(value);
        if (value !== null) {
          setUserEmail(value);

          getDocs(
            query(collection(db, "Users"), where("email", "==", value))
          ).then((docSnap) => {
            let info = [];
            docSnap.forEach((doc) => {
              const { fullName, userBio, username, password, email } =
                doc.data();

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
        } else {
          console.log("User email not found in AsyncStorage");
        }
      } catch (error) {
        console.error("Error fetching user about information: ", error.message);
      }
    };

    getUserAbout();
  }, []);

  //to handle the log out
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
    navigation.navigate("EventBookmarks", { userEmail });
  };

  const handleEditAccount = async () => {
    navigation.navigate("EditAccountScreen", { userEmail });
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    getUserAbout();
    setIsRefreshing(false);
  };

  const handleLoginPress = () => {
    navigation.navigate("LoginScreen");
  };

  return (
    <View style={styles.container}>
      <View style={styles.appHead}>
        <Text style={styles.titleText}>EventFinder</Text>
        <Text style={styles.appHeadTitle}>Profile page</Text>
        <View style={styles.searchContainer}>
          {isAuthenticated ? null : (
            <TouchableOpacity
              onPress={handleLoginPress}
              style={styles.logInButton}
            >
              <Text style={styles.logInButtonText}>Log in</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <Text style={styles.usernameText}>Welcome, {username}!</Text>
      {userData &&
        userData.map((item) => (
          <View style={styles.innerContainer} key={item.username}>
            <Image
              style={styles.proImg}
              source={require("../assets/profile.png")}
            />

            <Text style={styles.fullName}>Name: {item.fullName}</Text>

            <Text style={styles.userBio}>{item.userBio}</Text>
            <Image
              style={styles.lineSep}
              source={require("../assets/horizontal-rule.png")}
            />
            <Text style={styles.userEmail}>Email: {item.email}</Text>
            <Image
              style={styles.lineSep}
              source={require("../assets/horizontal-rule.png")}
            />
            <Text style={styles.userEmail}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas
              in arcu id nunc sagittis varius ut et magna. Orci varius natoque
              penatibus et magnis dis parturient montes, nascetur ridiculus mus.
              Ut hendrerit porttitor lorem non condimentum. Nullam non lectus at
              turpis vestibulum mollis. Donec condimentum velit at malesuada
              tincidunt. Nam blandit lorem sit amet egestas aliquam. Aliquam
              varius pharetra mi, in imperdiet neque aliquet vel. Etiam a orci
              quis quam ultricies iaculis. Praesent tempus augue vel risus
              hendrerit gravida.{" "}
            </Text>

            <View style={styles.buttonCon1}>
              <TouchableOpacity
                style={styles.savedEventButton}
                onPress={() => handleBookmarkButton(userEmail)}
              >
                <Image
                  style={styles.butImg}
                  source={require("../assets/bookmark.png")}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.editButton}
                onPress={() => handleEditAccount(userEmail)}
              >
                <Image
                  style={styles.butImg}
                  source={require("../assets/user-pen.png")}
                />
              </TouchableOpacity>
            </View>
          </View>
        ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "lightgrey",
  },
  appHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    backgroundColor: "#3498db",
    height: "13%",
    marginTop: "0%",
  },
  titleText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "snow",
    alignSelf: "center",
    marginTop: "5%",
    padding: 10,
  },

  appHeadTitle: {
    fontSize: 18,
    color: "snow",
    flexDirection: "row",
    alignItems: "center",
    marginTop: "13%",
  },

  buttonCon1: {
    flexDirection: "row",
    justifyContent: "center",
    marginHorizontal: 10,
    marginTop: "10%",
  },
  proImg: {
    width: 100,
    height: 100,
    opacity: 0.4,
  },

  line: {
    height: 2,
    backgroundColor: "#3498db",
    marginVertical: 5,
  },
  lines: {
    height: 20,
    width: 100,
  },
  lineSep: {
    height: 5,
    width: screenWidth * 0.9,
    opacity: 0.1,
    alignSelf: "center",
  },
  logInButton: {
    backgroundColor: "#e74c3c",
    borderRadius: 8,
    padding: 15,
    width: 80,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  logInButtonText: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "bold",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionTitle: {
    alignSelf: "center",
    fontSize: 20,
    fontWeight: "bold",
    color: "#3498db",
    marginTop: 10,
    marginBottom: 5,
  },
  navHomeImg: {
    opacity: 1,
    height: "20%",
    width: "40%",
  },
  butImg: {
    opacity: 1,
    height: 30,
    width: 30,
  },
  title: {
    fontSize: 24,
    color: "#3498db",
    marginBottom: 20,
    fontWeight: "bold",
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
  eventHistoryButton: {
    backgroundColor: "#f39c12",
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
  savedEventButton: {
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
  editButton: {
    backgroundColor: "#2ecc71",
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

  fullName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 8,
  },
  userBio: {
    fontSize: 14,
    color: "#555",
    margin: 10,
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

  userProfileContainer: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  usernameText: {
    alignSelf: "center",
    padding: 10,
    fontSize: 25,
    textDecorationLine: "underline",
    opacity: 0.5,
    marginBottom: 5,
    color: "#2c3e50",
  },
  innerContainer: {
    backgroundColor: "snow",
    alignSelf: "center",
    padding: 16,
    marginBottom: 20,
    width: screenWidth * 0.9,
    height: screenHeight,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  fullName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2c3e50",
    fontStyle: "italic",
    paddingBottom: 10,
    paddingTop: 10,
  },
  userBio: {
    fontSize: 14,
    color: "#7f8c8d",
    margin: 10,
  },
  userEmail: {
    fontSize: 14,
    color: "#7f8c8d",
    margin: 10,
  },
});

export default ProfileScreen;
