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
} from "react-native";
import gemini from "@/genai/gemini";
import DownloadImageButton from "@/components/DownloadImageButton";

export default function ImageCreateScreen() {
  type Base64Data = {
    mimeType: string;
    base64String: string;
  };
  const [generatedImage, setGeneratedImage] = React.useState("");
  const [base64ImageData, setBase64ImageData] = React.useState(
    {} as Base64Data,
  );
  const [loading, setLoading] = React.useState(false);
  const [prompt, setPrompt] = React.useState("");
  const textRef = React.useRef<TextInput>(null);

  const handleInputChange = (newText: string) => {
    setPrompt(newText);
  };

  const generateImage = async () => {
    if (!prompt.trim()) {
      Alert.alert(
        "Info",
        "Please enter a prompt before attempting to generate.",
      );
      return;
    }
    setLoading(true);
    setGeneratedImage("");

    try {
      const response = await gemini.googleImageCreationModel.generateContent(
        `Imagine ${prompt}`,
      );
      const imagePart =
        response.response?.candidates?.[0]?.content?.parts?.find(
          (part) => part.inlineData,
        );

      if (imagePart?.inlineData?.data) {
        const base64Image = imagePart.inlineData.data;
        const base64ImageContentType = imagePart.inlineData.mimeType;
        setGeneratedImage(
          `data:${base64ImageContentType};base64,${base64Image}`,
        );
        setBase64ImageData({
          base64String: base64Image,
          mimeType: base64ImageContentType,
        });
      } else {
        Alert.alert(
          "No image data received",
          "Make sure your prompt is not illegal or NSFW.",
        );
      }
    } catch (error) {
      console.error("Error generating image:", error);
      Alert.alert(
        "Error",
        "Failed to generate image. Try again after sometime",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ThemedText style={styles.title}>Artiflex Image Generator</ThemedText>
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
      >
        <ThemedText style={styles.buttonText}>
          {loading ? "Generating..." : "Generate Image"}
        </ThemedText>
      </Pressable>

      {generatedImage && !loading ? (
        <ThemedView style={styles.imageContainer}>
          <ThemedText style={styles.imageLabel}>Generated Image:</ThemedText>
          <Image
            source={{ uri: generatedImage }}
            style={styles.image}
            resizeMode="contain"
          />
          <DownloadImageButton
            base64String={base64ImageData.base64String}
            mimeType={base64ImageData.mimeType}
          >
            <FontAwesome5 name="download" size={24} color="black" />
          </DownloadImageButton>
        </ThemedView>
      ) : (
        <View style={styles.container}>
          <ActivityIndicator size="large" color="#00ff00" />
        </View>
      )}
    </ScrollView>
  );
}
