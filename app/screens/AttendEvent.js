import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  StatusBar,
  TouchableOpacity,
} from "react-native";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  getDocs,
  query,
  collection,
  where,
  updateDoc,
} from "firebase/firestore";
import { db } from "../database/config";

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

const AttendEvent = ({ navigation, route }) => {
  const [user, setUser] = useState(null);
  const { userEmail, eventName, isAuthenticated } = route.params || {};

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);

      if (user && isAuthenticated && eventName) {
        sendUserEmailToEvent(user.email);
      }
    });

    return () => unsubscribe();
  }, [userEmail, eventName, isAuthenticated]);

  const sendUserEmailToEvent = async (email) => {
    try {
      const eventRef = collection(db, "Events");
      const eventQuery = query(eventRef, where("eventName", "==", eventName));
      const eventSnapshot = await getDocs(eventQuery);

      if (eventSnapshot.docs.length > 0) {
        const eventDoc = eventSnapshot.docs[0];
        const attendeesArray = eventDoc.data().attendees || [];
        attendeesArray.push(email);

        await updateDoc(eventDoc.ref, { attendees: attendeesArray });

        console.log("User's email added to the event successfully!");
      } else {
        console.log("Event not found with the specified name:", eventName);
      }
    } catch (error) {
      console.error("Error sending user email to event:", error);
    }
  };

  const handleGoBack = () => {
    navigation.navigate("HomeScreen"); // Replace "ScreenName" with the actual screen name you want to navigate to
  };

  return (
    <View style={styles.container}>
      <View style={styles.appHead}>
        <Text style={styles.titleText}>EventFinder</Text>
        <Text style={styles.screenText}>Registration confirmation</Text>
      </View>
      <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
        <Text style={styles.backButtonText}>{"< Back"}</Text>
      </TouchableOpacity>

      {user ? (
        <Text style={styles.thankYouMessage}>
          Thank you, <Text style={styles.eventName}>{user.email}</Text>, you are
          now registered to attend the event,{" "}
          <Text style={styles.eventName}>{eventName}</Text>
        </Text>
      ) : (
        <Text>No user logged in</Text>
      )}
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd", // Add a subtle border
    backgroundColor: "#3498db", // Update header background color
  },
  backButton: {
    marginBottom: 16,
    padding: 20,
  },
  backButtonText: {
    fontSize: 16,
    color: "#3498db",
  },
  titleText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff", // Set text color to white
  },
  screenText: {
    fontSize: 18,
    color: "#fff", // Set text color to white
  },
  thankYouMessage: {
    marginTop: StatusBar.currentHeight || 100,
    fontSize: 25,
    color: "#333", // Dark gray text color
    textAlign: "center",
    paddingHorizontal: 20,
  },
  eventName: {
    fontWeight: "bold",
    fontSize: 25,
    color: "#3498db", // Dark gray text color
    textAlign: "center",
    paddingHorizontal: 20,
  },
});

export default AttendEvent;
