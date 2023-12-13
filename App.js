import React from "react";
import { AppRegistry } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "react-native-vector-icons/Ionicons";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "./app/screens/HomeScreen";
import LoginScreen from "./app/screens/LoginScreen";
import CreateEventScreen from "./app/screens/CreateEventScreen";
import NotificationScreen from "./app/screens/NotificationScreen";
import RegisterScreen from "./app/screens/RegisterScreen";
import ProfileScreen from "./app/screens/ProfileScreen";
import CommunityScreen from "./app/screens/CommunityScreen";
import HomeScreenLoggedIn from "./app/screens/HomeScreenLoggedIn";
import ShowMoreScreen from "./app/screens/ShowMoreScreen";
import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CommunityHome from "./app/screens/CommunityHome";
import CreateCommunityEvent from "./app/screens/CreateCommunityEvent";
import CommentSection from "./app/screens/CommentSection";
import AttendEvent from "./app/screens/AttendEvent";
import EventBookmarks from "./app/screens/EventBookmarks";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
const HomeStack = ({ isAuthenticated }) => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ShowMoreScreen"
        component={ShowMoreScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="ProfileScreen"
        component={ProfileScreen}
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
        name="CommentSection"
        component={CommentSection}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="LoginScreen"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="RegisterScreen"
        component={RegisterScreen}
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
    </Stack.Navigator>
  );
};
const MainTabNavigator = ({ isAuthenticated }) => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Create Event") {
            iconName = focused ? "add-outline" : "ios-add-outline";
          } else if (route.name === "Notifications") {
            iconName = focused
              ? "notifications-outline"
              : "notifications-outline";
          } else if (route.name === "Profile") {
            iconName = focused ? "person-outline" : "person-outline";
          } else if (route.name === "Community") {
            iconName = focused ? "people-outline" : "people-outline";
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Home"
        children={() => <HomeStack isAuthenticated={isAuthenticated} />}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Create Event"
        component={CreateEventScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Community"
        component={CommunityScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
    </Tab.Navigator>
  );
};
const App = () => {
  const [isAuthenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    // Clear 'Username' from AsyncStorage when the component mounts
    // clearAsyncStorage();

    // Check authentication state when the component mounts
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("User authenticated");
        setAuthenticated(true);
      } else {
        console.log("User not authenticated");
        setAuthenticated(false);
      }
    });

    // Clean up the listener when the component unmounts
    return () => unsubscribe();
  }, []);

  // Function to clear the specific item ('Username') from AsyncStorage

  return (
    <NavigationContainer>
      <MainTabNavigator isAuthenticated={isAuthenticated} />
    </NavigationContainer>
  );
};

export default App;
