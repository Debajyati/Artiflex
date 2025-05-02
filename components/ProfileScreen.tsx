import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Image,
  KeyboardAvoidingView,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ToastAndroid,
  ActivityIndicator,
  StyleSheet,
  Button,
  Text,
} from "react-native";
import AuthSession from "expo-auth-session";
import { useAuth, useUser, useSSO, SignedIn } from "@clerk/clerk-expo";
import { doc, getDoc, setDoc } from "firebase/firestore";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import * as WebBrowser from 'expo-web-browser';
import * as ImagePicker from "expo-image-picker";

import { db } from "@/constants/FirebaseConfig";

import ThemedText from "@/components/ThemedText";
import ThemedView from "@/components/ThemedView";
import ExternalLink from "@/components/ExternalLink";
import SignOutButton from "@/components/SignOutButton";

// Structure for your presets in Firestore
export interface Preset {
  image: string; // Base64 string
  description: string;
  fileExtension: string;
}

// Structure for your user data in Firestore
export interface UserData {
  apiKey?: string;
}

export const useWarmUpBroswer = () => {
  useEffect(()=>{
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  },[]);
}

WebBrowser.maybeCompleteAuthSession();

export default function ProfileScreen(): React.JSX.Element {
  // Clerk hooks for auth state and user info
  const { isSignedIn, isLoaded: isAuthLoaded } = useAuth();
  const { user, isLoaded: isUserLoaded } = useUser();

  // State for component logic
  const [loading, setLoading] = useState(true); // Combined loading state
  const [presets, setPresets] = useState<Preset[]>([]);
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [hasApiKey, setHasApiKey] = useState(false);
  const textRef = React.useRef<TextInput>(null);

  // --- Clerk Google OAuth Hook ---
  const { startSSOFlow } = useSSO();

  const handleGoogleSignIn = useCallback(async () => {
    try {
      // Start the OAuth flow for Google
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: "oauth_google",
        redirectUrl: AuthSession.makeRedirectUri(),
      });

      if (createdSessionId && setActive) {
        // Set the new session as active
        await setActive({ session: createdSessionId });
        ToastAndroid.show("Signed in successfully!", ToastAndroid.SHORT);
        // Reset local state if needed after sign-in
        setShowApiKeyInput(false);
        setHasApiKey(false); // Re-check API key on user change effect
      } else {
        // Handle cases where sign-in flow doesn't complete (e.g., user cancels)
        // Flow may have been cancelled or aborted.
        ToastAndroid.show("Sign-in failed.", ToastAndroid.SHORT);
      }
    } catch (err: any) {
      console.error("OAuth error", err);
      Alert.alert(
        "Sign In Error",
        err.errors?.[0]?.message ?? "An unknown error occurred during sign-in."
      );
    }
  }, [startSSOFlow]);

  // --- Effect to load user data (API Key, Presets) from Firestore ---
  useEffect(() => {
    // Only run if Clerk is loaded and user is signed in
    if (!isAuthLoaded || !isUserLoaded) {
      setLoading(true);
      return;
    }

    setLoading(true); // Start loading data

    if (isSignedIn && user) {
      const userId = user.id; // Use Clerk user ID

      // Fetch API Key and Presets concurrently
      Promise.all([
        // Fetch user data (API key)
        getDoc(doc(db, "users", userId)).then((userDoc) => {
          if (userDoc.exists()) {
            const userData = userDoc.data() as UserData;
            setHasApiKey(!!userData.apiKey); // Check if apiKey field exists and is truthy
            setApiKey(userData.apiKey || ""); // Set existing key if present
          } else {
            setHasApiKey(false);
            setApiKey("");
          }
        }),
        // Fetch presets
        getDoc(doc(db, "presets", userId)).then((presetsDoc) => {
          if (presetsDoc.exists()) {
            setPresets((presetsDoc.data()?.presets as Preset[]) || []);
          } else {
            setPresets([]);
          }
        }),
      ])
        .catch((error) => {
          console.error("Error fetching user data or presets:", error);
          Alert.alert("Error", "Could not load profile data.");
          // Reset state in case of error
          setHasApiKey(false);
          setApiKey("");
          setPresets([]);
        })
        .finally(() => {
          setLoading(false); // Finish loading data
        });
    } else {
      // User is not signed in or user object not loaded yet
      setLoading(false); // Finish loading state check
      // Reset state for logged-out user
      setHasApiKey(false);
      setApiKey("");
      setPresets([]);
      setShowApiKeyInput(false);
    }

    // Dependency array: run when auth/user state changes or Clerk loads
  }, [isSignedIn, user, isAuthLoaded, isUserLoaded]);

  // --- API Key Handling ---
  const handleSaveApiKey = async () => {
    if (!user) return; // Should not happen if button is shown, but good practice

    try {
      setLoading(true); // Indicate saving
      const userId = user.id;
      // Use setDoc with merge: true to update or create the apiKey field
      await setDoc(doc(db, "users", userId), { apiKey: apiKey }, { merge: true });
      setHasApiKey(true);
      setShowApiKeyInput(false); // Hide input section
      ToastAndroid.show("API Key saved successfully", ToastAndroid.SHORT);
    } catch (error) {
      console.error("Error saving API key:", error);
      Alert.alert("Error", "Failed to save API key");
    } finally {
      setLoading(false);
    }
  };

  // --- Preset Handling ---
  const handleAddPreset = async () => {
    if (presets.length >= 2) {
      Alert.alert("Limit Reached", "You can only store 2 presets.");
      return;
    }

    try {
      // Request permissions if necessary (might be needed for Expo Go)
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert("Permission Required", "Need permission to access photos.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.6, // Keep quality reasonable
        base64: true, // Request base64 data
      });

      if (!result.canceled && result.assets && result.assets[0].base64) {
        const asset = result.assets[0];
        const fileExtension = asset.uri.split(".").pop() || "jpg"; // Get extension
        const newPreset: Preset = {
          image: asset.base64 as string, // Use the base64 string
          fileExtension: fileExtension,
          description: "", // Start with empty description
        };
        setPresets([...presets, newPreset]);
        // Note: Presets are only saved when 'Save Presets' is clicked
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to add preset image.");
    }
  };

  const handleSavePresets = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const userId = user.id;
      // Overwrite the presets document for this user with the current state
      await setDoc(doc(db, "presets", userId), { presets: presets });
      ToastAndroid.show("Presets saved successfully", ToastAndroid.SHORT);
    } catch (error) {
      console.error("Error saving presets:", error);
      Alert.alert("Error", "Failed to save presets");
    } finally {
      setLoading(false);
    }
  };

  // --- Render Logic ---

  // Show loading indicator while Clerk or data is loading
  if (loading || !isAuthLoaded || !isUserLoaded) {
    return (
      <ThemedView style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#007AFF" />
      </ThemedView>
    );
  }

  // Render Sign-in screen if user is not signed in
  if (!isSignedIn) {
    return (
      <ThemedView style={[styles.container, styles.centerContent, styles.signInContainer]}>
        <ThemedText style={styles.header}>You're not logged In</ThemedText>
        <ThemedText style={styles.subText}>
          Please sign in with Google to use the app.
        </ThemedText>
        <TouchableOpacity style={styles.googleButton} onPress={handleGoogleSignIn}>
          <FontAwesome5 name="google" size={20} color="#fff" style={{ marginRight: 10 }} />
          <Text style={styles.googleButtonText}>Sign in with Google</Text>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  // Render API Key input screen if needed
  if (showApiKeyInput) {
    return (
      <ThemedView style={[styles.container, styles.centerContent, styles.apiKeyInputContainer]}>
        <ThemedText style={styles.subText}>
          Click the link below to create or find your Gemini API key.
        </ThemedText>
        <ExternalLink href="https://aistudio.google.com/apikey">
          <ThemedText style={styles.linkText}>Get API Key from Google AI Studio</ThemedText>
        </ExternalLink>
        <ThemedText style={[styles.subText, { marginTop: 15, marginBottom: 5 }]}>
          Paste the key here:
        </ThemedText>
        <TextInput
          ref={textRef}
          style={styles.apiKeyTextInput}
          value={apiKey}
          onChangeText={setApiKey}
          placeholder="Enter your API Key"
          placeholderTextColor="#888fff"
          multiline={false} // Usually API keys are single line
          secureTextEntry={true} // Hide the API key
        />
        <Button
          title="Save API Key"
          onPress={handleSaveApiKey}
          disabled={!apiKey || loading} // Disable if no key or loading
          color="#007AFF"
        />
         <TouchableOpacity onPress={() => setShowApiKeyInput(false)} style={{marginTop: 15}}>
             <Text style={styles.cancelText}>Cancel</Text>
         </TouchableOpacity>
      </ThemedView>
    );
  }

  // Render Profile screen for logged-in user
  // Ensure user object is available (it should be if isSignedIn is true)
  if (!user) {
     // This case should ideally not be reached if logic is correct
     return (
         <ThemedView style={[styles.container, styles.centerContent]}>
             <ThemedText>Error: User data not available.</ThemedText>
         </ThemedView>
     );
  }

  return (
    <ScrollView style={styles.scrollView}>
      <ThemedView style={styles.profileContainer}>
        <KeyboardAvoidingView behavior="padding" style={{ width: '100%', alignItems: 'center' }}>
          {/* Profile Image */}
          <Image
             source={{ uri: user.imageUrl || undefined }} // Use Clerk's imageUrl
             defaultSource={require("@/assets/images/avatar.jpg")} // Provide a local fallback
             style={styles.profileImage}
             onError={(e) => console.log("Failed to load profile image:", e.nativeEvent.error)}
          />

          {/* Display Name (from Clerk, not editable here) */}
          <ThemedText style={styles.displayName}>
            {user.fullName || user.firstName || "User"} {/* Show full name or first name */}
          </ThemedText>

          {/* Email (from Clerk) */}
          <ThemedText style={styles.email}>
            {user.primaryEmailAddress?.emailAddress || "No email"}
          </ThemedText>

          {/* API Key Section */}
          {!hasApiKey && (
            <View style={styles.apiKeySection}>
              <ThemedText style={styles.warningText}>
                Gemini API Key is missing. You need it to use the app's core features.
              </ThemedText>
              <TouchableOpacity
                style={styles.apiKeyButton}
                onPress={() => setShowApiKeyInput(true)}
              >
                <ThemedText style={styles.buttonText}>Add Gemini API Key</ThemedText>
              </TouchableOpacity>
            </View>
          )}
          {hasApiKey && (
             <View style={styles.apiKeySection}>
                 <ThemedText style={styles.successText}>
                    Gemini API Key is configured.
                 </ThemedText>
                 <TouchableOpacity
                    style={[styles.apiKeyButton, styles.editApiKeyButton]}
                    onPress={() => setShowApiKeyInput(true)} // Allow editing
                 >
                    <ThemedText style={styles.buttonText}>Edit API Key</ThemedText>
                 </TouchableOpacity>
             </View>
          )}


          {/* Presets Section */}
          <View style={styles.presetsContainer}>
            <ThemedText style={styles.sectionTitle}>Your Image Presets</ThemedText>
            {presets.map((preset, index) => (
              <View key={index} style={styles.presetItem}>
                <Image
                  source={{ uri: `data:image/${preset.fileExtension};base64,${preset.image}` }}
                  style={styles.presetImage}
                  resizeMode="cover"
                />
                <TextInput
                  style={styles.presetDescription}
                  value={preset.description}
                  onChangeText={(text) => {
                    const newPresets = [...presets];
                    newPresets[index].description = text;
                    setPresets(newPresets);
                  }}
                  placeholder="Add description"
                  placeholderTextColor="#888fff"
                />
                {/* Optional: Add a delete button per preset */}
                <TouchableOpacity onPress={() => {
                  const newPresets = presets.filter((_, i) => i !== index);
                  setPresets(newPresets);
                  ToastAndroid.show("Preset deleted", ToastAndroid.SHORT);
                  setTimeout(() => {
                    ToastAndroid.show("Save presets to apply changes", ToastAndroid.LONG);
                  }, 900);
                }} style={styles.deletePresetButton}>
                  <FontAwesome5 name="trash-alt" size={18} color="#0a0a0a" />
                </TouchableOpacity>
              </View>
            ))}

            {/* Add Preset Button */}
            {presets.length < 2 && (
              <TouchableOpacity
                style={styles.addPresetButton}
                onPress={handleAddPreset}
              >
                <FontAwesome5 name="plus" size={24} color="#007AFF" />
                <ThemedText style={{marginTop: 5, color: "#007AFF"}}>Add Preset</ThemedText>
              </TouchableOpacity>
            )}

            {/* Save Presets Button */}
            {presets.length > 0 && (
              <TouchableOpacity
                style={styles.savePresetsButton}
                onPress={handleSavePresets}
                disabled={loading}
              >
                <ThemedText style={styles.buttonText}>Save Presets</ThemedText>
              </TouchableOpacity>
            )}
          </View>
          {/* Sign Out Button */}
          <SignedIn>
            <SignOutButton />
          </SignedIn>
        </KeyboardAvoidingView>
      </ThemedView>
    </ScrollView>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  container: {
    flex: 1,
    // Removed alignItems and justifyContent to allow scrolling content
  },
  centerContent: {
    justifyContent: "center", // Center content vertically
    alignItems: "center", // Center content horizontally
    padding: 20,
  },
  signInContainer: {
    padding: 30,
  },
  apiKeyInputContainer: {
     padding: 30,
  },
  profileContainer: {
    alignItems: "center",
    paddingVertical: 30, // More padding top/bottom
    paddingHorizontal: 15,
  },
  profileImage: {
    width: 120, // Slightly smaller
    height: 120,
    borderRadius: 60, // Keep it circular
    marginBottom: 15,
    backgroundColor: '#e0e0e0', // Placeholder background
  },
  displayName: {
    fontSize: 22, // Slightly smaller
    fontWeight: "bold",
    marginBottom: 5,
    textAlign: 'center',
  },
  email: {
    fontSize: 16,
    color: "#555", // Darker grey
    marginBottom: 15,
    textAlign: 'center',
  },
  username: { // Style for User ID if displayed
    fontSize: 12,
    color: "#888",
    marginBottom: 20,
    textAlign: 'center',
  },
  // Input Styles (used for preset description)
  input: {
    width: "100%",
    height: 45,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 10,
    backgroundColor: '#fff', // Ensure input background
  },
   apiKeyTextInput: {
      width: "90%",
      height: 45,
      borderWidth: 1,
      borderColor: "#ccc",
      borderRadius: 8,
      paddingHorizontal: 15,
      marginBottom: 15,
      backgroundColor: '#fff',
   },
  // Button Styles
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "#4285F4", // Google Blue
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    marginTop: 20,
    elevation: 2, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  googleButtonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: '500',
  },
  apiKeySection: {
      width: '90%',
      marginTop: 20,
      marginBottom: 15,
      padding: 15,
      borderRadius: 8,
      backgroundColor: '#f0f0f0', // Light background for the section
      alignItems: 'center',
  },
  apiKeyButton: {
    backgroundColor: "#E67E22", // Orange color for warning/action
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
   editApiKeyButton: {
      backgroundColor: "#3498DB", // Blue for edit action
   },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: '500',
  },
  warningText: {
      color: '#D35400', // Darker orange for warning
      fontSize: 14,
      textAlign: 'center',
      marginBottom: 10,
  },
   successText: {
      color: '#27AE60', // Green for success
      fontSize: 14,
      textAlign: 'center',
      marginBottom: 5,
   },
   linkText: {
       color: '#007AFF',
       fontSize: 16,
       marginVertical: 10,
       textDecorationLine: 'underline',
   },
   cancelText: {
       color: '#888',
       fontSize: 14,
   },
  // Presets Styles
  presetsContainer: {
    width: "100%",
    marginTop: 25,
    paddingHorizontal: 10, // Padding inside the presets area
  },
  sectionTitle: {
    fontSize: 18, // Slightly smaller section title
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: 'center',
    color: '#333',
  },
  presetItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  presetImage: {
    width: 60, // Smaller preset image
    height: 60,
    borderRadius: 8, // Rounded corners
    marginRight: 10,
    backgroundColor: '#e0e0e0',
  },
  presetDescription: {
    flex: 1, // Take remaining space
    height: 50, // Allow for a bit more text
    borderWidth: 1,
    borderColor: "#ddd", // Lighter border
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 5, // Add vertical padding
    fontSize: 14,
  },
  deletePresetButton: {
      paddingLeft: 10, // Space before the icon
      paddingRight: 5,
      backgroundColor: '#FF3B30',
  },
  addPresetButton: {
    // width: '100%', // Make button wider
    height: 80,
    borderWidth: 2, // Make border more prominent
    borderColor: "#007AFF",
    borderStyle: 'dashed', // Dashed border for "add"
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10, // Space above add button
    marginBottom: 15, // Space below add button
    paddingHorizontal: 20,
  },
  savePresetsButton: {
    backgroundColor: "#27AE60", // Green for save action
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    marginTop: 10, // Space above save button
    alignItems: "center",
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  // Loading/Header/SubText Styles
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: 'center',
  },
  subText: {
    fontSize: 16,
    color: "#666",
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22, // Improve readability
  },
});
