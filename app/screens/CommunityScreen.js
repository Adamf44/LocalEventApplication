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

  //use effect to get auth status
  useEffect(() => {
    //fetchUserCommunities();
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      if (user) {
        console.log("User is authenticated on home screen.");
      }
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
          console.log("User email:", value); // Debugging statement
          if (value !== null) {
            getDocs(
              query(
                collection(db, "Communities"),
                where("userEmail", "==", value) // Using value directly
              )
            ).then((docSnap) => {
              console.log("Documents fetched:", docSnap.docs.length); // Debugging statement
              let info = [];
              docSnap.forEach((doc) => {
                const { communityName, description } = doc.data(); // Removed userEmail since it's already filtered
                info.push({
                  ...doc.data(),
                  id: doc.id,
                  communityName,
                  description,
                });
              });
              console.log("User communities:", info); // Debugging statement
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
    console.log("this is definedddddddddddddddd" + comName);
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
                  <Text style={styles.cardDesc}>{item.description}</Text>
                </View>
              </TouchableOpacity>
            </View>
          )}
        />
      </View>
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

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
    });

    return () => unsubscribe();
  }, []);

  console.log(
    "User is authenticated on community create tab: " + isAuthenticated
  );

  const handleCreateCommunity = async () => {
    try {
      const userEmail = await AsyncStorage.getItem("userEmail");
      if (!userEmail) {
        // Handle case where user email is not available
        console.log("User email not found in AsyncStorage");
        return;
      }

      const docRef = await addDoc(collection(db, "Communities"), {
        communityName,
        description,
        visibility,
        userEmail: userEmail,
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
    <ScrollView contentContainerStyle={styles.container}>
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

      <View style={styles.createContainer}>
        <Text style={styles.heading}>
          Create a New Community & invite friends!
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Community Name"
          value={communityName}
          onChangeText={(text) => setCommunityName(text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Description"
          value={description}
          onChangeText={(text) => setDescription(text)}
          multiline
        />
        <TextInput
          style={styles.input}
          placeholder="Visibility (Private, Public, etc.)"
          value={visibility}
          onChangeText={(text) => setVisibility(text)}
        />
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreateCommunity}
        >
          <Text style={styles.createButtonText}>Create</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
    height: "16%",
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

  flatListContainer: {
    flex: 1,
    padding: 5,
  },
  createContainer: {
    flex: 1,
    padding: 10,
    alignItems: "center",
  },
  heading: {
    marginBottom: 15,
    fontSize: 20,
    fontWeight: "bold",
    color: "#2c3e50",
  },

  innerContainer: {
    padding: 20,
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
    fontWeight: "bold",
    color: "white",
  },
  cardDesc: {
    fontSize: 10,
    color: "white",
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: "#bdc3c7",
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
    marginTop: 10,
  },
  createButtonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
});
export default CommunityScreen;
