import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCYL4yPm8Mo6AxNpByRXTpl_CrfHE8o_I4",
  authDomain: "localeventapp-76188.firebaseapp.com",
  projectId: "localeventapp-76188",
  storageBucket: "localeventapp-76188.appspot.com",
  messagingSenderId: "622173305382",
  appId: "1:622173305382:web:084d5043cf1acf158944e7",
  measurementId: "G-7Z059TG789",
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});
