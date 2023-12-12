import React from "react";
import { View, Text, StyleSheet } from "react-native";

const NotificationScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Notification</Text>
      {/* Add more components and UI elements here */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff", // Background color for the screen
  },
  text: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333333", // Text color
  },
  // Add more styles as needed
});

export default NotificationScreen;
