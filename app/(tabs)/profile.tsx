import ProfileScreen from "@/components/ProfileScreen";
import type React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import styles from "../styles";

export default function Profile(): React.JSX.Element {
  return (
    <SafeAreaView style={styles.container}>
      <ProfileScreen />
    </SafeAreaView>
  );
}

