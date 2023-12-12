import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TextInput,
  Button,
  ScrollView,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Image,
  StatusBar,
} from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useEffect, useState } from "react";
import Icon from "react-native-vector-icons/FontAwesome";
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
import { useRoute } from "@react-navigation/native";

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

const CommunityHome = () => {
  const route = useRoute();
  const [event, setEvent] = useState([]);
  const [eventName, setEventName] = useState("");
  const [category, setCategory] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventStartTime, setEventStartTime] = useState("");
  const [eventEndTime, setEventEndTime] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [eventPic, setEventPic] = useState(".");
  const { community } = route.params || {};
  const [isRefreshing, setIsRefreshing] = useState(false);
  const navigation = useNavigation(); // Hook to get navigation object

  const fetchData = async () => {
    setIsRefreshing(true);

    try {
      if (community) {
        const q = query(
          collection(db, "Events"),
          where("communityName", "==", community)
        );
        const querySnapshot = await getDocs(q);

        let events = [];
        querySnapshot.forEach((doc) => {
          const {
            eventName,
            category,
            eventDate,
            eventDescription,
            eventStartTime,
            eventEndTime,
            eventLocation,
            imageUrl,
            username,
            communityName,
          } = doc.data();

          events.push({
            id: doc.id,
            eventName,
            category,
            eventDate,
            eventDescription,
            eventStartTime,
            eventEndTime,
            eventLocation,
            imageUrl,
            username,
            communityName,
          });
        });

        setEvent(events);
      } else {
        console.warn("Community name is undefined.");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [community]);

  const handleAddEvent = () => {
    // Navigate to the screen where users can add events
    navigation.navigate("CreateCommunityEvent", { communityName: community });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Community: {community}</Text>
      <TouchableOpacity style={styles.addButton} onPress={handleAddEvent}>
        <Text style={styles.addButtonText}>Add Event</Text>
      </TouchableOpacity>

      <View style={styles.flatListContainer}>
        <FlatList
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={fetchData} />
          }
          data={event}
          keyExtractor={(item) => item.eventName}
          renderItem={({ item }) => (
            <View style={styles.innerContainer}>
              <Text style={styles.eventName}>{item.eventName}</Text>
              {item.imageUrl && (
                <Image source={{ uri: item.imageUrl }} style={styles.image} />
              )}

              <Text style={styles.eventDescription}>
                "{item.eventDescription}""
              </Text>
              <Text style={styles.eventLocation}>{item.eventLocation}</Text>
              <View style={styles.eventTimeDateContainer}>
                <Text style={styles.eventDate}>Date: {item.eventDate}</Text>
                <Text style={styles.eventTime}>
                  Time of start: {item.eventStartTime}
                </Text>
                <Text style={styles.eventTime}>
                  Time of end: {item.eventEndTime}
                </Text>
              </View>
              <Text style={styles.postedTitle}>Posted by:</Text>
              <Text style={styles.username}>{item.username}</Text>
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.registerDetailsButton}>
                  <Text style={styles.registerDetailsButtonText}>
                    Register details
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.showMoreButton}>
                  <Text style={styles.showMoreButtonText}>Show more</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.commentButton}>
                  <Icon
                    name="comments"
                    size={20}
                    color="#fff"
                    style={styles.commentIcon}
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: StatusBar.currentHeight || 50,
    backgroundColor: "#fff",
  },
  flatListContainer: {
    flex: 1,
    padding: 16,
  },
  innerContainer: {
    borderWidth: 1,
    backgroundColor: "#fff",
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    width: screenWidth * 0.8,
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#3498db",
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "column",
  },
  addButton: {
    backgroundColor: "#27ae60",
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    alignSelf: "center",
  },
  addButtonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  commentButton: {
    backgroundColor: "#2ecc71",
    borderRadius: 8,
    height: 70,
    width: "20%",
    justifyContent: "center",
    alignSelf: "flex-end",
    marginRight: 10, // Add margin to separate buttons
    marginTop: -70,
  },
  commentButtonText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  commentIcon: {
    alignSelf: "center",
  },
  showMoreButton: {
    backgroundColor: "#e74c3c", // Choose a color for the Comments button
    borderRadius: 8,
    height: 30,
    justifyContent: "center",
    width: "70%",
    alignSelf: "flex-start",
    marginTop: 10,
  },
  showMoreButtonText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  trendText: {
    padding: 16,
    fontSize: 20,
    color: "#333",
    fontStyle: "italic",
  },
  titleText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff", // Set text color to white
  },

  logInButton: {
    backgroundColor: "#e74c3c",
    borderRadius: 8,
    padding: 15,
    width: 80,
    alignItems: "center",
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
  searchBar: {
    backgroundColor: "#ecf0f1",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    height: 40,
    width: screenWidth * 0.6,
    borderColor: "#bdc3c7",
    borderWidth: 1,
    fontSize: 16,
    color: "#2c3e50",
    marginRight: 10,
  },
  image: {
    width: "100%", // Take the full width of the container
    height: 200, // Set a fixed height or adjust as needed
    borderRadius: 8, // Optional: Add borderRadius for a rounded appearance
    marginBottom: 12, // Optional: Add margin to separate image from other details
  },
  registerDetailsButtonText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  registerDetailsButton: {
    backgroundColor: "#3498db",
    borderRadius: 8,
    height: 30,
    width: "70%",
    alignSelf: "flex-start",
    justifyContent: "center",
  },
  eventName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 8,
  },
  eventDescription: {
    fontSize: 14,
    color: "#555",
    marginBottom: 12,
  },
  eventDate: { fontSize: 10, fontWeight: "bold", color: "#ffffff" },
  eventTime: { fontSize: 10, fontWeight: "bold", color: "#ffffff" },
  eventLocation: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#3498db",
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
  eventTimeDateContainer: {
    justifyContent: "space-between",
    marginTop: 12,
  },
  eventDate: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#333",
  },
  eventTime: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#333",
  },
});
export default CommunityHome;
