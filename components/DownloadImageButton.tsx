import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import Notifee from "@notifee/react-native";
import { Pressable, PressableProps, Alert } from "react-native";
import styles from "@/app/styles";

async function ensureDirExists(imgDir: string) {
  const dirInfo = await FileSystem.getInfoAsync(imgDir);

  if (!dirInfo.exists) {
    console.log("Artiflex image directory doesn't exist, creating…");
    await FileSystem.makeDirectoryAsync(imgDir, { intermediates : true});
  }
}

const imgDir = FileSystem.documentDirectory + "Artiflex/";

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
  const base64Code = base64URL.split(`data:${mimeType};bas64,`)[1];
  const fileExtension = mimeType.split("/")[1];
  const imgFileUri = `${imgDir}${encodeURIComponent(`Artiflex_Generated_Image_${base64Code}`)}.${fileExtension}`;

  async function downloadImage() {
    if (permissionResponse?.status !== "granted") {
      await requestPermission();
    }

    if (permissionResponse?.granted) {
      try {
        await ensureDirExists(imgDir);
        console.log("Downloading the generated image");

        await Notifee.createChannel({
          id: 'default',
          name: 'Default Channel',
        });

        const downloadResumableImage : FileSystem.DownloadResumable = FileSystem.createDownloadResumable(base64URL,imgFileUri);
        const imageDownloadResult = await downloadResumableImage.downloadAsync() as FileSystem.FileSystemDownloadResult;

        if (imageDownloadResult.status !== 200) {
          console.error(`File couldn't be downloaded!`);
          Alert.alert("File Could not be downloaded","Take a screenshot instead. :(");
          return;
        }

        const asset = await MediaLibrary.createAssetAsync(imageDownloadResult.uri);
        const album = await MediaLibrary.getAlbumAsync('Download');
        if (album == null) {
          await MediaLibrary.createAlbumAsync('Download', asset, false);
        } else {
          await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
        }

        console.log('Image downloaded!');
        await Notifee.displayNotification({
          title: 'Download Complete',
          body: 'Your image has been downloaded successfully!',
          android: {
            channelId: 'default',
          },
        });

        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(imageDownloadResult.uri);
          Alert.alert('File is available for sharing','Save to Albums if you need.');
        } else {
          Alert.alert(
            "Your System doesn't support file sharing!",
            "Check if not downloaded, Take a screenshot instead!\n Sorry :(",
          );
        }
      } catch (error) {
        console.error(JSON.stringify(error));
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
