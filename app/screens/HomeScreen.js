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
import { useFocusEffect } from "@react-navigation/native";

import LoginScreen from "./LoginScreen";
import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import firebase from "firebase/app";
import "firebase/database";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Icon from "react-native-vector-icons/FontAwesome";
import {
  collection,
  doc,
  setDoc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  query,
  arrayUnion,
  where,
  or,
} from "firebase/firestore";
import { db } from "../database/config";
import { useRoute } from "@react-navigation/native";

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

const HomeScreen = ({ navigation, route }) => {
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
  const { userEmail, setUserEmail } = route.params || {};
  const { isAuthenticated = false } = route.params || {};

  console.log("we areeee" + isAuthenticated);

  useEffect(() => {
    fetchData();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      // Check the authentication status here and perform the necessary actions
      if (isAuthenticated === undefined || isAuthenticated === false) {
        // User is not authenticated, handle the logic (e.g., show login button)
        // ...
      }
    }, [isAuthenticated])
  );

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
          communityName, // Add communityName to destructure
        } = doc.data();

        // Check if the event has a communityName attribute
        if (!communityName) {
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
        }
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
  const handleBookmark = async (eventName) => {
    try {
      const eventRef = doc(db, "Events", eventName);
      const eventDoc = await getDoc(eventRef);

      if (eventDoc.exists()) {
        let { bookmarkedBy } = eventDoc.data();

        // Ensure bookmarkedBy is initialized as an empty array if it doesn't exist
        if (!bookmarkedBy) {
          bookmarkedBy = [];
        }

        // Check if userEmail is already in the bookmarkedBy array
        if (!bookmarkedBy.includes(userEmail)) {
          // If not, update the document with userEmail added to bookmarkedBy
          await updateDoc(eventRef, {
            bookmarkedBy: arrayUnion(userEmail),
          });

          Alert.alert("Event Bookmarked", "This event has been bookmarked.");
        } else {
          Alert.alert(
            "Already Bookmarked",
            "You have already bookmarked this event."
          );
        }
      } else {
        Alert.alert(
          "Event Not Found",
          "The event you are trying to bookmark does not exist."
        );
      }
    } catch (error) {
      console.error("Error bookmarking event:", error.message);
    }
  };

  const handleShowMorePress = (eventName) => {
    console.log("handleShowMorePress called with eventName:", eventName);
    navigation.navigate("ShowMoreScreen", { eventName });
  };

  const handleAttend = (userEmail, eventName) => {
    const eventRef = collection(db, "Events");
    const eventQuery = query(eventRef, where("eventName", "==", eventName));

    getDocs(eventQuery)
      .then((querySnapshot) => {
        if (querySnapshot.docs.length > 0) {
          const eventDoc = querySnapshot.docs[0];
          const attendeesArray = eventDoc.data().attendees || [];

          if (!attendeesArray.includes(userEmail)) {
            // User's email is not in the attendees array, navigate to AttendEvent
            navigation.navigate("AttendEvent", {
              userEmail,
              eventName,
              isAuthenticated,
            });
          } else {
            // User's email is already in the attendees array, show a message
            Alert.alert(
              "Already Registered",
              "You have already registered for this event."
            );
          }
        }
      })
      .catch((error) => {
        console.error("Error checking attendees:", error);
      });
  };

  const handleComment = (eventName) => {
    navigation.navigate("CommentSection", {
      eventName,
      isAuthenticated,
    });
  };

  //when user clicks log in

  return (
    <View style={styles.container}>
      <View style={styles.appHead}>
        <Text style={styles.titleText}>EventFinder</Text>
        <View style={styles.searchContainer}>
          <TextInput placeholder="Search..." style={styles.searchBar} />
          {isAuthenticated ? null : (
            <TouchableOpacity
              onPress={handleLoginPress}
              style={styles.logInButton}
            >
              <Text style={styles.logInButtonText}>Log in</Text>
            </TouchableOpacity>
          )}
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
              <View style={styles.eventCardHead}>
                <Text style={styles.eventName}>"{item.eventName}"</Text>

                <TouchableOpacity
                  style={styles.bookButton}
                  onPress={() => handleBookmark(item.eventName)}
                >
                  <Icon
                    name="bookmark"
                    size={20}
                    color="#fff"
                    style={styles.bookIcon}
                  />
                </TouchableOpacity>
              </View>
              {item.imageUrl && (
                <Image source={{ uri: item.imageUrl }} style={styles.image} />
              )}
              <Text style={styles.eventLocation}>{item.eventLocation}</Text>
              <Text style={styles.eventDate}>{item.eventDate}</Text>
              <Text style={styles.eventDescription}>
                {item.eventDescription}
              </Text>
              <View style={styles.timeContainer}>
                <Text style={styles.eventStartTime}>
                  Start: {item.eventStartTime}
                </Text>
                <Text style={styles.eventEndTime}>
                  End: {item.eventEndTime}
                </Text>
              </View>
              <View style={styles.poster}>
                <Text style={styles.postedTitle}>Posted by:</Text>
                <Text style={styles.username}>{item.username}</Text>
              </View>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.showMoreButton}
                  onPress={() => handleShowMorePress(item.eventName)}
                >
                  <Text style={styles.showMoreButtonText}>Show More</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.registerDetailsButton}
                  onPress={() => handleAttend(userEmail, item.eventName)}
                >
                  <Text style={styles.registerDetailsButtonText}>
                    Attend event
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.commentButton}
                  onPress={() => handleComment(item.eventName)}
                >
                  <Icon
                    name="comment"
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd", // Add a subtle border
    backgroundColor: "#3498db", // Update header background color
  },
  line: {
    height: 2, // Adjust the thickness of the line
    backgroundColor: "#3498db", // Match the background color or choose a different color
    marginVertical: 5, // Add vertical spacing
  },
  flatListContainer: {
    flex: 1,
    padding: 16,
  },
  innerContainer: {
    borderWidth: 1,
    backgroundColor: "#FFFFFF",
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    width: screenWidth * 0.9,
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  eventCardHead: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: "column",
  },

  trendText: {
    color: "#e74c3c",
    padding: 16,
    fontSize: 15,
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
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
    width: screenWidth * 0.3,
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
    backgroundColor: "#e74c3c", // Choose a color for the Comments button
    borderRadius: 8,
    height: 30,
    justifyContent: "center",
    width: "70%",
    alignSelf: "flex-start",
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
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
  bookButton: {
    backgroundColor: "#f39c12",
    opacity: 0.95,
    borderRadius: 8,
    height: 30,
    width: "18%",
    justifyContent: "center",
    alignSelf: "flex-end",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  bookButtonText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  bookIcon: {
    alignSelf: "center",
  },
  showMoreButton: {
    backgroundColor: "#3498db",
    borderRadius: 8,
    height: 30,
    width: "70%",
    alignSelf: "flex-start",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  showMoreButtonText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },

  postedTitle: {
    fontSize: 15,
    color: "#7f8c8d",
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  poster: {
    flex: 1,
    padding: 5,
  },
  username: {
    fontSize: 11,
    fontStyle: "italic",
    color: "#e74c3c",
    padding: 5,
    marginBottom: 5,
  },
  eventName: {
    fontSize: 25,
    fontWeight: "bold",
    color: "black",
    fontStyle: "italic",
  },
  eventDescription: {
    marginTop: 5,
    fontSize: 14,
    color: "#7f8c8d",
    marginBottom: 12,
  },
  eventLocation: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#3498db",
  },
  eventDate: {
    fontSize: 12,
    marginTop: 5,
    fontStyle: "italic",
    fontWeight: "bold",
    color: "#3498db",
  },

  eventStartTime: {
    fontSize: 10,
    color: "white",
    backgroundColor: "#3498db",
    padding: 5,
    width: "25%",
  },
  eventEndTime: {
    marginTop: 5,
    fontSize: 10,
    color: "white",
    backgroundColor: "#e74c3c",
    padding: 5,
    width: "25%",
  },
});

export default HomeScreen;
