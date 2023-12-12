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

const CreateEventScreen = ({ navigation }) => {
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

  useEffect(() => {
    getData();
  }, []); // The empty dependency array ensures that this effect runs only once when the component mounts

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
      if (
        !eventName ||
        !eventDescription ||
        !eventDate ||
        !eventStartTime ||
        !eventEndTime ||
        !eventLocation ||
        !eventImage
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
      };

      await setDoc(doc(db, "Events", eventName), data);

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

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Text style={styles.title}>Create an Event!</Text>
        <TextInput
          value={eventName}
          onChangeText={(text) => setEventName(text)}
          placeholder="Name of Event/Activity"
          style={styles.input}
        />
        {/* ... (Repeat for other TextInput fields) */}
        <TouchableOpacity style={styles.button} onPress={pickImage}>
          <Text style={styles.buttonText}>Pick Image</Text>
        </TouchableOpacity>

        {eventImage && (
          <Image
            source={{ uri: eventImage }}
            style={{ width: 200, height: 200, marginBottom: 10 }}
          />
        )}

        <Text style={styles.title}>Required fields</Text>
        <TextInput
          style={styles.input}
          value={eventName}
          onChangeText={(text) => setEventName(text)}
          placeholder="Name of Event/Activity"
        />
        <TextInput
          style={styles.input}
          value={eventDescription}
          onChangeText={(text) => setEventDescription(text)}
          placeholder="Short description of event"
          keyboardType="email-address"
          multiline // Added multiline for longer descriptions
          numberOfLines={3} // Adjust the number of lines for multiline
        />
        <TextInput
          style={styles.input}
          value={eventDate}
          onChangeText={(text) => setEventDate(text)}
          placeholder="Date of event in DD/MM/Y"
        />
        <TextInput
          style={styles.input}
          value={eventLocation}
          onChangeText={(text) => setEventLocation(text)}
          placeholder="Event/Activity Location"
        />
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
        <TextInput
          style={styles.input}
          value={eventStatus}
          onChangeText={(text) => setEventStatus(text)}
          placeholder="Event Status"
        />
        <TextInput
          style={styles.input}
          value={registrationStatus}
          onChangeText={(text) => setRegistrationStatus(text)}
          placeholder="Registration Status"
        />
        <TextInput
          style={styles.input}
          value={registrationDeadline}
          onChangeText={(text) => setRegistrationDeadline(text)}
          placeholder="Registration Deadline"
        />
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
          keyboardType="phone-pad" // Adjusted keyboard type for contact
        />
        <TextInput
          style={styles.input}
          value={organizerSocialMedia}
          onChangeText={(text) => setOrganizerSocialMedia(text)}
          placeholder="Organizer Social Media"
        />
        <TextInput
          style={styles.input}
          value={attendeeCount.toString()}
          onChangeText={(text) => setAttendeeCount(parseInt(text, 10))}
          placeholder="Attendee Count"
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          value={eventTags.join(", ")}
          onChangeText={(text) => setEventTags(text.split(", "))}
          placeholder="Event Tags (comma-separated)"
        />

        <TouchableOpacity style={styles.button} onPress={createEvent}>
          <Text style={styles.buttonText}>Create Event</Text>
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
  contentContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    color: "#3498db",
    marginBottom: 20,
    fontWeight: "bold",
  },
  input: {
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
  },
  createEventButtonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default CreateEventScreen;
