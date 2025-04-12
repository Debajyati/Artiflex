import * as MediaLibrary from "expo-media-library";
import * as FileSystem from "expo-file-system";
import { Pressable, PressableProps, Alert, ToastAndroid } from "react-native";
import styles from "@/app/styles";
import uuid from 'react-native-uuid';

const IMG_DIR = FileSystem.cacheDirectory + "Artiflex/";

async function ensureDirExists(imgDir: string) {
  const dirInfo = await FileSystem.getInfoAsync(imgDir);
  if (!dirInfo.exists) {
    console.log("Artiflex image directory doesn't exist, creating...");
    await FileSystem.makeDirectoryAsync(imgDir, { intermediates: true });
  }
}

type DownloadImageButtonProps = {
  base64URL: string;
  mimeType: string;
  children?: PressableProps["children"];
  onPressEvent?: PressableProps["onPress"];
  onPressOutEvent?: PressableProps["onPressOut"];
  onDownloadSuccess?: () => void;
  onDownloadError?: (error: Error) => void;
};

export default function DownloadImageButton({
  base64URL,
  mimeType,
  children,
  onPressEvent,
  onPressOutEvent,
  onDownloadSuccess,
  onDownloadError
}: DownloadImageButtonProps) {
  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();
  
  const validateBase64URL = (url: string, type: string): string => {
    try {
      const prefix = `data:${type};base64,`;
      if (!url.startsWith(prefix)) {
        throw new Error('Invalid base64 URL format');
      }
      return url.split(prefix)[1];
    } catch (error) {
      throw new Error('Invalid base64 image data');
    }
  };

  async function downloadImage() {
    let tempFilePath = '';
    
    try {
      // Check permissions first
      if (!permissionResponse?.granted) {
        const permission = await requestPermission();
        if (!permission.granted) {
          throw new Error('Permission to access media library was denied');
        }
      }

      const base64Code = validateBase64URL(base64URL, mimeType);
      const fileExtension = mimeType.split("/")[1];
      tempFilePath = `${IMG_DIR}${uuid.v4()}.${fileExtension}`;

      // Ensure directory exists
      await ensureDirExists(IMG_DIR);
      
      // Save the file
      await FileSystem.writeAsStringAsync(tempFilePath, base64Code, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Create asset in media library
      const asset = await MediaLibrary.createAssetAsync(tempFilePath);
      
      if (!asset) {
        throw new Error('Failed to create asset in media library');
      }

      console.log('Image downloaded to media library!', asset);
      ToastAndroid.show('Image saved to Gallery', ToastAndroid.SHORT);
      
      onDownloadSuccess?.();

    } catch (error) {
      console.error("Error downloading image:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      Alert.alert(
        "Download Failed",
        `Unable to save image: ${errorMessage}`,
        [{ text: "OK" }]
      );
      onDownloadError?.(error instanceof Error ? error : new Error(errorMessage));
    } finally {
      // Clean up temporary file if it exists
      if (tempFilePath) {
        try {
          await FileSystem.deleteAsync(tempFilePath, { idempotent: true });
        } catch (cleanupError) {
          console.warn('Failed to clean up temporary file:', cleanupError);
        }
      }
    }
  }

  return (
    <Pressable
      style={({ pressed }) => [
        {
          ...styles.button,
          ["backgroundColor"]: pressed ? "#9999ff" : "#007bff",
          ["elevation"]: pressed ? 0 : 4,
        },
      ]}
      onPressIn={downloadImage}
      onPress={onPressEvent}
      onPressOut={onPressOutEvent}
    >
      {children}
    </Pressable>
  );
}
