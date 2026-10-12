
import { Platform } from "react-native";

// Escolha o endereço adequado ao ambiente em que o app roda.
const API_URL = Platform.OS === "android"
  ? "http://192.168.18.16:8080"
  : "http://localhost:8080";

export default API_URL;
