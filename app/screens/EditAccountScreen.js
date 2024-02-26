import React from "react";
import { View, Text, StyleSheet } from "react-native";

const Screen4 = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>edit </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  text: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333333",
  },
});

export default Screen4;
