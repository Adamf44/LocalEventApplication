import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  StatusBar,
  RefreshControl,
  Alert,
  TextInput,
} from "react-native";
import {
  getDocs,
  query,
  collection,
  where,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../database/config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/FontAwesome";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

const EventBookmarks = ({ navigation, route }) => {
  const [userEmail, setUserEmail] = useState("");
  const [eventName, setEventName] = useState("");
  const [category, setCategory] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventStartTime, setEventStartTime] = useState("");
  const [eventEndTime, setEventEndTime] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [eventPic, setEventPic] = useState(".");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [bookmarkedEvents, setBookmarkedEvents] = useState([]);

  //use effect to get auth status
  useEffect(() => {
    fetchBookmarkedEvents();
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      if (user) {
        console.log("User is authenticated on home screen.");
      }
    });

    return () => unsubscribe();
  }, [setIsAuthenticated]);

  ///////////

  //function to get Event data
  const fetchBookmarkedEvents = () => {
    setIsRefreshing(true);
    AsyncStorage.getItem("userEmail")
      .then((userEmail) => {
        setUserEmail(userEmail);
        return getDocs(
          query(
            collection(db, "Events"),
            where("bookmarkedBy", "array-contains", userEmail)
          )
        );
      })
      .then((querySnapshot) => {
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
            eventCounty,
            eventVillage,
            communityName,
            username,
            imageUrl,
            bookmarkedBy,
            attendees,
          } = doc.data();
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
              eventCounty,
              eventVillage,
              username,
              imageUrl,
              bookmarkedBy,
              attendees,
            });
          }
        });
        setBookmarkedEvents(events);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      })
      .finally(() => {
        setIsRefreshing(false);
      });
  };
  ///////////

  //show more
  const handleShowMorePress = (eventName) => {
    console.log("handleShowMorePress called with eventName:", eventName);
    navigation.navigate("ShowMoreScreen", { eventName, isAuthenticated });
  };
  const handleGoBack = () => {
    navigation.navigate("ProfileScreen");
  };

  const handleRefresh = () => {
    fetchBookmarkedEvents();
  };

  const handleRemoveBookmark = (userEmail, eventName) => {
    console.log("Removing bookmark for " + eventName);
    const eventRef = doc(db, "Events", eventName);

    getDoc(eventRef)
      .then((eventDoc) => {
        if (eventDoc.exists()) {
          const { bookmarkedBy } = eventDoc.data() || [];

          // Filter out the userEmail from the bookmarkedBy array
          const updatedBookmarkedBy = bookmarkedBy.filter(
            (email) => email !== userEmail
          );

          // Update bookmarkedBy array in Firestore
          updateDoc(eventRef, { bookmarkedBy: updatedBookmarkedBy })
            .then(() => {
              Alert.alert(
                "Bookmark Removed",
                "This event has been removed from bookmarks."
              );
            })
            .catch((error) => {
              console.error("Error updating bookmarkedBy:", error);
            });
        } else {
          Alert.alert(
            "Event Not Found",
            "The event you are trying to remove from bookmarks does not exist."
          );
        }
      })
      .catch((error) => {
        console.error("Error removing bookmark:", error.message);
      });
  };

  return (
    <View style={styles.container}>
      <View style={styles.appHead}>
        <Text style={styles.titleText}>EventFinder</Text>
        <Text style={styles.appHeadTitle}>Bookmarked Events</Text>
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

      <View style={styles.bookmarkContent}>
        <FlatList
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
            />
          }
          data={bookmarkedEvents}
          keyExtractor={(item) => item.eventName}
          renderItem={({ item }) => (
            <View style={styles.innerContainer}>
              <Icon
                name="bookmark"
                size={30}
                color="#fff"
                style={styles.bookIcon}
              />

              <Text style={styles.eventName}>"{item.eventName}"</Text>

              <View style={styles.butCon}>
                <TouchableOpacity
                  style={styles.showMoreButton}
                  onPress={() => handleShowMorePress(item.eventName)}
                >
                  <Text style={styles.showMoreButtonText}>Show More</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.removeBookmarkButton}
                  onPress={() => handleRemoveBookmark(userEmail, item.id)}
                >
                  <Text style={styles.removeBookmarkButtonText}>Remove</Text>
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
    backgroundColor: "lightgrey",
  },
  appHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    backgroundColor: "#3498db",
    height: "13%",
    marginTop: "0%",
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
  bButton: { padding: 10 },

  bButtonImg: {
    height: 30,
    width: 30,
    opacity: 1,
    tintColor: "#2c3e50",
  },
  bookmarkContent: {
    alignItems: "center",
    padding: 10,
    marginBottom: screenHeight * 0.25,
  },
  butCon: {
    alignItems: "center",
    marginTop: 10,
  },
  line: {
    height: 2,
    backgroundColor: "#3498db",
    marginVertical: 5,
  },
  flatListContainer: {
    flex: 1,
    padding: 16,
  },
  innerContainer: {
    borderWidth: 1,
    backgroundColor: "#f39c12",
    borderColor: "#ddd",
    borderRadius: 30,
    padding: 20,
    marginBottom: 15,
    width: screenWidth * 0.9,
    height: 170,
    alignSelf: "flex-start",
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

  showMoreButton: {
    backgroundColor: "#3498db",
    borderRadius: 8,
    height: 30,
    marginBottom: 10,
    width: "70%",
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
  removeBookmarkButton: {
    backgroundColor: "#e74c3c",
    borderRadius: 8,
    height: 30,
    width: "70%",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  removeBookmarkButtonText: {
    fontSize: 12,
    color: "#fff",
    textAlign: "center",
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
    textAlign: "center",
  },
  bookIcon: {
    alignSelf: "center",
  },
  timeContainer: {
    flexDirection: "row",
  },
  poster: {
    flex: 1,
    padding: 5,
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
  username: {
    fontSize: 11,
    fontStyle: "italic",
    color: "#e74c3c",
    padding: 5,
    marginBottom: 5,
  },
  eventName: {
    fontSize: 20,
    color: "snow",
    fontStyle: "italic",
    textAlign: "center",
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
    color: "snow",
  },
  eventDate: {
    fontSize: 12,
    marginTop: 5,
    fontStyle: "italic",
    color: "snow",
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
  image: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
});

export default EventBookmarks;
