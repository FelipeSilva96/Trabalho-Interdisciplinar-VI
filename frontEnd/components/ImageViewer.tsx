import { StyleSheet } from "react-native";
import { Image, ImageSource } from "expo-image";
import React from "react";



type Props = {
    imgSource: ImageSource | string | number | undefined;
    mainImage: boolean;
};

export default function ImageViewer ({imgSource, mainImage} : Props) {
    if (mainImage){    
        return (
            <Image source={imgSource} style={styles.mainStyle} contentFit="cover"/>
        );
    }

    else {
        return (
            <Image source={imgSource} style={styles.imgStyle} contentFit="cover"/>
        );
    }


}

const styles = StyleSheet.create({
    imgStyle:{
        width: 280,
        height: 280,
    },
    mainStyle:{
        width:100,
        height:100,
    }
})