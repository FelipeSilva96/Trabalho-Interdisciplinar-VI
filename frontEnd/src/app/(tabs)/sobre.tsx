import { Stack } from "expo-router";
import { StackScreen } from "expo-router/build/layouts/stack-utils";
import React from "react";
import { Text, View, StyleSheet } from "react-native";

export default function sobre() {
    return (
        <View>
            <Text>Sobre o app</Text>
            <Text> classifica resíduo é uma ferramenta para auxiliar na correta segregação do resíduo utilizando
                inteligência artificial para identificar tipos de lixo e as cores correspondentes do CONAMA
            </Text>

            <Text>Nosso objetivo é facilitar a reciclagem e promover a sustentabilidade</Text>

            <Text>Versão 1.0</Text>
        </View>
    );
}