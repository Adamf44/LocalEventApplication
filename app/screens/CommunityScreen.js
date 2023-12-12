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
import { useNavigation } from "@react-navigation/native"; // Import useNavigation from @react-navigation/native

const CommunitiesTab = () => {
  const navigation = useNavigation(); // Hook to get navigation object

  const [currentUser, setCurrentUser] = useState(null);
  const [userCommunities, setUserCommunities] = useState([]);

  useEffect(() => {
    // Get the current user
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        fetchUserCommunities(user.email); // Pass the email to fetchUserCommunities
      }
    });

    // Clean up the subscription when the component unmounts
    return () => unsubscribe();
  }, [currentUser?.email]);

  const fetchUserCommunities = async (userEmail) => {
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
    }
  };

  if (!currentUser) {
    // Loading or redirect to login
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Your Communities</Text>
      <FlatList
        data={userCommunities}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => {
              // Navigate to the details screen with the community details
              navigation.navigate("CommunityHome", {
                community: item.communityName,
              });
            }}
          >
            <View style={styles.card}>
              <Text style={styles.cardText}>{item.communityName}</Text>
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

  const handleCreateCommunity = async () => {
    try {
      // Add community data to Firestore
      const docRef = await addDoc(collection(db, "Communities"), {
        communityName,
        description,
        visibility,
      });

      console.log("Community created with ID: ", docRef.id);

      // Clear the form after submission
      setCommunityName("");
      setDescription("");
      setVisibility("");
    } catch (error) {
      console.error("Error creating community: ", error.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Create a New Community</Text>
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
      <Button title="Create Community" onPress={handleCreateCommunity} />
    </ScrollView>
  );
};

const Tab = createBottomTabNavigator(); // Use createMaterialTopTabNavigator

const CommunityScreen = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: "red",
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
          height: 0, // Height of the indicator
        },
      })}
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
    backgroundColor: "#ffffff",
  },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  card: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  cardText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  input: {
    height: 40,
    width: "100%",
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 20,
    padding: 10,
  },
});

export default CommunityScreen;
