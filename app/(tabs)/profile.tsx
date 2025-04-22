import ProfileScreen from "@/components/ProfileScreen";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import styles from "../styles";

class Profile extends React.Component {
  render() {
    return (
      <SafeAreaView style={styles.container}>
        <ProfileScreen />
      </SafeAreaView>
    );
  }
}

export default Profile;
