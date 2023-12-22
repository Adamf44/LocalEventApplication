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
import { getDocs, query, collection, where } from "firebase/firestore";
import { db } from "../database/config";
import Icon from "react-native-vector-icons/FontAwesome";

const screenWidth = Dimensions.get("window").width;

const EventBookmarks = ({ navigation, route }) => {
  const { currentUserEmail } = route.params || {};
  const [bookmarkedEvents, setBookmarkedEvents] = useState([]);

  useEffect(() => {
    const fetchBookmarkedEvents = async () => {
      try {
        const querySnapshot = await getDocs(
          query(
            collection(db, "Events"),
            where("bookmarkedBy", "array-contains", currentUserEmail)
          )
        );

        if (querySnapshot.docs) {
          const events = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          setBookmarkedEvents(events);
        } else {
          setBookmarkedEvents([]);
        }
      } catch (error) {
        console.error("Error fetching bookmarked events:", error.message);
        Alert.alert("Error", "Failed to fetch bookmarked events.");
      }
    };

    fetchBookmarkedEvents();
  }, [currentUserEmail]);

  const handleShowMorePress = (eventName) => {
    console.log("handleShowMorePress called with eventName:", eventName);
    navigation.navigate("ShowMoreScreen", { eventName });
  };
  const handleGoBack = () => {
    navigation.navigate("ProfileScreen");
  };

  const renderEventItem = ({ item }) => (
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
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.appHead}>
        <Text style={styles.titleText}>EventFinder</Text>
        <Text style={styles.header}>Bookmarked Events</Text>
      </View>

      <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
        <Text style={styles.backButtonText}>{"< Back"}</Text>
      </TouchableOpacity>

      <FlatList
        data={bookmarkedEvents}
        keyExtractor={(item) => item.id}
        renderItem={renderEventItem}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
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
  backButton: {
    marginBottom: 16,
    padding: 20,
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
    padding: 16,
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
  titleText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
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

  showMoreButton: {
    backgroundColor: "#3498db",
    borderRadius: 8,
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
    fontWeight: "bold",
    color: "black",
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
    color: "#3498db",
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
