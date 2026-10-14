import { Platform } from "react-native";

const configured = process.env.EXPO_PUBLIC_API_URL?.trim();
const fallback = Platform.OS === "android" ? "http://10.0.2.2:8080" : "http://localhost:8080";

export default (configured || fallback).replace(/\/$/, "");
