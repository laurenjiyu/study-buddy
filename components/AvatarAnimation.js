/*  components/AvatarAnimation.js
    Animates the avatar to rock back and forth
 */
import { useRef, useEffect } from "react";
import { Animated, Image, StyleSheet, Easing } from "react-native"; // Import Easing correctly
import { avatarImages } from "@/assets/imgPaths";

export default function AnimatedAvatar({ avatarName }) {
  const tiltAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(tiltAnimation, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease), // Fixed this!
          useNativeDriver: true,
        }),
        Animated.timing(tiltAnimation, {
          toValue: 0,
          duration: 800,
          easing: Easing.inOut(Easing.ease), // Fixed this!
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const tiltInterpolation = tiltAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ["-10deg", "10deg"],
  });

  return (
    <Animated.Image
      source={avatarImages[avatarName]}
      style={[styles.avatarImg, { transform: [{ rotate: tiltInterpolation }] }]}
    />
  );
}

const styles = StyleSheet.create({
  avatarImg: {
    height: 400,
    width: 400,
    marginTop: 190,
    alignSelf: "center",
    resizeMode: "contain",
    position: "absolute",
    zIndex: -1,
  },
});
