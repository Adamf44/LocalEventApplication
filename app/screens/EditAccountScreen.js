import {
  StyleSheet,
  Text,
  View,
  Button,
  Alert,
  ScrollView,
  Image,
  TextInput,
  Pressable,
  TouchableOpacity,
  KeyboardAvoidingView,
  PermissionsAndroid,
  StatusBar,
} from "react-native";
import * as React from "react";
import { db } from "../database/config";
import { useState, useEffect } from "react/cjs/react.development";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  deleteDoc,
  where,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import * as ImagePicker from "expo-image-picker";
import { getAuth, onAuthStateChanged } from "firebase/auth";

function EditAccountScreen({ route, navigation }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [userBio, setUserBio] = useState("");
  const [fullName, setFullName] = useState("");
  const [county, setCounty] = useState("");
  const [password, setPassword] = useState("");
  const { userEmail } = route.params || false;

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
    readUserInfo();
  }, []);

  function editProfile() {
    // Query the "Users" collection for the document with the matching email
    const userQuery = query(
      collection(db, "Users"),
      where("email", "==", userEmail)
    );

    // Execute the query
    getDocs(userQuery)
      .then((querySnapshot) => {
        if (!querySnapshot.empty) {
          // Assuming there's only one document with the matching email
          const userDoc = querySnapshot.docs[0].ref;

          // Update the document with the new data
          updateDoc(userDoc, {
            email,
            username,
            userBio,
            fullName,
            county,
          })
            .then(() => {
              // Successfully updated the profile
              Alert.alert("Success", "Your profile has been updated!", [
                {
                  text: "OK",
                  onPress: () => navigation.navigate("ProfileScreen"),
                },
              ]);
            })
            .catch((error) => {
              // Failed to update the profile
              console.error("Error updating profile:", error);
              Alert.alert("ERROR", "Failed to update profile", [
                { text: "OK", onPress: () => console.log("OK Pressed") },
              ]);
            });
        } else {
          // No document found with the given email
          Alert.alert("ERROR", "User not found", [
            { text: "OK", onPress: () => console.log("OK Pressed") },
          ]);
        }
      })
      .catch((error) => {
        // Error fetching user information
        console.error("Error fetching user info:", error);
        Alert.alert("ERROR", "Failed to update profile", [
          { text: "OK", onPress: () => console.log("OK Pressed") },
        ]);
      });
  }

  function readUserInfo() {
    //make try eventually
    getDocs(
      query(collection(db, "Users"), where("email", "==", userEmail))
    ).then((docSnap) => {
      docSnap.forEach((doc) => {
        const { email, fullName, username, userBio, county } = doc.data();

        console.log("Retrieved user info:", {
          email,
          fullName,
          username,
          userBio,
          county,
        });

        setUsername(username);
        setEmail(email);
        setFullName(fullName);
        setUserBio(userBio);
        setCounty(county);
      });
    });
  }

  return (
    <View style={styles.container}>
      <View style={styles.appHead}>
        <Text style={styles.titleText}>EventFinder</Text>
        <Text style={styles.appHeadTitle}>Edit Account</Text>
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

      <View style={styles.mainCon}>
        <Text style={styles.labels}>Full Name</Text>

        <TextInput
          value={fullName}
          onChangeText={(text) => setFullName(text)}
          placeholder="Full name"
          style={styles.inputBox}
        ></TextInput>

        <Text style={styles.labels}>Userame</Text>

        <TextInput
          value={username}
          onChangeText={(text) => setUsername(text)}
          placeholder="Username"
          style={styles.inputBox}
        ></TextInput>

        <Text style={styles.labels}>County</Text>

        <TextInput
          value={county}
          onChangeText={(text) => setCounty(text)}
          placeholder="County"
          style={styles.inputBox}
        ></TextInput>

        <Text style={styles.labels}>Bio</Text>

        <TextInput
          value={userBio}
          onChangeText={(text) => setUserBio(text)}
          placeholder="Bio"
          style={styles.inputBox}
        ></TextInput>

        <Text style={styles.labels}>Email</Text>

        <TextInput
          value={userEmail}
          onChangeText={(text) => setEmail(text)}
          placeholder="Email address.."
          style={styles.inputBox}
        ></TextInput>
        <TouchableOpacity style={styles.button} onPress={editProfile}>
          <Text style={styles.buttonText} onPress={console.log("pressed")}>
            Update
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

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
  navHomeImg: { height: 30, width: 30, opacity: 1 },
  navButtons: { padding: 10 },

  appHeadTitle: {
    fontSize: 18,
    color: "snow",
    flexDirection: "row",
    alignItems: "center",
    marginTop: "13%",
  },
  nav: {
    backgroundColor: "white",
    width: "100%",
    flexDirection: "row",
    paddingBottom: 20,
  },
  errorMsg: {
    color: "red",
    paddingLeft: 40,
  },
  backButton: {
    alignSelf: "left",
    padding: 10,
    flex: 0.17,
  },
  mainCon: { flex: 1 },
  backText: {
    color: "navy",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 20,
  },
  titleNav: {
    alignSelf: "center",
    justifyContent: "center",
    textAlign: "center",
    color: "navy",
    fontWeight: "bold",
    paddingLeft: 15,
    fontSize: 30,
    flex: 0.6,
  },

  buttonDelete: {
    backgroundColor: "navy",
    borderRadius: 50,
    alignSelf: "center",
    padding: 10,
    flex: 0.2,
  },
  buttonDeleteText: {
    fontSize: 20,
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
  labels: {
    fontSize: 20,
    color: "#2c3e50",
    fontStyle: "italic",
    padding: 15,
    flexDirection: "row",
  },
  inputBox: {
    borderWidth: 1,
    borderColor: "black",
    padding: 20,
    width: "80%",
    marginBottom: 10,
    marginLeft: "10%",
    marginRight: "10%",
    borderRadius: 10,
    fontSize: 18,
    height: "5%",
    backgroundColor: "snow",
  },

  buttonContainer: {
    paddingVertical: 40,
  },
  button: {
    backgroundColor: "#3498db",
    borderRadius: 8,
    padding: 15,
    alignSelf: "center",
    width: 150,
    margin: 5,
  },
  buttonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  titleMini: {
    fontSize: 35,
    color: "black",
    fontWeight: "bold",
    textDecorationLine: "underline",
    marginLeft: 20,
    marginVertical: 25,
  },
});

export default EditAccountScreen;
