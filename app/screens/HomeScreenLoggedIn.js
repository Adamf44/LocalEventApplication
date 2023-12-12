import React from "react";
import {
  StyleSheet,
  Text,
  View,
  Button,
  Alert,
  Image,
  Dimensions,
  TextInput,
  Pressable,
  TouchableOpacity,
  KeyboardAvoidingView,
  FlatList,
  SafeAreaView,
  Touchable,
  StatusBar,
  RefreshControl,
} from "react-native";
import LoginScreen from "./LoginScreen";
import { useState, useEffect } from "react";
import firebase from "firebase/app";
import "firebase/database";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Icon from "react-native-vector-icons/FontAwesome";
import {
  collection,
  doc,
  setDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  arrayUnion,
  where,
  or,
} from "firebase/firestore";
import { db } from "../database/config";

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

const HomeScreenLoggedIn = ({ navigation }) => {
  const [event, setEvent] = useState([]);
  const [eventName, setEventName] = useState("");
  const [category, setCategory] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventStartTime, setEventStartTime] = useState("");
  const [eventEndTime, setEventEndTime] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [eventPic, setEventPic] = useState(".");
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []); // Run once on component mount

  const fetchData = async () => {
    // Set isRefreshing to true when starting to fetch data
    setIsRefreshing(true);

    try {
      // Fetch data from your data source (Firebase, API, etc.)
      const querySnapshot = await getDocs(collection(db, "Events"));
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
        });
      });

      // Set the new data and set isRefreshing to false when data is fetched
      setEvent(events);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    // Pull-down refresh triggers fetchData function
    fetchData();
  };

  useEffect(() => {
    // Fetch data when the component is mounted
    const fetchData = async () => {
      const querySnapshot = await getDocs(collection(db, "Events"));
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
          username,
          imageUrl,
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
          username,
          imageUrl,
        });
      });
      setEvent(events);
    };

    fetchData(); // Call the async function inside useEffect

    return () => {};
  }, []); // The empty dependency array ensures the effect runs once after the initial render

  //when user clicks log in
  const handleLoginPress = () => {
    navigation.navigate("LoginScreen");
  };

  return (
    <View style={styles.container}>
      <View style={styles.appHead}>
        <Text style={styles.titleText}>EventFinder</Text>
        <View style={styles.searchContainer}>
          <TextInput placeholder="Search..." style={styles.searchBar} />
          <TouchableOpacity
            onPress={handleLoginPress}
            style={styles.logInButton}
          >
            <Text style={styles.logInButtonText}>Filter</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.flatListContainer}>
        <FlatList
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
            />
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
    backgroundColor: "#fff", // Set background color
    marginTop: StatusBar.currentHeight || 40,
  },
  appHead: {
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd", // Add a subtle border
    backgroundColor: "#3498db", // Update header background color
  },
  line: {
    width: "100%",
    height: 1,
    backgroundColor: "#ddd", // Update line color
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
  buttonContainer: {
    flexDirection: "column",
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

export default HomeScreenLoggedIn;
