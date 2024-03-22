import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Alert,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Image,
} from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../database/config";
import firebase from "firebase/app";
import { useFocusEffect } from "@react-navigation/native";
import "firebase/firestore";
import {
  collection,
  doc,
  getDocs,
  get,
  updateDoc,
  arrayUnion,
  where,
  getDoc,
  setDoc,
  query,
} from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/FontAwesome";
import { useRoute } from "@react-navigation/native";
import { set } from "firebase/database";
import { getAuth, onAuthStateChanged } from "firebase/auth";

//nav log
console.log("Register screen");

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

const RegisterScreen = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [userBio, setUserBio] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [county, setCounty] = useState("");

  const createUser = async () => {
    try {
      if (!email || !username || !fullName || !userBio || !password) {
        Alert.alert("Error", "All fields are required.");
        return;
      }
      const auth = getAuth();

      await createUserWithEmailAndPassword(auth, email, password);

      const user = auth.currentUser;

      const userData = {
        email: user.email,
        username: username.trim(),
        userBio: userBio.trim(),
        fullName: fullName.trim(),
        county: county.trim(),
      };

      await setDoc(doc(db, "Users", user.uid), userData);

      Alert.alert("Success", "You have successfully signed up!", [
        {
          text: "OK",
          onPress: () => navigation.navigate("HomeScreen"),
        },
      ]);
    } catch (error) {
      console.error("Error creating user: ", error.message);
      Alert.alert("Error", "Failed to sign up. Please try again later.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.appHead}>
        <Text style={styles.titleText}>EventFinder</Text>
        <Text style={styles.appHeadTitle}>Create an Account</Text>
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
      <View style={styles.formContainer}>
        <Text style={styles.formTitle}>
          Please fill out the required fields:
        </Text>

        <TextInput
          value={username}
          onChangeText={(text) => setUsername(text)}
          placeholder="Username"
          style={styles.input}
        />
        <TextInput
          value={email}
          onChangeText={(text) => setEmail(text)}
          placeholder="Email"
          style={styles.input}
          keyboardType="email-address"
        />
        <TextInput
          value={fullName}
          onChangeText={(text) => setFullName(text)}
          placeholder="Full Name"
          style={styles.input}
        />
        <TextInput
          value={county}
          onChangeText={(text) => setCounty(text)}
          placeholder="County"
          style={styles.input}
        />
        <TextInput
          value={userBio}
          onChangeText={(text) => setUserBio(text)}
          placeholder="User Bio"
          style={styles.input}
        />
        <TextInput
          value={password}
          onChangeText={(text) => setPassword(text)}
          placeholder="Password"
          style={styles.input}
          secureTextEntry
        />
      </View>
      <TouchableOpacity style={styles.button} onPress={createUser}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>
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
  backButton: {
    marginBottom: 16,
    padding: 20,
  },
  backButtonText: {
    fontSize: 16,
    color: "#3498db",
  },
  navHomeImg: { height: 30, width: 30, opacity: 1 },
  navButtons: { padding: 10 },

  formContainer: {
    justifyContent: "center",
    padding: 25,
  },
  formTitle: {
    color: "#2c3e50",
    fontSize: 18,
    padding: 18,
    textDecorationLine: "underline",
    fontWeight: "bold",
    marginBottom: "5%",
  },
  input: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: "#2c3e50",
    marginBottom: 20,
    paddingHorizontal: 15,
    borderRadius: 10,
    fontSize: 20,
  },
  button: {
    backgroundColor: "#b22222",
    borderRadius: 5,
    width: screenHeight * 0.15,
    height: 40,
    marginBottom: 10,
    alignSelf: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    justifyContent: "center",
    fontSize: 20,
    lineHeight: 40,
  },
});

export default RegisterScreen;
