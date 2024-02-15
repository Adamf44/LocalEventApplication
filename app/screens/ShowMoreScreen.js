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
import { getAuth, onAuthStateChanged } from "firebase/auth";

//Globals
const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

/////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////
////////////////////////////              Logic         /////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////

const ShowMoreScreen = ({ navigation, route }) => {
  const [event, setEvent] = useState([]);
  const [comments, setComments] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const eventName = route.params?.eventName;
  const [username, setUsername] = useState("");
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
  console.log("User is authenticated on home: " + isAuthenticated);
  ////end auth

  useEffect(() => {
    console.log("eventName:", eventName);
    if (eventName) {
      fetchData();
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
    });
  }

  const handleRefresh = () => {
    fetchData();
  };
  const handleGoBack = () => {
    navigation.navigate("HomeScreen", { isAuthenticated });
  };

  const handleLoginPress = () => {
    navigation.navigate("LoginScreen");
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
      })
      .catch((error) => {
        console.error("Error checking attendees:", error);
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
          data={event}
          keyExtractor={(item) => item.eventName}
          renderItem={({ item }) => (
            <View style={styles.innerContainer}>
              <TouchableOpacity
                style={styles.navButtons}
                onPress={() => navigation.goBack()}
              >
                <Image
                  style={styles.navHomeImg}
                  source={require("../assets/left.png")}
                />
              </TouchableOpacity>
              {item.imageUrl && (
                <Image
                  source={{ uri: item.imageUrl }}
                  style={styles.eventImage}
                />
              )}
              <Text style={styles.eventName}>{item.eventName}</Text>

              <View style={styles.detailsContainer}>
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

                <Text style={styles.infoBox}>
                  Event status: {item.eventStatus}
                </Text>
                <Text style={styles.infoBox}>
                  Registration status: {item.registrationStatus}
                </Text>
                <Text style={styles.infoBox}>
                  Registration deadline: {item.registrationDeadline}
                </Text>

                <Text style={styles.infoBox}>
                  Attendee count: {item.attendeeCount}
                </Text>

                <Text style={styles.infoBox}>
                  Name of organizer: {item.organizerName}
                </Text>
                <Text style={styles.infoBox}>
                  Contact {item.organizerName}: {item.organizerContact}
                </Text>
                <Text style={styles.infoBox}>
                  Find {item.organizerName} on social media:
                  {item.organizerSocialMedia}
                </Text>

                <Text style={styles.infoBox}>County: {item.eventCounty}</Text>
                <Text style={styles.infoBox}>Village: {item.eventVillage}</Text>
              </View>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.attendButton}
                  onPress={() => handleAttend(userEmail, item.eventName)}
                >
                  <Text style={styles.attendButtonText}>Attend event</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      </View>
    </View>
  );
};

/////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////
////////////////////////////              Style         /////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "lightgrey",
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
  detailsContainer: {
    marginTop: 10,
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: "#3498db",
  },
  line: {
    height: 2,
    backgroundColor: "#3498db",
    marginVertical: 5,
  },
  flatListContainer: {
    flex: 1,
  },
  innerContainer: {
    borderWidth: 1,
    backgroundColor: "lightgrey",
    borderColor: "#ddd",
    padding: 10,
    marginBottom: screenHeight * 0.1,
    width: screenWidth,
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  navButtons: { padding: 10 },
  navHomeImg: { height: 30, width: 30, opacity: 1 },
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
  attendButtonText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
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
  buttonContainer: {
    flexDirection: "column",
  },
  username: {
    fontSize: 12,
    fontStyle: "italic",
    color: "#2c3e50",
    padding: 5,
    marginBottom: 5,
  },
  ////////////////////////////////////////////////////////////
  eventImage: {
    width: "100%",
    height: 120,
    borderRadius: 8,
    marginBottom: 12,
  },
  eventName: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 10,
    fontStyle: "italic",
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
    color: "#2c3e50",
  },
  eventDescription: {
    marginTop: 5,
    fontSize: 14,
    color: "#2c3e50",
    marginBottom: 12,
  },
  timeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    margin: 10,
  },
  eventStartTime: {
    fontSize: 10,
    color: "white",
    backgroundColor: "#3498db",
    padding: 5,
    width: "45%",
    borderRadius: 8,
  },
  eventEndTime: {
    fontSize: 10,
    color: "white",
    backgroundColor: "#e74c3c",
    padding: 5,
    width: "45%",
    borderRadius: 8,
  },
  //////////////////////////////////////////////////////////////
  infoBox: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#2c3e50",
    backgroundColor: "darkgrey",
    padding: 10,
    marginTop: 1,
  },
  /////////////////////////////////////////////////////////////////
});

export default ShowMoreScreen;
