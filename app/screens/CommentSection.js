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

const CommentSection = ({ navigation, route }) => {
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
      const eventSnap = await getDoc(eventDoc);
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

    await updateDoc(eventRef, {
      eventComments: arrayUnion({
        username: username,
        content: newComment.trim(),
      }),
    });

    // Refresh comments after adding a new one
    fetchCommentData();

    setNewComment("");
  };

  const handleLoginPress = () => {
    navigation.navigate("LoginScreen");
  };
  const getData = async () => {
    try {
      const value = await AsyncStorage.getItem("Username");
      const usernameFromAsyncStorage = value.toString();
      if (value !== null) {
        console.log("value is " + usernameFromAsyncStorage);
        setUsername(usernameFromAsyncStorage);
        console.log("username set to:", usernameFromAsyncStorage);
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

      <View style={styles.innerContainer}>
        <Text style={styles.eventName}>
          {event.length > 0 && event[0].eventName}
        </Text>
        {event.length > 0 && event[0].imageUrl && (
          <Image source={{ uri: event[0].imageUrl }} style={styles.image} />
        )}
        <Text style={styles.eventLocation}>
          {event.length > 0 && event[0].eventLocation}
        </Text>
        <Text style={styles.eventDate}>
          Date: {event.length > 0 && event[0].eventDate}
        </Text>
      </View>

      <View style={styles.flatListCommentContainer}>
        <FlatList
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
            />
          }
          data={comments}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => (
            <View key={index} style={styles.commentContainer}>
              <View style={styles.commentHeader}>
                <Text style={styles.commentUsername}>{item.username}:</Text>
              </View>
              <View style={styles.commentContent}>
                <Text>{item.content}</Text>
              </View>
            </View>
          )}
        />

        <View style={styles.commentButtonContainer}>
          <TextInput
            style={styles.eventCommentInput}
            placeholder="Leave a comment.."
            value={newComment}
            onChangeText={(text) => setNewComment(text)}
          />
          <TouchableOpacity
            style={styles.commentButton}
            onPress={handleAddComment}
          >
            <Text style={styles.commentButtonText}>Add Comment</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff", // Background color for the screen
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
  },
  flatListCommentContainer: {
    flex: 1,
  },
  innerContainer: {
    borderWidth: 1,
    backgroundColor: "#fff",
    borderColor: "#ddd",
    borderRadius: 12, // Increase the border radius for a rounded appearance
    padding: 16,
    marginBottom: 10,
    width: screenWidth + 20,
    alignSelf: "center",
  },
  innerCommentContainer: {
    borderWidth: 1,
    backgroundColor: "#fff",
    borderColor: "#ddd",
    borderRadius: 12, // Increase the border radius for a rounded appearance
    padding: 16,
    marginBottom: 10,
    width: screenWidth * 0.9,
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
    height: 35,
    width: "40%",
    justifyContent: "center",
    marginTop: 10,
    marginBottom: 10,
  },
  commentButtonContainer: {
    justifyContent: "space-between",
    alignItems: "center",
  },
  eventCommentInput: {
    height: 50,
    padding: 3,
    width: screenWidth * 0.8,
    borderRadius: 8,
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
  image: {
    width: "50%", // Take the full width of the container
    height: 100, // Set a fixed height or adjust as needed
    borderRadius: 8, // Optional: Add borderRadius for a rounded appearance
    marginBottom: 12, // Optional: Add margin to separate image from other details
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
  eventDate: {
    fontSize: 12,
    marginTop: 5,
    fontStyle: "italic",
    fontWeight: "bold",
    color: "#3498db",
  },
  text: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333333", // Text color
  },
  eventLocation: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#3498db",
  },
  commentTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginTop: 12,
  },
  commentContainer: {
    marginTop: 5,
    padding: 10,
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

export default CommentSection;
