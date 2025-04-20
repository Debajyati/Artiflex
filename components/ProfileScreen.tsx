import React, { useState, useEffect } from "react";
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
} from "react-native";
import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";
import {
  GoogleSignin,
  GoogleSigninButton,
  type SignInResponse,
  isErrorWithCode,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import firestore from "@react-native-firebase/firestore";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import * as ImagePicker from "expo-image-picker";
import ThemedText from "./ThemedText";
import ThemedView from "./ThemedView";
import googleServicesJSON from "../google-services.json";
import ExternalLink from "./ExternalLink";

const ProfileScreen = () => {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [presets, setPresets] = useState<
    Array<{ image: string; description: string; fileExtension: string }>
  >([]);
  const [showWebView, setShowWebView] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [hasApiKey, setHasApiKey] = useState(false);
  const textRef = React.useRef<TextInput>(null);

  //

  useEffect(() => {
    const requiredOAuthObject =
      googleServicesJSON.client[0].oauth_client.filter(
        (obj) => obj.client_type === 3
      );
    const requiredOAuthClientId = requiredOAuthObject[0].client_id;
    GoogleSignin.configure({
      webClientId: requiredOAuthClientId,
    });
  }, []);

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(async (user) => {
      setUser(user);
      if (user) {
        // Check for API key
        const userDoc = await firestore()
          .collection("users")
          .doc(user.uid)
          .get();
        setHasApiKey(userDoc.exists && userDoc.data()?.apiKey);
        setDisplayName(user.displayName || "");

        // Load presets
        const presetsDoc = await firestore()
          .collection("presets")
          .doc(user.uid)
          .get();
        if (presetsDoc.exists) {
          setPresets(presetsDoc.data()?.presets || []);
        }
      }
      setLoading(false);
    });

    return () => subscriber();
  }, []);

  const handleInputChange = (newText: string) => {
    setApiKey(newText);
  };

  async function onGoogleButtonPress() {
    try {
      // Check if your device supports Google Play
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });
      // Get the users ID token
      const signInResult: SignInResponse = await GoogleSignin.signIn();
      if (signInResult.type === "cancelled") {
        return;
      }

      // Try the new style of google-sign in result, from v13+ of that module
      const idToken = signInResult.data?.idToken;
      if (!idToken) {
        throw new Error("No ID token found");
      }
      console.log("Success Login");

      // Create a Google credential with the token
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);

      // Sign-in the user with the credential
      return auth().signInWithCredential(googleCredential);
    } catch (error) {
      console.log(error);
      if (isErrorWithCode(error)) {
        if (error.code === statusCodes.SIGN_IN_CANCELLED) {
          return;
        }
        if (error.code === statusCodes.IN_PROGRESS) {
          // signin operation is already in progress
          // do nothing
        }
        if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
          Alert.alert("Error", "Google Play Services is not available");
          return;
        }
      }
      Alert.alert("Unknown Error", `Failed to login`);
      return;
    }
  }

  const handleAddPreset = async () => {
    if (presets.length >= 2) {
      Alert.alert("Limit Reached", "You can only store 2 presets");
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 0.6,
      });

      if (!result.canceled) {
        const newPreset = {
          image: String(result.assets[0].base64),
          fileExtension: String(result.assets[0].uri.split(".").pop()),
          description: "",
        };
        setPresets([...presets, newPreset]);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to add preset");
    }
  };

  const handleSavePresets = async () => {
    try {
      await firestore().collection("presets").doc(user?.uid).set({
        presets: presets,
      });
      ToastAndroid.show("Presets saved successfully", ToastAndroid.SHORT);
    } catch (error) {
      Alert.alert("Error", "Failed to save presets");
    }
  };

  const handleSaveProfile = async () => {
    try {
      await auth().currentUser?.updateProfile({
        displayName: displayName,
      });
      setIsEditing(false);
      ToastAndroid.show("Profile updated successfully", ToastAndroid.SHORT);
    } catch (error) {
      Alert.alert("Error", "Failed to update profile");
    }
  };

  const handleSaveApiKey = async () => {
    try {
      await firestore().collection("users").doc(user?.uid).set(
        {
          apiKey: apiKey,
        },
        { merge: true }
      );
      setHasApiKey(true);
      setShowWebView(false);
      ToastAndroid.show("API Key saved successfully", ToastAndroid.SHORT);
    } catch (error) {
      Alert.alert("Error", "Failed to save API key");
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!user) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.header}>You're not logged In</ThemedText>
        <ThemedText style={styles.subText}>
          Please login/Sign Up to be able to use the app
        </ThemedText>
        <GoogleSigninButton
          onPress={onGoogleButtonPress}
          size={GoogleSigninButton.Size.Wide}
          color={GoogleSigninButton.Color.Dark}
          disabled={loading}
        />
      </ThemedView>
    );
  }

  if (showWebView) {
    return (
      <>
        <ThemedView style={styles.container}>
          <ThemedText style={styles.subText}>
            Click on the link below to get your API key.{"\n"}
            Copy the key and paste it in the text box below.{"\n"}
          </ThemedText>
          <TextInput
            ref={textRef}
            style={styles.input}
            value={apiKey}
            onChangeText={handleInputChange}
            placeholder="API Key"
            multiline={true}
          />
          <ThemedText style={styles.subText}>
            <ExternalLink href="https://aistudio.google.com/apikey" />
          </ThemedText>
          <Button
            title="Save API Key"
            onPress={handleSaveApiKey}
            disabled={!apiKey}
          />
        </ThemedView>
      </>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.profileContainer}>
        <KeyboardAvoidingView behavior="padding">
          <TouchableOpacity
            onPress={() => setIsEditing(true)}
            style={styles.editButton}
          >
            <FontAwesome5 name="edit" size={24} color="#000" />
          </TouchableOpacity>

          <Image
            source={{ uri: user.photoURL || "@/assets/images/avatar.jpg" }}
            style={styles.profileImage}
          />

          {isEditing ? (
            <TextInput
              style={styles.input}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Display Name"
            />
          ) : (
            <ThemedText style={styles.displayName}>{displayName}</ThemedText>
          )}

          <ThemedText style={styles.email}>{user.email}</ThemedText>
          <ThemedText style={styles.username}>{user.uid}</ThemedText>

          {isEditing && (
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveProfile}
            >
              <ThemedText style={styles.buttonText}>Save Profile</ThemedText>
            </TouchableOpacity>
          )}

          {!hasApiKey && (
            <>
              <TouchableOpacity
                style={styles.apiKeyButton}
                onPress={() => setShowWebView(true)}
              >
                <ThemedText style={styles.buttonText}>
                  Get Your Gemini API Key
                </ThemedText>
              </TouchableOpacity>
              <ThemedText style={styles.buttonText}>
                Without the API key, you can NOT use the app
              </ThemedText>
            </>
          )}

          <View style={styles.presetsContainer}>
            <ThemedText style={styles.sectionTitle}>Your Presets</ThemedText>
            {presets.map((preset, index) => (
              <View key={index} style={styles.presetItem}>
                <Image
                  source={{
                    uri: `data:image/${preset.fileExtension};base64,${preset.image}`,
                  }}
                  style={styles.presetImage}
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
                />
              </View>
            ))}
            {presets.length < 2 && (
              <TouchableOpacity
                style={styles.addPresetButton}
                onPress={handleAddPreset}
              >
                <FontAwesome5 name="plus" size={24} color="#000" />
              </TouchableOpacity>
            )}
            {presets.length > 0 && (
              <TouchableOpacity
                style={styles.savePresetsButton}
                onPress={handleSavePresets}
              >
                <ThemedText style={styles.buttonText}>Save Presets</ThemedText>
              </TouchableOpacity>
            )}
          </View>
        </KeyboardAvoidingView>
      </ThemedView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileContainer: {
    alignItems: "center",
    padding: 20,
  },
  editButton: {
    position: "absolute",
    top: 20,
    right: 20,
    zIndex: 1,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 20,
  },
  displayName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  email: {
    fontSize: 16,
    marginBottom: 5,
  },
  username: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    height: 40,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  saveButton: {
    backgroundColor: "#007AFF",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
  apiKeyButton: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  presetsContainer: {
    width: "100%",
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  presetItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  presetImage: {
    width: 80,
    height: 80,
    borderRadius: 5,
    marginRight: 10,
  },
  presetDescription: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  addPresetButton: {
    width: 80,
    height: 80,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  savePresetsButton: {
    backgroundColor: "#007AFF",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: "center",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subText: {
    fontSize: 16,
    color: "#666",
  },
});

export default ProfileScreen;
