import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { onboardingImages } from "@/assets/imgPaths";
import Theme from "@/assets/theme";

export default function TimeChoice({ time, chooseTime, chosen }) {
  return (
    <TouchableOpacity
      style={styles.feedbackBox}
      onPress={() => chooseTime(time)}
    >
      <Image source={onboardingImages[time.toLowerCase()]} style={styles.image} />
      <View style={[styles.textContainer, chosen == time && styles.chosen]}>
        <Text style={styles.title}>{time}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  feedbackBox: {
    alignItems: "center",
    padding: 2,
    borderRadius: 10,
    height: 120,
  },
  image: {
    width: 60,
    height: 60,
    resizeMode: "contain",
    marginBottom: -30,
    zIndex: 1,
  },
  textContainer: {
    flex: 1,
    backgroundColor: Theme.colors.lightGray,
    padding: 20,
    paddingTop: 30,
    borderRadius: 10,
  },
  chosen: {
    backgroundColor: Theme.colors.darkGray,
  },
  title: {
    fontSize: 17,
    fontWeight: "bold",
    color: Theme.colors.textPrimary,
  },
  description: {
    fontSize: 17,
  },
});
