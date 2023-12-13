import React from "react";
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
  RefreshControl,
} from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useEffect, useState } from "react";
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

import { useNavigation } from "@react-navigation/native"; // Import useNavigation from @react-navigation/native

// ... (other imports)
const CommunitiesTab = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const navigation = useNavigation();
  const auth = getAuth();
  const [currentUser, setCurrentUser] = useState(null);
  const [userCommunities, setUserCommunities] = useState([]);

  const isAuthenticated = !!currentUser; // Define isAuthenticated based on currentUser

  useEffect(() => {
    // Get the current user
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        fetchUserCommunities(user.email); // Pass the email to fetchUserCommunities
      }
    });

    // Clean up the subscription when the component unmounts
    return () => unsubscribe();
  }, []);

  const handleRefresh = () => {
    // Pull-down refresh triggers fetchData function
    if (currentUser) {
      fetchUserCommunities(currentUser.email);
    }
  };

  const fetchUserCommunities = async (userEmail) => {
    setIsRefreshing(true);

    try {
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
      console.error("Error fetching user communities: ", error.message);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (!currentUser) {
    // Loading or redirect to login
    return <ActivityIndicator size="large" color="#0000ff" />;
  }
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Active Communities</Text>
      <FlatList
        data={userCommunities}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => {
              // Navigate to the details screen with the community details
              navigation.navigate("CommunityHome", {
                community: item.communityName,
                userEmail: currentUser.email, // Use currentUser.email
                isAuthenticated, // Assuming 'isAuthenticated' is defined somewhere
              });
            }}
          >
            <View style={styles.card}>
              <Text style={styles.cardText}>{item.communityName}</Text>
              <Text style={styles.cardDesc}>{item.description}</Text>

              {/* Display other community details */}
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};
const CreateTab = () => {
  const [communityName, setCommunityName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState("");
  const auth = getAuth();
  const [currentUser, setCurrentUser] = useState(null);

  const isAuthenticated = !!currentUser; // Define isAuthenticated based on currentUser

  const navigation = useNavigation(); // Add this line to get the navigation object

  useEffect(() => {
    // Get the current user
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null); // Set user to null if not authenticated
      }
    });

    // Clean up the subscription when the component unmounts
    return () => unsubscribe();
  }, []);

  const handleCreateCommunity = async () => {
    if (!isAuthenticated) {
      Alert.alert(
        "Authentication Required",
        "Please log in to create a community.",
        [{ text: "OK", onPress: () => navigation.navigate("LoginScreen") }]
      );
      return;
    }
    try {
      if (currentUser) {
        // Add community data to Firestore
        const docRef = await addDoc(collection(db, "Communities"), {
          communityName,
          description,
          visibility,
          userEmail: currentUser.email, // Use currentUser.email
        });

        console.log("Community created with ID: ", docRef.id);

        // Clear the form after submission
        setCommunityName("");
        setDescription("");
        setVisibility("");
      }
    } catch (error) {
      console.error("Error creating community: ", error.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
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
    </ScrollView>
  );
};

const Tab = createBottomTabNavigator(); // Use createMaterialTopTabNavigator

const CommunityScreen = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: "black",
        tabBarInactiveTintColor: "gray",
        tabBarLabelStyle: {
          fontSize: 16,
          fontWeight: "bold",
        },
        tabBarStyle: {
          backgroundColor: "#ffffff",
          height: 100, // Adjust the height as needed
        },
        tabBarIndicatorStyle: {
          backgroundColor: "red", // Color of the indicator
          height: 0, // Height of the indicator (set to 0 to hide it)
        },
      }}
    >
      <Tab.Screen name="Communities" component={CommunitiesTab} />
      <Tab.Screen name="Create" component={CreateTab} />
    </Tab.Navigator>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff", // Update background color
  },
  heading: {
    fontSize: 25,
    fontWeight: "bold",
    marginBottom: 20,
    color: "black", // Update text color
  },
  createButton: {
    backgroundColor: "#3498db",
    borderRadius: 8,
    marginTop: "10%",
    padding: 15,
    width: 80,
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  createButtonText: { fontSize: 14, color: "white", fontWeight: "bold" },
  card: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    backgroundColor: "#5DA5D4", // Update background color
  },
  cardText: {
    fontSize: 25,
    fontWeight: "bold",
    color: "white",
  },
  cardDesc: {
    fontSize: 15,
    color: "white",
  },
  input: {
    alignSelf: "center",
    width: "80%",
    height: 40,
    borderWidth: 1,
    borderColor: "#bdc3c7",
    marginBottom: 20,
    paddingHorizontal: 15,
    borderRadius: 10,
    color: "#2c3e50",
    fontSize: 16,
  },
});

export default CommunityScreen;
