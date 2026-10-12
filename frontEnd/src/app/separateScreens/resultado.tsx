import { useLocalSearchParams } from "expo-router";
import { Text, View, StyleSheet } from "react-native";

export default function Resultado() {
  const { data } = useLocalSearchParams<{data : string}>();

  return (
    <>
      <Text>resultados obtidos:</Text>
      <Text>{data}</Text>
    </>
  );
}