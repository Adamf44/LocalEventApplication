import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Image,
  Alert,
} from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
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
  query,
} from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/FontAwesome";
import { db } from "../database/config";
import { useRoute } from "@react-navigation/native";
import { set } from "firebase/database";
import { auth } from "../database/config";
import { getAuth, onAuthStateChanged } from "firebase/auth";

//Globals
const screenHeight = Dimensions.get("window").height;
const screenWidth = Dimensions.get("window").width;

/////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////
////////////////////////////              Logic         /////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////
function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const signInUser = async () => {
    try {
      if (!email || !password) {
        Alert.alert("Error", "Both email and password are required.");
        return;
      }

      const auth = getAuth();

      await signInWithEmailAndPassword(auth, email, password);

      //setting user email as async item
      await AsyncStorage.setItem("userEmail", email);

      console.log("Authentication succeeded for user: " + email);

      navigation.navigate("HomeScreen", {
        userEmail: email,
        isAuthenticated: true,
      });
    } catch (error) {
      console.error("Error signing in: ", error.message);
      Alert.alert("Authentication Failed", "Invalid email or password");
    }
  };

  const handleRegister = () => {
    navigation.navigate("RegisterScreen");
  };

  /////////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////              UI            /////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////
  return (
    <View style={styles.container}>
      <View style={styles.appHead}>
        <Text style={styles.titleText}>EventFinder</Text>
        <Text style={styles.appHeadTitle}>Login to your account</Text>
      </View>

      <View style={styles.loginContainer}>
        <TextInput
          value={email}
          onChangeText={(email) => setEmail(email)}
          placeholder="Email"
          placeholderTextColor={"#4f5250"}
          style={styles.input}
        />
        <TextInput
          value={password}
          onChangeText={(password) => setPassword(password)}
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={"#4f5250"}
          secureTextEntry={true}
        />

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={signInUser}>
            <Text style={styles.buttonText}>Log in</Text>
          </TouchableOpacity>
          <Text>Don't have an account? Register below!</Text>
          <TouchableOpacity
            onPress={handleRegister}
            style={styles.registerButton}
          >
            <Text style={styles.registerButtonText}>Register</Text>
          </TouchableOpacity>
        </View>
        <Image
          source={require("../assets/form.png")}
          style={styles.backgroundImage}
        />
      </View>
    </View>
  ); //end return
} //end Login function

/////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////
////////////////////////////              Style         /////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////

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
  backgroundImage: {
    alignSelf: "center",
    opacity: 1,
    height: 600,
    width: 450,
    marginTop: "-70%",
  },
  loginContainer: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
    marginTop: "20%",
  },
  buttonContainer: {
    flex: 1,
    alignItems: "center",
    marginTop: "5%",
    elevation: 2, // Set elevation to ensure the button is above the image
    zIndex: 1, // Set zIndex to ensure the button is above the image
  },
  title: {
    padding: 10,
    fontSize: 20,
    color: "#2c3e50",
    fontStyle: "italic",
  },
  input: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: "#2c3e50",
    marginBottom: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    fontSize: 20,
    elevation: 2, // Set elevation to ensure the button is above the image
    zIndex: 1, // Set zIndex to ensure the button is above the image
  },
  button: {
    backgroundColor: "#e74c3c",
    borderRadius: 5,
    width: screenHeight * 0.15,
    height: 40,
    marginBottom: 10,
    justifyContent: "center",
    marginTop: 10,
    elevation: 2, // Set elevation to ensure the button is above the image
    zIndex: 1, // Set zIndex to ensure the button is above the image
  },
  registerButton: {
    backgroundColor: "#3498db",
    borderRadius: 5,
    width: screenHeight * 0.15,
    height: 40,
    marginBottom: 10,
    justifyContent: "center",
    marginTop: 10,
    elevation: 2, // Set elevation to ensure the button is above the image
    zIndex: 1, // Set zIndex to ensure the button is above the image
  },
  registerButtonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 20,
    lineHeight: 40,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 20,
    lineHeight: 40,
  },
});

export default LoginScreen;
