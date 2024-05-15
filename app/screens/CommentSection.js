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
  Platform,
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
import AsyncStorage from "@react-native-async-storage/async-storage";

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

const CommentSection = ({ navigation, route }) => {
  const [event, setEvent] = useState([]);
  const [comments, setComments] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [newComment, setNewComment] = useState("");
  //get event name from route from home
  const eventName = route.params?.eventName;
  const [username, setUser] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  //auth hook initially setup for handling changes but user logs in first now so not neccessary
  //also use async tokens mostly for authentication
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      if (user) {
        console.log("User is authenticated on comment.");
      }
    });

    return () => unsubscribe();
  }, [setIsAuthenticated]);

  //get event and comment data on load
  useEffect(() => {
    console.log("event name:", eventName);
    if (eventName) {
      fetchData();
      fetchCommentData();
    }
  }, [eventName]);

  //function to get Event data
  const fetchData = async () => {
    setIsRefreshing(true);
    try {
      const q = query(
        collection(db, "Events"),
        where("eventName", "==", eventName)
      );
      const querySnapshot = await getDocs(q);

      let events = [];
      querySnapshot.forEach((doc) => {
        const {
          eventName,
          eventDate,
          eventVillage,
          communityName,
          imageUrl,
          organizerSocialMedia,
        } = doc.data();
        //if '!communityName' to check it is not a community event(As they are private to a user and who they invite)
        if (!communityName) {
          events.push({
            id: doc.id,
            eventName,
            eventDate,
            eventVillage,
            communityName,
            imageUrl,
            organizerSocialMedia,
          });
        }
      });

      setEvent(events);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const fetchCommentData = async () => {
    setIsRefreshing(true);
    try {
      //get logged in user
      const userEmail = await AsyncStorage.getItem("userEmail");

      const eventDoc = doc(db, "Events", eventName);
      const eventSnap = await getDoc(eventDoc);
      if (eventSnap.exists()) {
        const commentsData = eventSnap.data().eventComments || [];
        setComments(commentsData);
      }
    } catch (error) {
      console.error("Error comments:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchCommentData();
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      Alert.alert("Error", "Comment cannot be empty");
      return;
    }

    try {
      const userEmail = await AsyncStorage.getItem("userEmail");

      // Retrieve the username associated with the userEmail
      const userSnapshot = await getDocs(
        query(collection(db, "Users"), where("email", "==", userEmail))
      );

      // Check if the user document exists
      if (!userSnapshot.empty) {
        const userData = userSnapshot.docs[0].data();
        const username = userData.username;

        // Add the comment with the retrieved username and timestamp
        const eventRef = doc(db, "Events", eventName);
        await updateDoc(eventRef, {
          eventComments: arrayUnion({
            username: username,
            content: newComment.trim(),
            timestamp: new Date().toISOString(),
          }),
        });

        // Fetch updated comment data
        fetchCommentData();
        setNewComment("");
      } else {
        Alert.alert("User not found", "Cannot add comment without user data");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      Alert.alert("Error", "Failed to add comment");
    }
  };

  const handleLoginPress = () => {
    navigation.navigate("LoginScreen");
  };

  const handleGoBack = () => {
    navigation.navigate("HomeScreen");
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : ""}
        style={{ flex: 1 }}
      >
        <View style={styles.appHead}>
          <Text style={styles.titleText}>EventFinder</Text>
          <Text style={styles.appHeadTitle}>Comment section</Text>
        </View>
        <TouchableOpacity
          style={styles.bButton}
          onPress={() => navigation.goBack()}
        >
          <Image
            style={styles.bButtonImg}
            source={require("../assets/left.png")}
          />
        </TouchableOpacity>

        <View style={styles.eventContainer}>
          <View style={styles.eventInfo}>
            <Text style={styles.eventName}>
              {event.length > 0 && event[0].eventName}
            </Text>
            <View style={styles.eventInfo}>
              <Text style={styles.eventVillage}>
                {event.length > 0 && event[0].eventVillage}
              </Text>
              <Text style={styles.eventDate}>
                Date: {event.length > 0 && event[0].eventDate}
              </Text>
              <Text style={styles.organizerSocialMedia}>
                Poster: {event.length > 0 && event[0].organizerSocialMedia}
              </Text>
              {event.length > 0 && event[0].imageUrl && (
                <Image
                  source={{ uri: event[0].imageUrl }}
                  style={styles.image}
                />
              )}
            </View>
          </View>
        </View>
        <View style={styles.commentFlatListContainer}>
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
              // Start of inner flatlist content
              <View key={index} style={styles.innerCommentContainer}>
                <Text style={styles.commentUsername}>{item.username}: </Text>
                <Text style={styles.content}>{item.content}</Text>
                <Text style={styles.timestamp}>
                  {new Date(item.timestamp).toLocaleString()}
                </Text>
              </View> // End inner 'comment' container
            )}
          />
        </View>
        <View style={styles.butCon}>
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
      </KeyboardAvoidingView>
    </View>
  );
};

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
  image: {
    height: 100,
    width: 250,
  },
  eventHead: {
    backgroundColor: "snow",
  },
  eventContainer: {
    flex: 2,
    backgroundColor: "white",
    margin: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  eventInfo: {
    padding: 5,
    alignItems: "center",
    margin: 5,
  },
  eventName: {
    fontSize: 30,
    color: "black",
    fontStyle: "italic",
    alignSelf: "center",
  },
  eventLocation: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#3498db",
  },
  eventDescription: {
    fontSize: 15,
    color: "#7f8c8d",
  },
  eventDate: {
    fontSize: 15,
    fontStyle: "italic",
    fontWeight: "bold",
    color: "#3498db",
  },
  eventVillage: {
    fontSize: 15,
    fontStyle: "italic",
    fontWeight: "bold",
    color: "#3498db",
  },
  organizerSocialMedia: {
    fontSize: 15,
    fontStyle: "italic",
    fontWeight: "bold",
    color: "#3498db",
    marginBottom: 10,
  },
  bButton: { padding: 10 },

  bButtonImg: {
    height: 30,
    width: 30,
    opacity: 1,
    tintColor: "#2c3e50",
  },
  commentFlatListContainer: {
    flex: 2,
    flexDirection: "column",
    backgroundColor: "lightgrey",
    padding: 5,
    height: "30%",
  },

  innerCommentContainer: {
    padding: 5,
    borderWidth: 1,
    borderColor: "#2c3e50",
    backgroundColor: "snow",
  },
  timestamp: {
    color: "#3498db",
    alignSelf: "flex-end",
    fontSize: 12,
  },

  content: {
    fontSize: 12,
    paddingLeft: 5,
    color: "#2c3e50",
  },
  butCon: {
    flex: 1,
    flexDirection: "row",
    padding: 20,
    backgroundColor: "lightgrey",
    // justifyContent: "space-between",
  },
  commentButton: {
    backgroundColor: "#2ecc71",
    borderRadius: 8,
    height: 35,
    width: "30%",
    justifyContent: "center",
    marginLeft: 5,
    //marginBottom: 50,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  eventCommentInput: {
    height: 40,
    padding: 5,
    backgroundColor: "white",
    width: screenWidth * 0.6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "black",
  },
  commentButtonText: {
    fontSize: 12,
    justifyContent: "center",
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  commentIcon: {
    alignSelf: "center",
  },
  showMoreButton: {
    backgroundColor: "#e74c3c",
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

  text: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333333",
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
    fontWeight: "bold",
    padding: 5,
    fontSize: 12,
    color: "#3498db",
  },
});

export default CommentSection;
