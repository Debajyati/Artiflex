import { Link } from "expo-router";
import ExternalLink from "@/components/ExternalLink";
import { SafeAreaView } from "react-native-safe-area-context";
import ThemedText from "@/components/ThemedText";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { Image, Pressable } from "react-native";
import Fontisto from "@expo/vector-icons/Fontisto";
import styles from "./styles";
import type React from "react";

export default function Index(): React.JSX.Element {
  return (
    <SafeAreaView style={styles.container}>
      <Image
        source={require("@/assets/images/homescreen-background.jpeg")}
        style={{
          ...styles.image,
        }}
      />
      <Link
        href="/profile"
        asChild
      >
        <Pressable
          style={{
            ...styles.button,
            borderRadius: 100,
            backgroundColor: "#ffffff",
            position: "absolute",
            top: 0,
            right: 0,
            margin: 5,
            padding: 5,
          }}
        >
          <ThemedText style={styles.buttonText}>
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
        Made with{" "}
      </ThemedText>
      <Fontisto name="heart" size={24} color="black" />
      <ThemedText>
        ❤️ by
        <ExternalLink href="https://github.com/Debajyati">
          {" "}
          Debajyati Dey
        </ExternalLink>
      </ThemedText>
      <Link href="/create">
        <Pressable style={{
          ...styles.button,
          backgroundColor: "#ffffff",
          position: "absolute",
          bottom: 10,
        }}>
          <ThemedText style={styles.buttonText} type="default">
            Get Started
          </ThemedText>
        </Pressable>
      </Link>
    </SafeAreaView>
  );
}

