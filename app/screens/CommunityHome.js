import React from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
import { useNavigation } from "@react-navigation/native";
import { useRoute } from "@react-navigation/native";

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

const CommunityHome = ({ navigation, route }) => {
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
  const [userEmail, setUserEmail] = useState("");
  const { comName } = route.params || {};
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  //use effect to get auth status
  useEffect(() => {
    fetchData();
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      if (user) {
        console.log("User is authenticated on profile screen.");
      }
    });

    return () => unsubscribe();
  }, [setIsAuthenticated]);

  const fetchData = async () => {
    try {
      const value = await AsyncStorage.getItem("userEmail");
      setUserEmail(value);
      if (value !== null) {
        setUserEmail(value);
        console.log("thisisir" + comName);
        getDocs(
          query(
            collection(db, "Events"),
            where("communityMembers", "==", userEmail)
          )
        ).then((docSnap) => {
          let events = [];
          docSnap.forEach((doc) => {
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
              eventVillage,
              eventCounty,
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
              eventVillage,
              eventCounty,
            });
            // setUsername(username);
          });

          setEvent(events);
        });
      } else {
        console.log("User email not found in AsyncStorage");
      }
    } catch (error) {
      console.error("Error fetching user about information: ", error.message);
    }
  };

  const handleRefresh = () => {
    fetchData();
  };

  const handleAddEvent = () => {
    navigation.navigate("CreateCommunityEvent");
  };

  const handleLoginPress = () => {
    navigation.navigate("LoginScreen");
  };

  const handleShowMorePress = (eventName) => {
    console.log("handleShowMorePress called with eventName:", eventName);
    navigation.navigate("ShowMoreScreen", { eventName });
  };

  const handleAttend = async (userEmail, eventName) => {
    try {
      const eventRef = collection(db, "Events");
      const eventQuery = query(eventRef, where("eventName", "==", eventName));
      const querySnapshot = await getDocs(eventQuery);
      if (querySnapshot.docs.length > 0) {
        const eventDoc = querySnapshot.docs[0];
        const attendeesArray = eventDoc.data().attendees || [];

        if (!attendeesArray.includes(userEmail)) {
          navigation.navigate("AttendEvent", {
            userEmail,
            eventName,
            isAuthenticated,
          });
        } else {
          Alert.alert(
            "Already Registered",
            "You have already registered for this event."
          );
        }
      }
    } catch (error) {
      console.error("Error checking attendees:", error);
    }
  };

  const handleComment = (eventName) => {
    navigation.navigate("CommentSection", {
      eventName,
      isAuthenticated,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.appHead}>
        <Text style={styles.titleText}>Community</Text>

        <TouchableOpacity
          style={styles.addEventButton}
          onPress={handleAddEvent}
        >
          <Text style={styles.addEventButtonText}>Add Event</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.navButtons}
        onPress={() => navigation.goBack()}
      >
        <Image
          style={styles.navHomeImg}
          source={require("../assets/left.png")}
        />
      </TouchableOpacity>
      <View style={styles.flatListContainer}>
        <FlatList
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
            />
          }
          data={event} // Step 3: Use filtered events as data source
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
  addEventButton: {
    backgroundColor: "#e74c3c",
    justifyContent: "center",
    borderRadius: 8,
    padding: 5,
    width: "40%",
    height: "40%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    marginTop: "10%",
  },
  addEventButtonText: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  appHeadTitle: {
    fontSize: 18,
    color: "snow",
    flexDirection: "row",
    alignItems: "center",
    marginTop: "13%",
  },
  navHomeImg: { height: 30, width: 30, opacity: 1 },
  navButtons: { padding: 10 },
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
    paddingHorizontal: 20,
    borderRadius: 8,
    height: "45%",
    width: screenWidth * 0.5,
    borderColor: "#bdc3c7",
    borderWidth: 1,
    fontSize: 15,
    color: "#2c3e50",
  },
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////// Event style ; //////////////////////////////////////////////////////////////////
  flatListContainer: {
    flex: 1,
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
export default CommunityHome;
