import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import { Pressable, PressableProps, Alert } from "react-native";
import styles from "@/app/styles";

async function ensureDirExists(imgDir: string) {
  const dirInfo = await FileSystem.getInfoAsync(imgDir);

  if (!dirInfo.exists) {
    console.log("Temporary image directory doesn't exist, creating…");
    await FileSystem.makeDirectoryAsync(imgDir, { intermediates: true });
  }
}

const imgDir = FileSystem.documentDirectory + "Artiflex/";

type DownloadImageButtonProps = {
  base64String: string;
  mimeType: string;
  children?: PressableProps["children"];
};

export default function DownloadImageButton({
  base64String,
  mimeType,
  children,
}: DownloadImageButtonProps) {
  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions({
    writeOnly: true,
  });
  const base64Code = base64String.split(`data:${mimeType};bas64,`)[1];
  const fileExtension = mimeType.split("/")[1];
  const imgFileUri =
    imgDir +
    `${encodeURIComponent(`Artiflex_Generated_Image_${base64Code}`)}.${fileExtension}`;

  async function downloadImage() {
    if (permissionResponse?.status !== "granted") {
      await requestPermission();
    }

    if (permissionResponse?.granted) {
      try {
        await ensureDirExists(imgDir);
        console.log("Downloading the generated image");

        await FileSystem.StorageAccessFramework.writeAsStringAsync(
          imgFileUri,
          base64Code,
          {
            encoding: "base64",
          },
        );
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(imgFileUri);
          Alert.alert('File is available for sharing');
        } else {
          Alert.alert(
            "Your System doesn't support file sharing!",
            "Check if not downloaded, Take a screenshot instead!\n Sorry :(",
          );
        }
      } catch (error) {
        console.error(JSON.stringify(error));
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
      onPress={downloadImage}
      onPressIn={() => {
        Alert.alert("Image started downloading...");
      }}
    >
      {children}
    </Pressable>
  );
}
