import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";

const NotificationScreen = () => {
  const [recipient, setRecipient] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const sendEmail = async () => {
    const apiKey = "69a6bd85-c148adc9";
    const domain = "sandbox847ffae525ba467ea9ac0ef34f3bab95.mailgun.org";
    const from = "yourname@example.com";
    const to = recipient;
    const text = body;

    try {
      const response = await fetch(
        `https://api.mailgun.net/v3/${domain}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Basic ${btoa(`api:${apiKey}`)}`,
          },
          body: `from=${from}&to=${to}&subject=${encodeURIComponent(
            subject
          )}&text=${encodeURIComponent(text)}`,
        }
      );

      const responseData = await response.json();
      console.log(responseData); // Logs the response from Mailgun
    } catch (error) {
      console.error("Error sending email:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Notification screen</Text>
      <TextInput
        style={styles.input}
        placeholder="Recipient"
        value={recipient}
        onChangeText={setRecipient}
      />
      <TextInput
        style={styles.input}
        placeholder="Subject"
        value={subject}
        onChangeText={setSubject}
      />
      <TextInput
        style={[styles.input, styles.bodyInput]}
        placeholder="Body"
        value={body}
        onChangeText={setBody}
        multiline
      />
      <Button title="Send Email" onPress={sendEmail} />
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
    marginBottom: 20,
  },
  input: {
    width: "80%",
    height: 40,
    borderColor: "#CCCCCC",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  bodyInput: {
    height: 100,
  },
});

export default NotificationScreen;
