import { Link } from "expo-router";
import ExternalLink from "@/components/ExternalLink";
import { SafeAreaView } from "react-native-safe-area-context";
import ThemedText from "@/components/ThemedText";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { ImageBackground, Pressable } from "react-native";
import Fontisto from "@expo/vector-icons/Fontisto";
import styles from "../styles";
import type React from "react";

export default function Index(): React.JSX.Element {
  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require("@/assets/images/homescreen-background.jpeg")}
        resizeMode="cover"
        style={{
          flex: 1,
          justifyContent: "center",
        }}
      >
        <Link
          href="/profile"
          style={{ marginTop: 15, paddingVertical: 15 }}
          asChild
        >
          <Pressable
            style={{
              ...styles.button,
              padding: 10,
              borderRadius: 25,
            }}
          >
            <ThemedText>
              <FontAwesome6 name="user-large" size={24} color="black" />
            </ThemedText>
          </Pressable>
        </Link>
        <ThemedText type="title">Artiflex</ThemedText>
        <ThemedText
          type="subtitle"
          style={{
            marginTop: 10,
          }}
        >
          A simple image generator app for Android
        </ThemedText>
        <ThemedText
          type="defaultSemiBold"
          style={{
            margin: 10,
            padding: 10,
          }}
        >
          Made with <Fontisto name="heart" size={24} color="black" />
          ❤️ by
          <ExternalLink href="https://github.com/Debajyati">
            {" "}
            Debajyati Dey
          </ExternalLink>
        </ThemedText>
        <Link href="/(tabs)/create">
          <ThemedText type="default">Get Started</ThemedText>
        </Link>
      </ImageBackground>
    </SafeAreaView>
  );
}
