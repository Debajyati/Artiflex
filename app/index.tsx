import { Link } from "expo-router";
import ExternalLink from "@/components/ExternalLink";
import { SafeAreaView } from "react-native-safe-area-context";
import ThemedText from "@/components/ThemedText";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { Image, Pressable } from "react-native";
import styles from "@/app/styles";
import type React from "react";

export default function Index(): React.JSX.Element {
  return (
    <SafeAreaView style={styles.container}>
      <ThemedText type="title">Artiflex</ThemedText>
      <Image
        source={require("@/assets/images/homescreen-background.jpeg")}
        style={{
          ...styles.image,
        }}
      />
      <Link
        href="/profile"
        push asChild
      >
        <Pressable
          style={{
            ...styles.button,
            borderRadius: 100,
            backgroundColor: "#ffffff",
            position: "absolute",
            top: 40,
            right: 10,
            margin: 15,
            padding: 0,
          }}
        >
          <ThemedText style={styles.buttonText}>
            <FontAwesome6 name="user-large" size={18} color="black" />
          </ThemedText>
        </Pressable>
      </Link>
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
        Made with 💖 by
        <ExternalLink href="https://github.com/Debajyati">
          {" "}
          Debajyati Dey
        </ExternalLink>
      </ThemedText>
      <Link href="/create" push asChild>
        <Pressable style={{
          ...styles.button,
          backgroundColor: "#ffffff",
          padding: 0,
          margin: 5,
        }}>
          <ThemedText style={{
            ...styles.buttonText,
            color: "#0a0a0a",
          }} type="defaultSemiBold">
            Get Started
          </ThemedText>
        </Pressable>
      </Link>
    </SafeAreaView>
  );
}

