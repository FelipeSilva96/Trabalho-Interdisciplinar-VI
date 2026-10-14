import { Stack } from "expo-router";
import React from "react";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="separateScreens/imagemSelecionada" options={{ title: "Sua imagem" }} />
      <Stack.Screen name="separateScreens/resultado" options={{ title: "Resultado" }} />
    </Stack>
  );
}
