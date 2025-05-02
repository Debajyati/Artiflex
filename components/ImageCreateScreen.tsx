import React from "react";
import styles from "@/app/styles";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import ThemedText from "@/components/ThemedText";
import ThemedView from "@/components/ThemedView";
import {
  Pressable,
  Image,
  View,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
} from "react-native";
import { GoogleGenAI, Modality } from "@google/genai";
import DownloadImageButton from "@/components/DownloadImageButton";

export interface ImageCreateScreenProps {
  //  User Gemini API key
  geminiAPIKey: string;
}

export default function ImageCreateScreen({
  geminiAPIKey,
}: ImageCreateScreenProps): React.JSX.Element {
  type Base64Data = {
    mimeType: string;
    base64URL: string;
  };
  const [generatedImage, setGeneratedImage] = React.useState("");
  const [base64ImageData, setBase64ImageData] = React.useState(
    {} as Base64Data
  );
  const [loading, setLoading] = React.useState(false);
  const [prompt, setPrompt] = React.useState("");
  const textRef = React.useRef<TextInput>(null);

  const genai = new GoogleGenAI({ apiKey: geminiAPIKey });

  const handleInputChange = (newText: string) => {
    setPrompt(newText);
  };

  const generateImage = async () => {
    if (!prompt.trim()) {
      Alert.alert(
        "Info",
        "Please enter a prompt before attempting to generate."
      );
      return;
    }
    setGeneratedImage("");

    try {
      const response = await genai.models.generateContent({
        model: "gemini-2.0-flash-exp-image-generation",
        contents: prompt,
        config: {
          responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
      });
      const imagePart = response?.candidates?.[0]?.content?.parts?.find(
        (part) => part.inlineData
      );

      if (imagePart?.inlineData?.data) {
        const base64Image = imagePart.inlineData.data;
        const base64ImageContentType = imagePart.inlineData.mimeType as string;
        const base64ImageURL = `data:${base64ImageContentType};base64,${base64Image}`;
        setGeneratedImage(base64ImageURL);
        setBase64ImageData({
          base64URL: base64ImageURL,
          mimeType: base64ImageContentType,
        });
      } else {
        Alert.alert(
          "No image data received",
          "Make sure your prompt is not illegal or NSFW."
        );
      }
    } catch (error) {
      console.error("Error generating image:", error);
      Alert.alert(
        "Error",
        "Failed to generate image. Try again after sometime. Make sure you're connected to internet."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ThemedText style={styles.title}>Artiflex Image Generator</ThemedText>
      <KeyboardAvoidingView behavior="padding">
        <TextInput
          ref={textRef}
          style={styles.input}
          onChangeText={handleInputChange}
          value={prompt}
          placeholder="Enter your image prompt"
        />
        <Pressable
          style={styles.button}
          onPress={generateImage}
          disabled={loading}
          onPressIn={() => setLoading(true)}
        >
          <ThemedText style={styles.buttonText}>
            {loading ? "Generating..." : "Generate Image"}
          </ThemedText>
        </Pressable>
      </KeyboardAvoidingView>

      {generatedImage ? (
        <ThemedView style={styles.imageContainer}>
          <ThemedText style={styles.imageLabel}>Generated Image:</ThemedText>
          <Image
            source={{ uri: generatedImage }}
            style={styles.image}
            resizeMode="contain"
          />
          <DownloadImageButton
            base64URL={base64ImageData.base64URL}
            mimeType={base64ImageData.mimeType}
            onDownloadSuccess={() =>
              console.log("Download completed successfully")
            }
            onDownloadError={(error) =>
              console.error("Download failed:", error)
            }
          >
            <FontAwesome5 name="download" size={24} color="black" />
          </DownloadImageButton>
        </ThemedView>
      ) : (
        loading && (
          <View style={styles.container}>
            <ActivityIndicator size="large" color="#00ff00" />
          </View>
        )
      )}
    </ScrollView>
  );
}
