import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  StatusBar,
  Dimensions,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, doc, setDoc } from "firebase/firestore";
import { db } from "../database/config";
import { useFocusEffect } from "@react-navigation/native";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

const CreateEventScreen = ({ navigation, route }) => {
  const [eventName, setEventName] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventStartTime, setEventStartTime] = useState("");
  const [eventEndTime, setEventEndTime] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [eventImage, setEventImage] = useState(null);
  const [username, setUsername] = useState("");
  const [eventStatus, setEventStatus] = useState("Upcoming");
  const [registrationStatus, setRegistrationStatus] = useState("Open");
  const [registrationDeadline, setRegistrationDeadline] = useState("");
  const [eventTags, setEventTags] = useState([]);
  const [attendeeCount, setAttendeeCount] = useState(0);
  const [organizerName, setOrganizerName] = useState("");
  const [organizerContact, setOrganizerContact] = useState("");
  const [organizerSocialMedia, setOrganizerSocialMedia] = useState("");
  const [eventComments, setEventComments] = useState([]);
  const [eventCounty, setEventCounty] = useState("");
  const [eventVillage, setEventVillage] = useState("");

  //  const { isAuthenticated = false } = route.params || {};

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    getData();
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // If user is authenticated, set isAuthenticated to true
      // Otherwise, set it to false
      setIsAuthenticated(!!user);
    });

    // Clean up the subscription when the component unmounts
    return () => unsubscribe();
  }, []); // The empty dependency array ensures that this effect runs only once when the component mounts

  useFocusEffect(
    React.useCallback(() => {
      // Check the authentication status here and perform the necessary actions
      if (!isAuthenticated) {
        // User is not authenticated, handle the logic (e.g., show login button)
        // ...
      }
    }, [isAuthenticated])
  );

  async function pickImage() {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0,
    });

    if (!result.canceled) {
      const response = await fetch(result.uri);
      const blob = await response.blob();
      const storage = getStorage();
      const storageRef = ref(storage, "event_images/" + eventName);
      uploadBytes(storageRef, blob).then((snapshot) => {
        console.log("Uploaded a blob!");
      });
      setEventImage(result.uri);
    }
  }

  const createEvent = async () => {
    try {
      if (!isAuthenticated) {
        Alert.alert(
          "Authentication Required",
          "Please log in to create an event.",
          [{ text: "OK", onPress: () => navigation.navigate("LoginScreen") }]
        );
        return;
      }
      if (
        !eventName ||
        !eventDescription ||
        !eventStartTime ||
        !eventEndTime ||
        !eventLocation ||
        !eventCounty ||
        !eventVillage
      ) {
        Alert.alert("Error", "All fields are required.");
        return;
      }

      const response = await fetch(eventImage);
      const imageBlob = await response.blob();
      const storage = getStorage();
      const storageRef = ref(storage, "event_images/" + eventName);

      await uploadBytes(storageRef, imageBlob);

      const imageUrl = await getDownloadURL(storageRef);
      setUsername(username);
      const data = {
        eventName: eventName.trim(),
        eventDescription: eventDescription.trim(),
        eventDate: eventDate.trim(),
        eventStartTime: eventStartTime.trim(),
        eventEndTime: eventEndTime.trim(),
        eventLocation: eventLocation.trim(),
        username: username.trim(),
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
        eventCounty,
        eventVillage,
      };

      await setDoc(doc(db, "Events", eventName), data);

      setEventName("");
      setEventDescription("");
      setEventDate("");
      setEventStartTime("");
      setEventEndTime("");
      setEventLocation("");
      setEventImage(null);
      setUsername("");
      setEventStatus("Upcoming");
      setRegistrationStatus("Open");
      setRegistrationDeadline("");
      setEventTags([]);
      setAttendeeCount(0);
      setOrganizerName("");
      setOrganizerContact("");
      setOrganizerSocialMedia("");
      setEventComments([]);
      setEventCounty("");
      setEventVillage("");

      Alert.alert("Success", "You have successfully created an event!", [
        {
          text: "OK",
          onPress: () => navigation.navigate("HomeScreen"),
        },
      ]);
    } catch (error) {
      console.error("Error creating document: ", error);
      Alert.alert("Error", "Failed to create event. Please try again later.");
      console.error(error);
    }
  };

  const getData = async () => {
    try {
      const value = await AsyncStorage.getItem("Username");
      var usernameFromAsyncStorage = value.toString();
      if (value !== null) {
        setUsername(usernameFromAsyncStorage);
      }
    } catch (e) {
      // error reading value
    }
  };

  //when user clicks log in
  const handleLoginPress = () => {
    navigation.navigate("LoginScreen");
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.appHead}>
        <Text style={styles.titleText}>EventFinder</Text>
        <Text style={styles.appHeadTitle}>Create Event</Text>
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

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Text style={styles.sectionTitle}>Event Information</Text>
        <TextInput
          value={eventName}
          onChangeText={(text) => setEventName(text)}
          placeholder="Name of Event/Activity"
          style={styles.input}
        />
        <TextInput
          style={styles.input}
          value={eventDescription}
          onChangeText={(text) => setEventDescription(text)}
          placeholder="Short description of event"
          keyboardType="email-address"
          multiline
          numberOfLines={3}
        />

        <Text style={styles.sectionTitle}>Location</Text>
        <TextInput
          style={styles.input}
          value={eventCounty}
          onChangeText={(text) => setEventCounty(text)}
          placeholder="County"
        />
        <TextInput
          style={styles.input}
          value={eventVillage}
          onChangeText={(text) => setEventVillage(text)}
          placeholder="Town/Village"
        />
        <TextInput
          style={styles.input}
          value={eventLocation}
          onChangeText={(text) => setEventLocation(text)}
          placeholder="Address Line 3 (optional)"
        />

        <Text style={styles.sectionTitle}>Event Time</Text>
        <TextInput
          style={styles.input}
          value={eventStartTime}
          onChangeText={(text) => setEventStartTime(text)}
          placeholder="Event/Activity Starting time"
        />
        <TextInput
          style={styles.input}
          value={eventEndTime}
          onChangeText={(text) => setEventEndTime(text)}
          placeholder="Event/Activity End time"
        />
        <Text style={styles.sectionTitle}>Organizer Information</Text>
        <TextInput
          style={styles.input}
          value={organizerName}
          onChangeText={(text) => setOrganizerName(text)}
          placeholder="Organizer Name"
        />
        <TextInput
          style={styles.input}
          value={organizerContact}
          onChangeText={(text) => setOrganizerContact(text)}
          placeholder="Organizer Contact"
          keyboardType="phone-pad"
        />
        <TextInput
          style={styles.input}
          value={organizerSocialMedia}
          onChangeText={(text) => setOrganizerSocialMedia(text)}
          placeholder="Organizer Social Media"
        />
        {/* Add other organizer fields as needed */}

        {/* Tags Section */}
        <Text style={styles.sectionTitle}>Event Tags</Text>
        <TextInput
          style={styles.input}
          value={eventTags.join(", ")}
          onChangeText={(text) => setEventTags(text.split(", "))}
          placeholder="Event Tags (comma-separated)"
        />

        <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
          <Text style={styles.imagePickerButtonText}>Pick Image</Text>
        </TouchableOpacity>
        {eventImage && (
          <Image
            source={{ uri: eventImage }}
            style={{ width: 200, height: 200, marginBottom: 10 }}
          />
        )}

        <TouchableOpacity
          style={styles.createEventButton}
          onPress={createEvent}
        >
          <Text style={styles.createEventButtonText}>Create Event</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: StatusBar.currentHeight || 40,
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
  contentContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingBottom: 40,
  },
  titleText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff", // Set text color to white
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionTitle: {
    alignSelf: "center",
    fontSize: 18,
    fontWeight: "bold",
    color: "#3498db",
    marginTop: 10,
    marginBottom: 5,
  },
  appHeadTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
    marginTop: 10,
    marginBottom: 5,
  },
  title: {
    fontSize: 24,
    color: "#3498db",
    marginBottom: 20,
    fontWeight: "bold",
  },
  input: {
    alignSelf: "center",
    width: "80%",
    height: 40,
    borderWidth: 1,
    borderColor: "#bdc3c7",
    marginBottom: 20,
    paddingHorizontal: 15,
    borderRadius: 10,
    color: "#2c3e50",
    fontSize: 16,
  },
  imagePickerButton: {
    backgroundColor: "#3498db",
    borderRadius: 5,
    width: "80%",
    height: 40,
    marginBottom: 20,
    justifyContent: "center",
    alignSelf: "center",
  },
  imagePickerButtonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
  },
  eventImage: {
    width: "80%",
    height: 200,
    marginBottom: 20,
    borderRadius: 10,
  },
  createEventButton: {
    backgroundColor: "#e74c3c",
    borderRadius: 5,
    width: "80%",
    height: 40,
    marginBottom: 20,
    justifyContent: "center",
    alignSelf: "center",
  },
  createEventButtonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default CreateEventScreen;
