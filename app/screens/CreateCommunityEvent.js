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
import { useRoute } from "@react-navigation/native";

//nav log
console.log("Create community event page");

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

const CreateCommunityEvent = ({ navigation }) => {
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
  const [communityN, setCommunityN] = useState("");
  const [organizerContact, setOrganizerContact] = useState("");
  const [organizerSocialMedia, setOrganizerSocialMedia] = useState("");
  const [eventComments, setEventComments] = useState([]);

  const route = useRoute();
  const { communityName } = route.params || {};

  useEffect(() => {
    getData();
  }, []);

  async function pickImage() {
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
        console.log("Uploaded an image");
      });
      setEventImage(result.uri);
    }
  }

  const createEvent = async () => {
    setCommunityN(communityName);
    try {
      if (
        !eventName ||
        !eventDescription ||
        !eventDate ||
        !eventStartTime ||
        !eventEndTime ||
        !eventLocation
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
        communityN: communityN.trim(),
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
        communityName,
      };

      await setDoc(doc(db, "Events", eventName), data);

      Alert.alert("Success", "Successfully created an event!", [
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
    <KeyboardAvoidingView style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Text style={styles.title}>Create an Event!</Text>

        <TextInput
          style={styles.nameInput}
          value={eventName}
          onChangeText={(text) => setEventName(text)}
          placeholder="Name of Event"
        />
        <TextInput
          style={styles.descInput}
          value={eventDescription}
          onChangeText={(text) => setEventDescription(text)}
          placeholder="Short description"
          multiline
          numberOfLines={3}
        />

        <View style={styles.inputGroup}>
          <TextInput
            style={styles.input}
            value={eventDate}
            onChangeText={(text) => setEventDate(text)}
            placeholder="Date (DD/MM/YY)"
          />
          <TextInput
            style={styles.input}
            value={eventLocation}
            onChangeText={(text) => setEventLocation(text)}
            placeholder="Location"
          />
        </View>

        <View style={styles.inputGroup}>
          <TextInput
            style={styles.input}
            value={eventStartTime}
            onChangeText={(text) => setEventStartTime(text)}
            placeholder="Starting time"
          />
          <TextInput
            style={styles.input}
            value={eventEndTime}
            onChangeText={(text) => setEventEndTime(text)}
            placeholder="End time"
          />
        </View>

        <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
          <Text style={styles.imagePickerButtonText}>Pick Image</Text>
        </TouchableOpacity>

        {eventImage && (
          <Image source={{ uri: eventImage }} style={styles.eventImage} />
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
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 30,
  },
  nameInput: {
    width: "80%",
    height: 50,
    borderWidth: 3,
    borderColor: "grey",
    paddingHorizontal: 15,
    textAlign: "center",
    borderRadius: 10,
    color: "#2c3e50",
    fontSize: 16,
    marginBottom: 20,
  },
  descInput: {
    width: "80%",
    textAlign: "center",
    height: 50,
    borderWidth: 3,
    borderColor: "grey",
    paddingHorizontal: 15,
    borderRadius: 10,
    color: "#2c3e50",
    fontSize: 16,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    color: "#3498db",
    marginBottom: 20,
    fontWeight: "bold",
  },
  inputGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  input: {
    width: "48%",
    height: 50,
    borderWidth: 1,
    borderColor: "#bdc3c7",
    paddingHorizontal: 15,
    borderWidth: 3,
    borderColor: "grey",
    margin: 1,
    borderRadius: 10,
    color: "#2c3e50",
    fontSize: 16,
    marginBottom: 10,
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
    justifyContent: "center",
  },
  createEventButtonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default CreateCommunityEvent;
