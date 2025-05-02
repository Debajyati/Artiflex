import ImageCreateScreen from "@/components/ImageCreateScreen";
import React from "react";
import { useRouter } from "expo-router";
import { Pressable, Alert, ToastAndroid } from "react-native";
import ThemedText from "@/components/ThemedText";
import { UserData } from "@/components/ProfileScreen";
import { AntDesign } from "@expo/vector-icons";
import styles from "@/app/styles";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth, useUser, SignedIn, SignedOut } from "@clerk/clerk-expo";
import { db } from "@/constants/FirebaseConfig";
import { doc, getDoc } from "firebase/firestore";
const { isSignedIn } = useAuth();
const { user, isLoaded: isUserLoaded } = useUser();

export default function Prompt2Image(): React.JSX.Element {
  const [geminiAPIKey, setGeminiAPIKey] = React.useState("");
  const router = useRouter();
  const retriveGeminiAPIKey = async () => {
    if (isSignedIn && user) {
      const userId = user.id; // Use Clerk user ID

      try {
        // Fetch user data (API key)
        const userDoc = await getDoc(doc(db, "users", userId));
        if (userDoc.exists()) {
          const userData = userDoc.data() as UserData;
          if (userData.apiKey) {
            setGeminiAPIKey(userData.apiKey || ""); // Set existing key if present
          } else {
            ToastAndroid.show("No API key found.", ToastAndroid.SHORT);
            setTimeout(() => {
              ToastAndroid.show(
                "Must sign in and create an API key to use the app.",
                ToastAndroid.SHORT
              );
            }, 1000);
            setTimeout(() => {
              router.push("/profile");
            }, 1500);
          }
        } else {
          ToastAndroid.show(
            "Must sign in and create an API key to use the app.",
            ToastAndroid.SHORT
          );
          router.push("/profile");
        }
      } catch (error) {
        console.error("Error fetching user data or presets:", error);
        Alert.alert("Error", "Could not load profile data.");
      }
    } else {
      ToastAndroid.show("Unauthenticated user!", ToastAndroid.SHORT);
      ToastAndroid.show("Must sign in to use the app.", ToastAndroid.SHORT);
      router.push("/profile");
    }
  };
  React.useEffect(() => {
    retriveGeminiAPIKey();
  }, [isSignedIn, user, isUserLoaded]);
  return (
    <SafeAreaView style={styles.container}>
      {/* View for signed in users */}
      <SignedIn>
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
        <ImageCreateScreen geminiAPIKey={geminiAPIKey} />
      </SignedIn>
      {/* View for signed out users */}
      <SignedOut>
        <ThemedText type="title" style={styles.title}>
          Artiflex
        </ThemedText>
        <ThemedText type="subtitle">
          Please sign in with Google to use the app.
        </ThemedText>
        <ThemedText type="default">
          Go to Profile Page to Sign In/Sign Up and Create an API Key
        </ThemedText>
        <Pressable
          onPress={() => router.push("/profile")}
          style={{
            margin: 5,
            padding: 5,
            borderRadius: 10,
            backgroundColor: "#ffffff",
          }}
        >
          <ThemedText type="link" style={styles.buttonText}>
            Sign In/ Sign Up
          </ThemedText>
        </Pressable>
      </SignedOut>
    </SafeAreaView>
  );
}
