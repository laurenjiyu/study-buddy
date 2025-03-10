import React, { useState, useEffect } from "react";
import { Image, StyleSheet } from "react-native";
import { workingImages } from "@/assets/imgPaths";

export default function WorkingAvatar({ avatarName }) {
  const [currentImage, setCurrentImage] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev === 1 ? 2 : 1));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const imageKey = `${avatarName}${currentImage}`;

  return (
    <Image
      source={workingImages[imageKey]}
      style={styles.avatarImg}
    />
  );
}

const styles = StyleSheet.create({
  avatarImg: {
    height: 400,
    width: 400,
    position: "absolute",
    marginTop: "75%",
  },
});
