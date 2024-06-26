import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Image,
  Alert,
  FlatList,
  RefreshControl,
} from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import firebase from "firebase/app";
import { useFocusEffect } from "@react-navigation/native";
import { useEffect } from "react/cjs/react.development";

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
  deleteDoc,
  query,
} from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/FontAwesome";
import { db } from "../database/config";
import { useRoute } from "@react-navigation/native";
import { set } from "firebase/database";
import { auth } from "../database/config";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

function UserPostedEventsScreen({ navigation }) {
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
  const [eventAmount, setEventAmount] = useState("");

  //auth hook initially setup for handling changes but user logs in first now so not neccessary
  //also use async tokens mostly for authentication
  useEffect(() => {
    fetchPostedEvents();
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      if (user) {
        console.log("User is authenticated on home screen.");
      }
    });

    return () => unsubscribe();
  }, [setIsAuthenticated]);

  //function to get Event data
  const fetchPostedEvents = () => {
    setIsRefreshing(true);
    AsyncStorage.getItem("userEmail")
      .then((userEmail) => {
        setUserEmail(userEmail);
        return getDocs(
          query(collection(db, "Events"), where("userEmail", "==", userEmail))
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
        setEventAmount(events.length);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      })
      .finally(() => {
        setIsRefreshing(false);
      });
  };
  //delete event function
  const handleDeleteEvent = async (eventID) => {
    Alert.alert("Confirmation", "Are you sure you want to delete this event?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        onPress: async () => {
          try {
            await deleteDoc(doc(db, "Events", eventID));
            // Remove the deleted event from the state
            setBookmarkedEvents((prevEvents) =>
              prevEvents.filter((event) => event.id !== eventID)
            );
            Alert.alert("Success", "Event deleted successfully.");
          } catch (error) {
            console.error("Error deleting event:", error);
            Alert.alert("Error", "Failed to delete event.");
          }
        },
        style: "destructive",
      },
    ]);
  };

  const handleRefresh = () => {
    fetchPostedEvents();
  };
  return (
    <View style={styles.container}>
      <View style={styles.appHead}>
        <Text style={styles.titleText}>EventFinder</Text>
        <Text style={styles.appHeadTitle}>Your Events</Text>
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
      <Text style={styles.comAmount}>Active Events: {eventAmount} </Text>

      <View style={styles.flatListContainer}>
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
              <Text style={styles.eventName}>"{item.eventName}"</Text>
              <Text style={styles.eventLocation}>{item.eventLocation}</Text>
              <Text style={styles.eventDate}>{item.eventDate}</Text>
              <TouchableOpacity
                style={styles.showMoreButton}
                onPress={() => handleShowMorePress(item.eventName)}
              >
                <Text style={styles.showMoreButtonText}>Show More</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteEvent(item.id)}
              >
                <Text style={styles.deleteButtonText}>Delete event</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      </View>
    </View>
  );
}

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

  line: {
    height: 2,
    backgroundColor: "#3498db",
    marginVertical: 5,
  },
  flatListContainer: {
    flex: 1,
    padding: 16,
    marginBottom: "15%",
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

  header: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  eventCardHead: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  comAmount: {
    fontSize: 25,
    color: "#2c3e50",
    fontWeight: "bold",
    padding: 5,
    flexDirection: "row",
    alignSelf: "center",
  },

  showMoreButton: {
    backgroundColor: "#3498db",
    borderRadius: 8,
    margin: 5,
    height: 30,
    width: "70%",
    alignSelf: "center",
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
  deleteButton: {
    backgroundColor: "#e74c3c",
    borderRadius: 8,
    height: 30,
    margin: 5,
    width: "70%",
    alignSelf: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  deleteButtonText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "bold",
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
    fontWeight: "bold",
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
    fontSize: 25,
    color: "black",
    fontStyle: "italic",
    textAlign: "center",
  },
  eventDescription: {
    marginTop: 5,
    fontSize: 14,
    color: "#7f8c8d",
    marginBottom: 12,
    textAlign: "center",
  },
  eventLocation: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#3498db",
    textAlign: "center",
  },
  eventDate: {
    fontSize: 12,
    marginTop: 5,
    fontStyle: "italic",
    fontWeight: "bold",
    color: "#3498db",
    textAlign: "center",
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

export default UserPostedEventsScreen;
