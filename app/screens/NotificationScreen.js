import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  LinearGradient,
  RefreshControl,
  Dimensions,
} from "react-native";
import {
  collection,
  query,
  onSnapshot,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../database/config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { getAuth, onAuthStateChanged } from "firebase/auth";

//Globals
const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

const NotificationScreen = ({ navigation }) => {
  const [events, setEvents] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  //auth hook initially setup for handling changes but user logs in first now so not neccessary
  //also use async tokens mostly for authentication
  useEffect(() => {
    fetchData();
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      console.log("User navigated to notification screen");
    });

    return () => unsubscribe();
  }, [setIsAuthenticated]);

  //function to get logged in user email active events, then the attendees array on each event
  //Any time theres a new attendee a notification is created
  const fetchData = async () => {
    setIsRefreshing(true);
    try {
      const userEmail = await AsyncStorage.getItem("userEmail");
      setUserEmail(userEmail);
      const eventsQuerySnapshot = await getDocs(
        query(collection(db, "Events"), where("userEmail", "==", userEmail))
      );
      const eventsData = eventsQuerySnapshot.docs.map((doc) => ({
        id: doc.id,
        eventName: doc.data().eventName,
        attendees: doc.data().attendees || [],
      }));
      setEvents(eventsData);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLoginPress = () => {
    navigation.navigate("LoginScreen");
  };

  const handleRefresh = () => {
    fetchData();
  };
  return (
    <View style={styles.container}>
      <View style={styles.appHead}>
        <Text style={styles.titleText}>EventFinder</Text>
        <Text style={styles.appHeadTitle}>Notifications</Text>
      </View>
      <Text style={styles.userNotiTitle}>Notifications for {userEmail}.</Text>
      <View style={styles.notiCon}>
        <FlatList
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
            />
          }
          data={events
            .flatMap((event) =>
              event.attendees.map((attendee) => ({
                eventId: event.id,
                eventName: event.eventName,
                attendee,
              }))
            )
            .reverse()}
          renderItem={({ item }) => (
            <View style={styles.eventContainer}>
              <Text style={styles.eventName}>{item.eventName}</Text>
              <Text style={styles.attendees}>
                <Text style={styles.notiUserText}> {item.attendee}</Text> is
                registered for this event!
              </Text>
            </View>
          )}
          keyExtractor={(item, index) =>
            `${item.eventId}_${item.attendee}_${index}`
          }
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
  navHomeImg: { height: 30, width: 30, opacity: 1 },
  navButtons: { padding: 10 },
  notiCon: {
    margin: 20,
    height: screenHeight,
    borderColor: "darkgrey",
  },
  appHeadTitle: {
    fontSize: 18,
    color: "snow",
    flexDirection: "row",
    alignItems: "center",
    marginTop: "13%",
  },

  userNotiTitle: {
    fontSize: 20,
    fontWeight: "bold",
    fontStyle: "italic",
    color: "#2c3e50",
    textAlign: "center",
    margin: 10,
  },
  logInButton: {
    backgroundColor: "#e74c3c",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: "center",
    elevation: 2,
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
  notiUserText: {
    fontWeight: "bold",
  },
  eventContainer: {
    padding: 10,
    margin: 8,
    borderRadius: 8,
    backgroundColor: "#fff",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  eventName: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#e74c3c",
  },
  attendees: {
    fontSize: 15,
    fontStyle: "italic",
    color: "#2c3e50",
    marginTop: 5,
  },
});

export default NotificationScreen;
