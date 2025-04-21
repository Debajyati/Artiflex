import ProfileScreen from "@/components/ProfileScreen";
import type React from "react";
import { Link } from "expo-router";
import { Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import styles from "../styles";
import ThemedText from "@/components/ThemedText";

export default function Profile(): React.JSX.Element {
  return (
    <SafeAreaView style={styles.container}>
      <Link href="/" style={{ marginTop: 15, paddingVertical: 15 }} asChild>
        <Pressable style={{
          ...styles.button,
          padding: 10,
          borderRadius: 25,
        }}>
          <ThemedText>
            <MaterialIcons name="home-filled" size={24} color="black" />
          </ThemedText>
        </Pressable>
      </Link>
      <ProfileScreen />
    </SafeAreaView>
  );
}

