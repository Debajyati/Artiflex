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
        onPress={() => router.back()}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          margin: 0,
          padding: 0,
          borderRadius: 100,
          backgroundColor: "#ffffff",
        }}
      >
        <ThemedText style={styles.buttonText}>
          <AntDesign name="arrowleft" size={15} color="black" />
        </ThemedText>
      </Pressable>
      <ProfileScreen />
    </SafeAreaView>
  );
}
