import ProfileScreen from "@/components/ProfileScreen";
import type React from "react";
import { useRouter } from "expo-router";
import { Pressable } from "react-native";
import ThemedText from "@/components/ThemedText";
import { AntDesign } from "@expo/vector-icons";
import styles from "@/app/styles";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Profile(): React.JSX.Element {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.container}>
      <Pressable
        onPress={() => router.dismissTo("/")}
        style={{
          position: "absolute",
          top: 5,
          left: 5,
          margin: 5,
          padding: 10,
          borderRadius: 100,
          backgroundColor: "#ffffff",
        }}
      >
        <ThemedText style={styles.buttonText}>
          <AntDesign name="arrowleft" size={20} color="black" />
        </ThemedText>
      </Pressable>
      <ProfileScreen />
    </SafeAreaView>
  );
}
