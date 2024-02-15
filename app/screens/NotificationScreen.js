import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
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

  return (
    <View style={styles.container}>
      <FlatList
        data={events}
        renderItem={({ item }) => (
          <View style={styles.eventContainer}>
            <Text style={styles.eventName}>{item.eventName}</Text>
            <Text style={styles.attendees}>{item.attendees.join(", ")}</Text>
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
    backgroundColor: "#fff",
  },
  eventContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  eventName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  attendees: {
    fontSize: 16,
    marginTop: 5,
  },
});

export default NotificationScreen;
