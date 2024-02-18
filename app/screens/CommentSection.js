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
import AsyncStorage from "@react-native-async-storage/async-storage";

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

const CommentSection = ({ navigation, route }) => {
  const [event, setEvent] = useState([]);
  const [comments, setComments] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [newComment, setNewComment] = useState("");
  const eventName = route.params?.eventName;
  const [username, setUser] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState("");

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
  console.log("User is authenticated on comment: " + isAuthenticated);

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
      const querySnapshot = await getDocs(collection(db, "Events"));
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

        // Add the comment with the retrieved username
        const eventRef = doc(db, "Events", eventName);
        await updateDoc(eventRef, {
          eventComments: arrayUnion({
            username: username,
            content: newComment.trim(),
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

      <View style={styles.eventContainer}>
        <TouchableOpacity
          style={styles.bButton}
          onPress={() => navigation.goBack()}
        >
          <Image
            style={styles.bButtonImg}
            source={require("../assets/left.png")}
          />
        </TouchableOpacity>
        <Text style={styles.eventName}>
          {event.length > 0 && event[0].eventName}
        </Text>
        {event.length > 0 && event[0].imageUrl && (
          <Image source={{ uri: event[0].imageUrl }} style={styles.image} />
        )}
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
            //start of inner flatlist content
            <View key={index} style={styles.innerCommentContainer}>
              <Text style={styles.commentUsername}>{item.username}:</Text>

              <Text style={styles.content}>{item.content}</Text>
              <Image
                style={styles.lineImg}
                source={require("../assets/horizontal-rule.png")}
              />
            </View> //end inner 'comment' container
          )}
        />
      </View>
      <TextInput
        style={styles.eventCommentInput}
        placeholder="Leave a comment.."
        value={newComment}
        onChangeText={(text) => setNewComment(text)}
      />
      <TouchableOpacity style={styles.commentButton} onPress={handleAddComment}>
        <Text style={styles.commentButtonText}>Add Comment</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "snow",
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
  eventContainer: {
    flexDirection: "column",
    backgroundColor: "snow",
    width: screenWidth + 20,
    padding: 20,
  },

  bButton: { padding: 10 },

  bButtonImg: {
    height: 30,
    width: 30,
    opacity: 1,
  },
  lineImg: {},
  commentFlatListContainer: {
    flex: 1,
    backgroundColor: "lightgrey",
  },

  innerCommentContainer: {
    margin: 20,
    borderWidth: 1,
    borderColor: "snow",
    backgroundColor: "#3498db",
    alignSelf: "center",
    width: screenWidth * 0.9,
  },

  commentButton: {
    backgroundColor: "#2ecc71",
    borderRadius: 8,
    height: 35,
    width: "40%",
    justifyContent: "center",
    marginBottom: 100,
  },
  content: {
    fontSize: 12,
    paddingLeft: 5,
    fontWeight: "bold",
    color: "#fff",
  },
  commentButtonContainer: {
    backgroundColor: "lightgrey",
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
  titleText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
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
    width: "50%",
    alignSelf: "flex-end",
    height: 80,
    borderRadius: 8,
    marginRight: "5%",
  },
  eventInfo: {
    marginTop: -55,
  },
  eventName: {
    fontSize: 20,
    color: "black",
    fontStyle: "italic",
  },
  eventDescription: {
    fontSize: 10,
    color: "#7f8c8d",
  },
  eventDate: {
    fontSize: 10,
    fontStyle: "italic",
    fontWeight: "bold",
    color: "#3498db",
  },
  text: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333333",
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
    padding: 5,
    fontSize: 10,
    color: "snow",
  },
});

export default CommentSection;
