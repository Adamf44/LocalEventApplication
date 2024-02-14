import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "./app/screens/HomeScreen";
import LoginScreen from "./app/screens/LoginScreen";
import CreateEventScreen from "./app/screens/CreateEventScreen";
import NotificationScreen from "./app/screens/NotificationScreen";
import RegisterScreen from "./app/screens/RegisterScreen";
import ProfileScreen from "./app/screens/ProfileScreen";
import CommunityScreen from "./app/screens/CommunityScreen";
import ShowMoreScreen from "./app/screens/ShowMoreScreen";
import CommunityHome from "./app/screens/CommunityHome";
import CreateCommunityEvent from "./app/screens/CreateCommunityEvent";
import CommentSection from "./app/screens/CommentSection";
import AttendEvent from "./app/screens/AttendEvent";
import EventBookmarks from "./app/screens/EventBookmarks";
import NavBar from "./app/screens/NavBar";

const Stack = createStackNavigator();

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // You can implement authentication logic here to update isAuthenticated state
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="LoginScreen"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="HomeScreen"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CommentSection"
          component={CommentSection}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ShowMoreScreen"
          component={ShowMoreScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AttendEvent"
          component={AttendEvent}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="EventBookmarks"
          component={EventBookmarks}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CreateEventScreen"
          component={CreateEventScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CommunityScreen"
          component={CommunityScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CommunityHome"
          component={CommunityHome}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CreateCommunityEvent"
          component={CreateCommunityEvent}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ProfileScreen"
          component={ProfileScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="RegisterScreen"
          component={RegisterScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="NotificationScreen"
          component={NotificationScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
      <NavBar />
    </NavigationContainer>
  );
}
