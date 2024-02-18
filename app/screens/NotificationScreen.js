import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  StatusBar,
  TouchableOpacity,
  Image,
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

const NotificationScreen = () => {
  const [events, setEvents] = useState([]);
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
  console.log("User is authenticated on noti: " + isAuthenticated);

  useEffect(() => {
    const fetchData = async () => {
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
        console.log(eventsData);
        setEvents(eventsData);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    fetchData();

    // Cleanup function
    return () => {};
  }, []);
  const handleLoginPress = () => {
    navigation.navigate("LoginScreen");
  };

  return (
    <View style={styles.container}>
      <View style={styles.appHead}>
        <Text style={styles.titleText}>EventFinder</Text>
        <Text style={styles.appHeadTitle}>Notifications</Text>
        <View style={styles.searchContainer}>
          {isAuthenticated ? null : (
            <TouchableOpacity
              onPress={handleLoginPress}
              style={styles.logInButton}
            >
              <Text style={styles.logInButtonText}>Log in</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      <View style={styles.userNoti}>
        <Text style={styles.userNotiTitle}>Notifications for {userEmail}.</Text>
      </View>

      <FlatList
        data={events}
        renderItem={({ item }) => (
          <View style={styles.holder}>
            <View style={styles.eventContainer}>
              <Text style={styles.fromLabel}>From: </Text>
              <Text style={styles.eventName}>{item.eventName}</Text>
              <Text style={styles.attendees}>
                {item.attendees.join(", & ")} is registered for this event!
              </Text>
            </View>
          </View>
        )}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

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
  titleText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "snow",
  },

  line: {
    height: 2,
    backgroundColor: "#3498db",
    marginVertical: 5,
  },
  lines: {
    height: 20,
    width: 10,
  },
  userNoti: {
    padding: 10,
    alignItems: "center",
  },
  userNotiTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2c3e50",
    marginTop: 10,
    marginBottom: 5,
    textDecorationLine: "underline",
    letterSpacing: 0.3,
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
  sectionTitle: {
    alignSelf: "center",
    fontSize: 20,
    fontWeight: "bold",
    color: "#3498db",
    marginTop: 10,
    marginBottom: 5,
  },
  appHeadTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "snow",
    marginTop: 10,
    marginBottom: 5,
  },
  title: {
    fontSize: 24,
    color: "#3498db",
    marginBottom: 20,
    fontWeight: "bold",
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
  eventContainer: {
    padding: 10,
    borderWidth: 1,
    marginTop: 5,
    width: "90%",
    alignSelf: "center",
    borderBottomColor: "#ddd",
    backgroundColor: "snow",
  },
  eventName: {
    fontSize: 20,
    color: "#e74c3c",
    fontWeight: "bold",
  },
  fromLabel: {},
  attendees: {
    fontSize: 15,
    fontStyle: "italic",
    color: "#2c3e50",
    paddingHorizontal: 10,
    marginTop: 5,
    letterSpacing: 0.2,
  },
});

export default NotificationScreen;
