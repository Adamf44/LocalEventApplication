import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Button,
  ScrollView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Dimensions,
  RefreshControl,
  ImageBackground,
  Image,
} from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React, { useState, useEffect } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import {
  collection,
  doc,
  setDoc,
  addDoc,
  getDocs,
  query,
  where,
  arrayUnion,
} from "firebase/firestore";
import { db } from "../database/config";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useAuth } from "firebase/auth";
import { Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons } from "@expo/vector-icons";

//Globals
const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;
const handleLoginPress = () => {
  navigation.navigate("LoginScreen");
};

/////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////
////////////////////////////      ActiveCommunities Logic  //////////////////////////
/////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////
const CommunitiesTab = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const navigation = useNavigation();
  const [currentUser, setCurrentUser] = useState(null);
  const [userCommunities, setUserCommunities] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [comAmount, setComAmount] = useState("");

  //use effect to get auth status
  useEffect(() => {
    console.log("User navigated to active communities tab");
    //fetchUserCommunities();
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
    });

    return () => unsubscribe();
  }, [setIsAuthenticated]);

  ///
  useFocusEffect(
    React.useCallback(() => {
      const fetchUserCommunities = async () => {
        try {
          const value = await AsyncStorage.getItem("userEmail");
          setUserEmail(value);
          if (value !== null) {
            getDocs(
              query(
                collection(db, "Communities"),
                where("userEmail", "array-contains", value)
              )
            ).then((docSnap) => {
              setComAmount(docSnap.docs.length);
              let info = [];
              docSnap.forEach((doc) => {
                const { communityName, description } = doc.data();
                info.push({
                  ...doc.data(),
                  id: doc.id,
                  communityName,
                  description,
                });
              });
              setUserCommunities(info);
            });
          } else {
            console.log("User email not found in AsyncStorage");
          }
        } catch (error) {
          console.error(
            "Error fetching user about information: ",
            error.message
          );
        }
      };

      fetchUserCommunities();
    }, [])
  );

  handleActiveCommunitiesNav = (comName) => {
    console.log("User naviagted to their active communities, " + comName);
    navigation.navigate("CommunityHome", { comName });
  };

  // commented out activity circle if no user(if doing conditional auth)
  // if (!userEmail) {
  // return <ActivityIndicator size="large" color="#0000ff" />;
  // }

  /////////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////      ActiveCommunities UI     //////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////

  return (
    <View style={styles.container}>
      <View style={styles.appHead}>
        <Text style={styles.titleText}>EventFinder</Text>
        <Text style={styles.appHeadTitle}>Active communities</Text>
        {isAuthenticated ? null : (
          <TouchableOpacity
            onPress={handleLoginPress}
            style={styles.logInButton}
          >
            <Text style={styles.logInButtonText}>Log in</Text>
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.comAmount}>Active Communities: {comAmount} </Text>
      <View style={styles.flatListContainer}>
        <FlatList
          data={userCommunities}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.innerContainer}>
              <TouchableOpacity
                onPress={() => handleActiveCommunitiesNav(item.communityName)}
              >
                <View style={styles.card}>
                  <Text style={styles.cardText}>{item.communityName}</Text>
                  <Text style={styles.cardDesc}>"{item.description}"</Text>
                </View>
              </TouchableOpacity>
            </View>
          )}
        />
      </View>
      <Image
        source={require("../assets/comBack.png")}
        style={styles.backgroundImage}
      />
    </View>
  );
};

/////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////
////////////////////////////      Create screen Logic    ////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////

const CreateTab = () => {
  const [communityName, setCommunityName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const navigation = useNavigation();
  //use effect to get auth status
  useEffect(() => {
    console.log("User navigated to create community tab");
    //fetchUserCommunities();
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
    });

    return () => unsubscribe();
  }, [setIsAuthenticated]);

  const handleCreateCommunity = async () => {
    try {
      const userEmail = await AsyncStorage.getItem("userEmail");
      if (!userEmail) {
        console.log("User email not found in AsyncStorage");
        return;
      }

      const docRef = await addDoc(collection(db, "Communities"), {
        communityName,
        description,
        visibility,
        userEmail: arrayUnion(userEmail), // Add the user's email to the userEmails array
      });

      console.log("Community created with ID: ", docRef.id);

      setCommunityName("");
      setDescription("");
      setVisibility("");
    } catch (error) {
      console.error("Error creating community: ", error.message);
    }
  };

  /////////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////        Create screen UI     ////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////
  return (
    <View style={styles.container}>
      <View style={styles.appHead}>
        <Text style={styles.titleText}>EventFinder</Text>
        <Text style={styles.appHeadTitle}>Create a community</Text>
        {isAuthenticated ? null : (
          <TouchableOpacity
            onPress={handleLoginPress}
            style={styles.logInButton}
          >
            <Text style={styles.logInButtonText}>Log in</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.heading}>Create a Community & invite friends!</Text>
      <View style={styles.createContainer}>
        <TextInput
          style={styles.nameInput}
          placeholder="Community Name"
          value={communityName}
          onChangeText={(text) => setCommunityName(text)}
        />
        <TextInput
          style={styles.descInput}
          placeholder="Description"
          value={description}
          onChangeText={(text) => setDescription(text)}
          multiline
        />
      </View>

      <TouchableOpacity
        style={styles.createButton}
        onPress={handleCreateCommunity}
      >
        <Text style={styles.createButtonText}>Create</Text>
      </TouchableOpacity>
      <Image
        source={require("../assets/comBack.png")}
        style={styles.backgroundImage}
      />
    </View>
  );
};

const Tab = createBottomTabNavigator();

const CommunityScreen = () => {
  /////////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////    CommunityScreen UI      /////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === "Communities") {
            iconName = "group"; // Set icon for 'Communities' tab
          } else if (route.name === "Create") {
            iconName = "add-circle"; // Set icon for 'Create' tab
          }

          // Return the icon component
          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "snow",
        tabBarInactiveTintColor: "#3498db",
        tabBarActiveBackgroundColor: "#3498db",
        tabBarLabelStyle: {
          fontSize: 16,
          fontWeight: "bold",
          alignSelf: "center",
        },
        tabBarStyle: {
          backgroundColor: "snow",
          height: 100,
          marginBottom: 50,
          backgroundColor: "snow",
        },
      })}
    >
      <Tab.Screen
        name="Communities"
        component={CommunitiesTab}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Create"
        component={CreateTab}
        options={{ headerShown: false }}
      />
    </Tab.Navigator>
  );
};

/////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////
////////////////////////////       Global Style         /////////////////////////////
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
    marginTop: "7%",
    padding: 10,
  },

  appHeadTitle: {
    fontSize: 18,
    color: "snow",
    flexDirection: "row",
    alignItems: "center",
    marginTop: "14%",
  },

  flatListContainer: {
    flex: 1,
    padding: 15,
    position: "relative",
    top: 20,
    zIndex: 1,
  },
  createContainer: {
    flex: 1,
    padding: 5,
    alignItems: "center",
  },
  heading: {
    marginBottom: 15,
    fontSize: 25,
    fontWeight: "bold",
    color: "#2c3e50",
    alignSelf: "center",
    marginTop: "5%",
  },
  comAmount: {
    fontSize: 25,
    color: "#2c3e50",
    fontWeight: "bold",
    padding: 10,
    flexDirection: "row",
    marginTop: "5%",
    alignSelf: "center",
  },

  innerContainer: {
    padding: 10,
  },

  card: {
    alignSelf: "center",
    borderRadius: 8,
    padding: 20,
    backgroundColor: "#2c3e50",
    width: "100%",
  },
  cardText: {
    fontSize: 20,
    letterSpacing: 2,
    fontWeight: "bold",
    color: "white",
    marginBottom: "2%",
  },
  cardDesc: {
    fontSize: 15,
    color: "white",
    fontStyle: "italic",
  },
  descInput: {
    height: 40,
    borderWidth: 1,
    borderColor: "black",
    marginBottom: 20,
    paddingHorizontal: 15,
    borderRadius: 10,
    backgroundColor: "snow",
    fontSize: 16,
    width: "80%",
    height: "25%",
  },
  nameInput: {
    height: 40,
    borderWidth: 1,
    borderColor: "black",
    marginBottom: 20,
    paddingHorizontal: 15,
    borderRadius: 10,
    backgroundColor: "snow",
    fontSize: 16,
    width: "80%",
  },
  createButton: {
    backgroundColor: "#3498db",
    borderRadius: 8,
    padding: 15,
    alignSelf: "center",
    width: 150,
    marginTop: 30,
    elevation: 2,
    zIndex: 1,
  },
  createButtonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  backgroundImage: {
    marginTop: "-50%",
    justifyContent: "center",
    alignSelf: "center",
    opacity: 0.4,
    height: 370,
    width: 370,
  },
});
export default CommunityScreen;
