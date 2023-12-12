import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  Dimensions,
  FlatList,
  StatusBar,
  RefreshControl,
  Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import firebase from "firebase/app";
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
import { db } from "../database/config";
import { useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const screenWidth = Dimensions.get("window").width;

// ... Import necessary modules ...
const ShowMoreScreen = ({ navigation, route }) => {
  const [event, setEvent] = useState([]);
  const [comments, setComments] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [newComment, setNewComment] = useState("");
  const { isAuthenticated } = route.params || { isAuthenticated: false };
  const eventName = route.params?.eventName;
  const [username, setUsername] = useState("");

  useEffect(() => {
    getData();
    console.log("eventName:", eventName);
    if (eventName) {
      fetchData();
      fetchCommentData();
    }
  }, [eventName]);
  function fetchData() {
    setIsRefreshing(true);
    getDocs(
      query(collection(db, "Events"), where("eventName", "==", eventName))
    ).then((docSnap) => {
      let info = [];
      docSnap.forEach((doc) => {
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
          eventStatus,
          registrationStatus,
          registrationDeadline,
          eventTags,
          attendeeCount,
          organizerName,
          organizerContact,
          organizerSocialMedia,
          eventComments,
        } = doc.data();

        info.push({
          ...doc.data(),
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
          eventStatus,
          registrationStatus,
          registrationDeadline,
          eventTags,
          attendeeCount,
          organizerName,
          organizerContact,
          organizerSocialMedia,
          eventComments,
        });
      });

      setEvent(info);
      getData();
    });
  }

  const fetchCommentData = async () => {
    setIsRefreshing(true);
    try {
      const eventDoc = doc(db, "Events", eventName);
      const eventSnap = await getDoc(eventDoc); // Use get instead of getDocs
      if (eventSnap.exists()) {
        const commentsData = eventSnap.data().eventComments || [];
        setComments(commentsData);
      }
    } catch (error) {
      console.error("Error fetching comment data:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchData();
    fetchCommentData();
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      Alert.alert("Error", "Comment cannot be empty");
      return;
    }

    const eventRef = doc(db, "Events", eventName);
    console.log("Adding comment with username:", username);

    await updateDoc(eventRef, {
      eventComments: arrayUnion({
        username: username, // Make sure username is defined
        content: newComment.trim(),
        // timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      }),
    });

    // Refresh comments after adding a new one
    fetchCommentData();

    setNewComment("");
  };

  // ... The rest of your code ...

  const handleLoginPress = () => {
    navigation.navigate("LoginScreen");
  };
  const getData = async () => {
    try {
      const value = await AsyncStorage.getItem("Username");
      const usernameFromAsyncStorage = value.toString();
      if (value !== null) {
        // value previously stored
        console.log("value is " + usernameFromAsyncStorage);
        setUsername(usernameFromAsyncStorage); // Corrected this line
        console.log("username set to:", usernameFromAsyncStorage); // Changed from 'username' to 'usernameFromAsyncStorage'
      }
    } catch (e) {
      // error reading value
    }
  };
  return (
    <View style={styles.container}>
      <View style={styles.appHead}>
        <Text style={styles.titleText}>EventFinder</Text>
        <View style={styles.searchContainer}>
          <TextInput placeholder="Search..." style={styles.searchBar} />
          {!isAuthenticated && (
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
              <Text style={styles.eventName}>{item.eventName}</Text>
              {item.imageUrl && (
                <Image source={{ uri: item.imageUrl }} style={styles.image} />
              )}

              <Text style={styles.eventLocation}>{item.eventLocation}</Text>
              <Text style={styles.eventDate}>Date: {item.eventDate}</Text>
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
              <Text style={styles.eventStatus}>
                Event status: {item.eventStatus}
              </Text>
              <Text style={styles.regStatus}>
                Registration status: {item.registrationStatus}
              </Text>
              <Text style={styles.regDeadline}>
                Registration deadline: {item.registrationDeadline}
              </Text>

              <Text style={styles.attendeeCount}>
                Attendee count: {item.attendeeCount}
              </Text>

              <View style={styles.organiserContainer}>
                <Text style={styles.organizerName}>
                  Name of organiser: {item.organizerName}
                </Text>
                <Text style={styles.organizerContact}>
                  Contact {item.organizerName}: {item.organizerContact}
                </Text>
                <Text style={styles.organizerSocialMedia}>
                  Find {item.organizerName} on social media:
                  {item.organizerSocialMedia}
                </Text>
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
    backgroundColor: "#fff",
    borderColor: "#ddd",
    borderRadius: 12, // Increase the border radius for a rounded appearance
    padding: 16,
    marginBottom: 10,
    width: screenWidth,
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  commentButton: {
    backgroundColor: "#2ecc71",
    borderRadius: 8,
    height: 30,
    width: "40%",
    justifyContent: "center",
    marginRight: 10, // Add margin to separate buttons
    marginTop: 10,
  },
  commentButtonContainer: {
    justifyContent: "space-between",
    alignItems: "center",
  },
  eventCommentInput: {
    height: 50,
    borderRadius: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    marginTop: 10,
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
    fontSize: 25,
    fontWeight: "bold",
    color: "black",
    marginBottom: 10,
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
  eventTime: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#333",
  },

  organiserContainer: {
    backgroundColor: "red",
  },

  commentTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginTop: 12,
  },
  commentContainer: {
    marginTop: 5,
    //borderWidth: 1,
    //borderColor: "#ddd",
    //borderRadius: 5,
    padding: 5,
  },
  commentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  commentUsername: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#3498db",
    marginRight: 8,
  },
  commentContent: {
    fontSize: 10,
    color: "#555",
  },
});

export default ShowMoreScreen;
