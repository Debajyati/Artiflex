import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    backgroundColor: "#003566",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    height: 40,
    margin: 10,
    backgroundColor: "white",
    borderWidth: 3,
    borderRadius: 5,
    borderColor: "#0faffa",
    padding: 20,
    paddingVertical: 0,
  },
  button: {
    backgroundColor: "#007bff",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    elevation: 4,
    marginVertical: 10,
    marginHorizontal: 12,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  imageContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  imageLabel: {
    fontSize: 16,
    marginBottom: 5,
  },
  image: {
    width: 300,
    height: 300,
    borderColor: "#ccc",
    borderWidth: 1,
  },
});

export default styles;
