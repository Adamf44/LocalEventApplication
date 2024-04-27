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
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  uploadBytesResumable,
} from "firebase/storage";
import { collection, doc, setDoc } from "firebase/firestore";
import { db } from "../database/config";
import { useFocusEffect } from "@react-navigation/native";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useRoute } from "@react-navigation/native";

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

const CreateCommunityEvent = ({ navigation, route }) => {
  const { comName } = route.params || {};
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
  const [communityName, setCommunityName] = useState("");
  const [eventVillage, setEventVillage] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  //use effect to get auth status
  useEffect(() => {
    setCommunityName(comName);
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      if (user) {
        console.log("User is authenticated on home screen.");
      }
    });

    return () => unsubscribe();
  }, [setIsAuthenticated]);

  async function pickImage() {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0,
    });

    if (!result.cancelled) {
      // Check if assets array exists and has at least one item
      if (result.assets && result.assets.length > 0) {
        // Access the first item
        const selectedAsset = result.assets[0];
        // Assigning response to image user picked
        const response = await fetch(selectedAsset.uri);
        // Convert image to blob to be stored in firebase
        const blob = await response.blob();
        // Gets firebase storage info
        const storage = getStorage();
        // Upload image to firebase
        const storageRef = ref(storage, "event_images/" + eventName);
        uploadBytes(storageRef, blob).then((snapshot) => {
          console.log("Uploaded a blob!");
        });
        // Set event image using the selected asset URI
        setEventImage(selectedAsset.uri);
      }
    }
  }

  const createEvent = async () => {
    try {
      const userEmail = await AsyncStorage.getItem("userEmail");
      setUserEmail(userEmail);
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

      await uploadBytesResumable(storageRef, imageBlob);

      const imageUrl = await getDownloadURL(storageRef);
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
        userEmail,
        communityName,
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
      setUserEmail("");

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

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "heigh"}
    >
      <View style={styles.appHead}>
        <Text style={styles.titleText}>EventFinder</Text>
        <Text style={styles.appHeadTitle}>Create a community Event!</Text>
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

        <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
          <Text style={styles.imagePickerButtonText}>Pick Image</Text>
        </TouchableOpacity>
        {eventImage && (
          <Image
            source={{ uri: eventImage }}
            style={{
              width: 200,
              height: 200,
              marginBottom: 10,
              alignSelf: "center",
            }}
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

  contentContainer: {
    flexGrow: 1,
    justifyContent: "left",
    paddingBottom: 100,
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
  navHomeImg: { height: 30, width: 30, opacity: 1 },
  navButtons: { padding: 10 },

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
    fontSize: 20,
    fontWeight: "bold",
    color: "#2c3e50",
    marginTop: 10,
    marginBottom: 5,
  },
  appHeadTitle: {
    fontSize: 18,
    color: "snow",
    flexDirection: "row",
    alignItems: "center",
    marginTop: "13%",
  },
  title: {
    fontSize: 24,
    color: "#3498db",
    marginBottom: 20,
    fontWeight: "bold",
  },
  input: {
    alignSelf: "center",
    width: "90%",
    height: 35,
    borderWidth: 1,
    borderColor: "black",
    marginBottom: 20,
    paddingHorizontal: 15,
    borderRadius: 5,
    color: "#2c3e50",
    fontSize: 16,
    backgroundColor: "snow",
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

export default CreateCommunityEvent;
