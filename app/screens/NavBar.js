import React from "react";
import { View, TouchableOpacity, Image, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

const NavBar = ({ isAuthenticated }) => {
  const navigation = useNavigation();

  return (
    <View style={styles.navBar}>
      <View style={styles.navBar}>
        <View style={styles.nav}>
          <TouchableOpacity
            style={styles.navButtons}
            onPress={() =>
              navigation.navigate("HomeScreen", {
                isAuthenticated: isAuthenticated,
              })
            }
          >
            <Image
              style={styles.navHomeImg}
              source={require("../assets/home.png")}
            />
          </TouchableOpacity>
        </View>
        <Image style={styles.lines} source={require("../assets/line.png")} />
        <View style={styles.nav}>
          <TouchableOpacity
            style={styles.navButtons}
            onPress={() =>
              navigation.navigate("CreateEventScreen", {
                isAuthenticated: isAuthenticated,
              })
            }
          >
            <Image
              style={styles.navHomeImg}
              source={require("../assets/create.png")}
            />
          </TouchableOpacity>
        </View>
        <Image style={styles.lines} source={require("../assets/line.png")} />

        <View style={styles.nav}>
          <TouchableOpacity
            style={styles.navButtons}
            onPress={() =>
              navigation.navigate("CommunityScreen", { isAuthenticated })
            }
          >
            <Image
              style={styles.navHomeImg}
              source={require("../assets/com.png")}
            />
          </TouchableOpacity>
        </View>
        <Image style={styles.lines} source={require("../assets/line.png")} />

        <View style={styles.nav}>
          <TouchableOpacity
            style={styles.navButtons}
            onPress={() =>
              navigation.navigate("NotificationScreen", { isAuthenticated })
            }
          >
            <Image
              style={styles.navHomeImg}
              source={require("../assets/noti.png")}
            />
          </TouchableOpacity>
        </View>
        <Image style={styles.lines} source={require("../assets/line.png")} />

        <View style={styles.nav}>
          <TouchableOpacity
            style={styles.navButtons}
            onPress={() =>
              navigation.navigate("ProfileScreen", { isAuthenticated })
            }
          >
            <Image
              style={styles.navHomeImg}
              source={require("../assets/profile.png")}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  navBar: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    bottom: 0,
    zIndex: 999,
    width: "100%",
    backgroundColor: "#2c3e50",
  },
  navButtons: {
    marginVertical: 25,
    marginHorizontal: 18,
  },
  nav: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
  },
  navHomeImg: {
    height: 30,
    width: 30,
    opacity: 1,
  },
  line: {
    height: 2,
    backgroundColor: "#3498db",
    marginVertical: 5,
  },
  lines: {
    height: 20,
    width: 10,
    opacity: 0.76,
  },
});

export default NavBar;
