// DownloadImageButton.tsx
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import Notifee from "@notifee/react-native";
import { Pressable, PressableProps, Alert } from "react-native";
import styles from "@/app/styles";
import uuid from 'react-native-uuid'; // Import a UUID generator

async function ensureDirExists(imgDir: string) {
  const dirInfo = await FileSystem.getInfoAsync(imgDir);

  if (!dirInfo.exists) {
    console.log("Artiflex image directory doesn't exist, creating…");
    await FileSystem.makeDirectoryAsync(imgDir, { intermediates : true});
  }
}

const imgDir = FileSystem.cacheDirectory + "Artiflex/"; // Use cacheDirectory for temporary files

type DownloadImageButtonProps = {
  base64URL: string;
  mimeType: string;
  children?: PressableProps["children"];
  onPressEvent?: PressableProps["onPress"];
  onPressOutEvent?: PressableProps["onPressOut"];
};

export default function DownloadImageButton({
  base64URL,
  mimeType,
  children,
  onPressEvent,
  onPressOutEvent
}: DownloadImageButtonProps) {
  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();
  const base64Code = base64URL.split(`data:${mimeType};base64,`)[1];
  const fileExtension = mimeType.split("/")[1];
  const tempFilePath = `${imgDir}${uuid.v4()}.${fileExtension}`; // Create a unique temporary file name

  async function downloadImage() {
    if (permissionResponse?.status !== "granted") {
      await requestPermission();
    }

    if (permissionResponse?.granted) {
      try {
        await ensureDirExists(imgDir);
        console.log("Saving base64 image to temporary file...");

        await FileSystem.writeAsStringAsync(tempFilePath, base64Code, {
          encoding: FileSystem.EncodingType.Base64,
        });

        console.log("Temporary file saved:", tempFilePath);

        await Notifee.createChannel({
          id: 'default',
          name: 'Default Channel',
        });

        const asset = await MediaLibrary.createAssetAsync(tempFilePath);
        const album = await MediaLibrary.getAlbumAsync('Download');
        if (album == null) {
          await MediaLibrary.createAlbumAsync('Download', asset, false);
        } else {
          await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
        }

        console.log('Image downloaded to media library!');
        await Notifee.displayNotification({
          title: 'Download Complete',
          body: 'Your image has been downloaded successfully!',
          android: {
            channelId: 'default',
          },
        });

        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(asset.uri); // Share the asset URI
          Alert.alert('File is available for sharing','Save to Albums if you need.');
        } else {
          Alert.alert(
            "Your System doesn't support file sharing!",
            "Check your gallery for the downloaded image.\n Sorry :(",
          );
        }

        // Optionally clean up the temporary file
        FileSystem.deleteAsync(tempFilePath);

      } catch (error) {
        console.error("Error downloading image:", error);
        Alert.alert("File Could not be downloaded","Take a screenshot instead. :(");
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
