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

//Globals
const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

/////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////
////////////////////////////              Logic         /////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////

const HomeScreen = ({ navigation, route }) => {
  //variables
  const [event, setEvent] = useState([]);
  const [userLocation, setUserLocation] = useState("");
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
  const [userEmail, setUserEmail] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredEvents, setFilteredEvent] = useState(event); // Initialize with event
  const [eventAmount, setEventAmount] = useState("");

  //use effect to get auth status
  useEffect(() => {
    fetchData();
    fetchUserLocation();
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      if (user) {
        console.log("User is authenticated on home screen.");
      }
    });

    return () => unsubscribe();
  }, [setIsAuthenticated]);

  const filterEvents = (query) => {
    const filteredEvents = event.filter((item) =>
      item.eventName.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredEvent(filteredEvents);
  };

  const fetchUserLocation = async () => {
    try {
      //where user email is set
      const userEmail = await AsyncStorage.getItem("userEmail");
      setUserEmail(userEmail);
      const userSnapshot = await getDocs(
        query(collection(db, "Users"), where("email", "==", userEmail))
      );
      if (!userSnapshot.empty) {
        const userData = userSnapshot.docs[0].data();
        const userLocation = userData.county; // Assuming eventLocation is the attribute name
        setUserLocation(userLocation);
        console.log("heyyyyyyyyyyyyy this is county" + userLocation);
        return userLocation;
      } else {
        console.error("User not found");
        return null;
      }
    } catch (error) {
      console.error("Error fetching user location:", error);
      return null;
    }
  };

  const toggleEvents = () => {
    if (filteredEvents === event || filteredEvents.length === 0) {
      // User is currently viewing events from their county or all events, switch to events in their county
      const eventsInUserCounty = event.filter(
        (item) => item.eventCounty === userLocation
      );
      setEventAmount(eventsInUserCounty.length);
      setFilteredEvent(eventsInUserCounty);
    } else {
      // User is currently viewing events in their county, switch to all events
      setFilteredEvent(event);
      setEventAmount(event.length);
    }
  };

  // Function to filter events based on userLocation
  const filterEventsByLocation = () => {
    if (!userLocation) return event; // Return all events if user location is not available
    return event.filter((item) => item.eventLocation === userLocation);
  };

  // Function to handle changes in the search input
  const handleSearch = (query) => {
    setSearchQuery(query);
    filterEvents(query); // Step 2: Call function to filter events
  };

  //function to get Event data
  const fetchData = async () => {
    setIsRefreshing(true);
    try {
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
          eventCounty,
          eventVillage,
          communityName,
          username,
          imageUrl,
          bookmarkedBy,
          attendees,
        } = doc.data();
        //if '!communityName' to check it is not a community event(As they are private to a user and who they invite)
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

      setEvent(events);
      setEventAmount(events.length);
      setFilteredEvent(events); // Update filteredEvents state
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  //handler events below
  const handleRefresh = () => {
    fetchData();
  };
  // not in use but could be
  const handleLoginPress = () => {
    navigation.navigate("LoginScreen");
  };

  const handleBookmark = (userEmail, eventName) => {
    console.log("thththt" + eventName);
    const eventRef = doc(db, "Events", eventName);

    getDoc(eventRef)
      .then((eventDoc) => {
        if (eventDoc.exists()) {
          let { bookmarkedBy } = eventDoc.data();

          if (!bookmarkedBy) {
            bookmarkedBy = [];
          }

          if (!bookmarkedBy.includes(userEmail)) {
            // Add userEmail to bookmarkedBy array
            bookmarkedBy.push(userEmail);
            // Update bookmarkedBy array in Firestore
            updateDoc(eventRef, { bookmarkedBy: bookmarkedBy })
              .then(() => {
                Alert.alert(
                  "Event Bookmarked",
                  "This event has been bookmarked."
                );
              })
              .catch((error) => {
                console.error("Error updating bookmarkedBy:", error);
              });
          } else {
            Alert.alert("Already Bookmarked", "Already bookmarked this event.");
          }
        } else {
          Alert.alert(
            "Event Not Found",
            "The event you are trying to bookmark does not exist."
          );
        }
      })
      .catch((error) => {
        console.error("Error bookmarking event:", error.message);
      });
  };

  //show more
  const handleShowMorePress = (eventName) => {
    console.log("handleShowMorePress called with eventName:", eventName);
    navigation.navigate("ShowMoreScreen", { eventName, isAuthenticated });
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
            // Add user to attendees array
            const updatedAttendees = [...attendeesArray, userEmail];
            updateDoc(eventDoc.ref, { attendees: updatedAttendees })
              .then(() => {
                Alert.alert(
                  "Registration Successful",
                  "You are now registered to attend the event."
                );
              })
              .catch((error) => {
                console.error("Error updating attendees:", error);
              });
          } else {
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
  // comment event button, go to commentsection
  const handleComment = (eventName, userEmail) => {
    navigation.navigate("CommentSection", {
      eventName,
      userEmail,
      isAuthenticated,
    });
  };

  /////////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////              UI            /////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////

  return (
    <View style={styles.container}>
      <View style={styles.appHead}>
        <Text style={styles.titleText}>EventFinder</Text>
        <View style={styles.searchContainer}>
          <TextInput
            placeholder="Search..."
            style={styles.searchBar}
            onChangeText={handleSearch}
            value={searchQuery}
          />
        </View>
      </View>
      <View style={styles.sortContainer}>
        <TouchableOpacity style={styles.toggleButton} onPress={toggleEvents}>
          <Text style={styles.toggleButtonText}>
            {filteredEvents.length === 1 ? "Show All" : "Sort By Location"}
          </Text>
        </TouchableOpacity>
        <Text style={styles.eventsFoundText}>{eventAmount} Events Found</Text>
      </View>

      <View style={styles.flatListContainer}>
        <FlatList
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
            />
          }
          data={filteredEvents.length ? filteredEvents : event}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.innerContainer}>
              <View style={styles.eventCardHead}>
                <Text style={styles.eventName}>"{item.eventName}"</Text>

                <TouchableOpacity
                  style={styles.bookButton}
                  onPress={() => handleBookmark(userEmail, item.eventName)}
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
              <Text style={styles.eventLocation}>
                C.o. {item.eventCounty}, {item.eventVillage}.
              </Text>
              <Text style={styles.eventLocation}></Text>

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
                  style={styles.attendButton}
                  onPress={() => handleAttend(userEmail, item.eventName)}
                >
                  <Text style={styles.attendButtonText}>Attend event</Text>
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
  ); //end return
}; //end Homescreen function

/////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////
////////////////////////////              Style         /////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////

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

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: "5%",
  },

  image: {
    width: "90%",
    height: 180,
    borderRadius: 8,
    marginBottom: 12,
  },

  searchBar: {
    backgroundColor: "snow",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
    height: "45%",
    width: screenWidth * 0.5,
    borderColor: "#bdc3c7",
    borderWidth: 1,
    fontSize: 15,
    color: "#2c3e50",
  },
  sortContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#e74c3c",
    padding: 10,
  },
  toggleButton: {
    justifyContent: "center",
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "black",
    borderRadius: 10,
    padding: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  toggleButtonText: {
    fontSize: 15,
    color: "#e74c3c",
    alignSelf: "center",
    fontStyle: "italic",
    fontWeight: "bold",
    padding: 5,
  },
  eventsFoundText: {
    fontSize: 18.5,
    color: "snow",
    textAlign: "center",
    fontStyle: "italic",
    padding: 5,
  },
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////// Event style ; //////////////////////////////////////////////////////////////////
  flatListContainer: {
    flex: 1,
    marginBottom: 70,
  },
  innerContainer: {
    marginTop: "5%",
    borderWidth: 2,
    backgroundColor: "snow",
    borderColor: "darkgrey",
    borderRadius: 30,
    padding: 30,
    marginBottom: 10,
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
    fontSize: 22,
    color: "#2c3e50",
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
    color: "#2c3e50",
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
    backgroundColor: "#2c3e50",
    padding: 5,
    width: "25%",
  },
  eventEndTime: {
    marginTop: 5,
    fontSize: 10,
    color: "white",
    backgroundColor: "#2c3e50",
    padding: 5,
    width: "25%",
  },

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////  Buttons style ;    ////////////////////////////////////////////////////////////////////

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
  //event buttons:
  buttonContainer: {
    flexDirection: "column",
  },

  attendButton: {
    backgroundColor: "#e74c3c",
    borderRadius: 8,
    borderColor: "#2c3e50",
    borderWidth: 1,
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
  attendButtonText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  commentButton: {
    backgroundColor: "#2ecc71",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#2c3e50",
    height: 70,
    width: "20%",
    justifyContent: "center",
    alignSelf: "flex-end",
    marginRight: 10,
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
    borderWidth: 1,
    borderColor: "#2c3e50",
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
    borderWidth: 1,
    borderColor: "#2c3e50",
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
});

export default HomeScreen;
