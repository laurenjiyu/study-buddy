import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import Theme from "@/assets/theme";


export default function ChoiceButton({ choice, actionFunction, imageSrc, title, desc, currentChoice }) {
  return (
    <TouchableOpacity style={styles.box}  onPress={() => actionFunction(choice)}>
      <View style={styles.leftHalf}>
        <Image source={imageSrc} style={styles.image} />
      </View>
      <View style={[styles.textContainer, choice==currentChoice && styles.chosen]}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{desc}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: "row",
    alignItems: "center",
    padding: 2,
    borderRadius: 10,
  },
  leftHalf: {
    marginRight: 10,
  },
  image: {
    width: 60,
    height: 60,
    resizeMode: "contain",
    marginRight: -30,
    zIndex: 1,
  },
  textContainer: {
    flex: 1,
    backgroundColor: Theme.colors.lightGray,
    padding: 15,
    borderRadius: 10,
    paddingLeft: 50,
    marginBottom: 10,
  },
  chosen: {
    backgroundColor: Theme.colors.darkGray,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: Theme.colors.textPrimary,
  },
  description: {
    fontSize: 17,
  },
});
