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
  const [currentUserEmail, setCurrentUserEmail] = useState("");
  const [userCommunities, setUserCommunities] = useState([]);
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
  console.log(
    "User is authenticated on active communities tab: " + isAuthenticated
  );
  useEffect(() => {
    const fetchUserCommunities = async () => {
      try {
        const userEmail = await AsyncStorage.getItem("userEmail");

        if (!userEmail) {
          console.log("User email not found in AsyncStorage");
        }

        const querySnapshot = await getDocs(
          query(
            collection(db, "Communities"),
            where("userEmail", "==", userEmail)
          )
        );

        const communities = [];

        querySnapshot.forEach((doc) => {
          communities.push({
            id: doc.id,
            ...doc.data(),
          });
        });

        setUserCommunities(communities);
      } catch (error) {
        console.error("Error: ", error.message);
      }
    };

    fetchUserCommunities();
  }, []);

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
                onPress={() => {
                  navigation.navigate("CommunityHome", {
                    community: item.communityName,
                    userEmail: currentUser.email,
                    isAuthenticated,
                  });
                }}
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

  //use effect to control auth
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
  titleText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "snow",
  },
  innerContainer: {
    padding: 20,
  },
  appHeadTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "snow",
    marginTop: 10,
    marginBottom: 5,
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
