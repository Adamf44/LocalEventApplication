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
        const { email, fullName, username, userBio } = doc.data();

        console.log("Retrieved user info:", {
          email,
          fullName,
          username,
          userBio,
        });

        setUsername(username);
        setEmail(email);
        setFullName(fullName);
        setUserBio(userBio);
      });
    });
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content"></StatusBar>

      <Text style={styles.titleNav}>Edit profile</Text>

      <Text style={styles.labels}>First Name</Text>

      <TextInput
        value={fullName}
        onChangeText={(text) => setFullName(text)}
        placeholder="Full name"
        style={styles.inputBox}
      ></TextInput>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={editProfile}>
          <Text style={styles.buttonText} onPress={console.log("pressed")}>
            Update
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
    fontSize: 25,
    fontWeight: "600",
    marginLeft: 20,
    marginTop: 20,
    color: "navy",
    marginBottom: 10,
  },
  inputBox: {
    borderWidth: 1.5,
    borderColor: "navy",
    padding: 20,
    width: "80%",
    marginBottom: 10,
    marginLeft: "10%",
    marginRight: "10%",
    borderRadius: 10,
    fontSize: 17.5,
  },

  buttonContainer: {
    paddingVertical: 40,
  },
  button: {
    padding: 20,
    backgroundColor: "navy",

    alignSelf: "center",
    marginBottom: 10,
    borderRadius: 50,
  },
  buttonText: {
    fontSize: 25,
    color: "white",
    textAlign: "center",
    fontWeight: "700",
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
