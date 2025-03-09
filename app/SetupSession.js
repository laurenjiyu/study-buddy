import { useState, useEffect, useRef } from "react";
import {
  Text,
  Alert,
  Image,
  StyleSheet,
  View,
  Animated,
  Easing,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useNavigation } from "@react-navigation/native";
import db from "@/database/db";
import Button from "@/components/Button";
import TextBubble from "@/components/TextBubble";
import Theme from "@/assets/theme";
import { avatarImages, bgImages } from "@/assets/imgPaths";
import { avatarWelcome } from "@/assets/avatarInfo";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6"; // Import FontAwesome for back icon

export default function AboutAvatar() {
  const [avatarId, setAvatarId] = useState(null);
  const [avatarName, setAvatarName] = useState("Loading...");
  const [avatarDesc, setAvatarDesc] = useState("Loading...");
  const [isLoading, setIsLoading] = useState(true);
  const [chosenBg, chooseBg] = useState("bedroom");

  const navigation = useNavigation();
  const tiltAnimation = useRef(new Animated.Value(0)).current;

  const getBgImage = (name) => bgImages[chosenBg];
  const getAvatarImage = (name) => avatarImages[name];

  const fetchAvatar = async () => {
    try {
      setIsLoading(true);

      const { data: userInfo, error: userInfoError } = await db
        .from("user-info")
        .select("chosen_avatar, chosen_background")
        .eq("id", 1)
        .maybeSingle();

      if (userInfoError || !userInfo?.chosen_avatar) {
        console.error("Error fetching user-info:", userInfoError?.message);
        setAvatarName("Unknown");
        setAvatarDesc("No description available.");
        setIsLoading(false);
        return;
      }

      const avatarId = userInfo.chosen_avatar;
      setAvatarId(avatarId);
      chooseBg(userInfo.chosen_background);
      console.log("Fetched Avatar ID:", avatarId);

      const { data: avatarData, error: avatarError } = await db
        .from("avatar-options")
        .select("name, intro_desc")
        .eq("id", avatarId)
        .maybeSingle();

      if (avatarError || !avatarData) {
        console.error("Error fetching avatar details:", avatarError?.message);
        setAvatarName("Unknown");
        setAvatarDesc("No description available.");
        setIsLoading(false);
        return;
      }

      setAvatarName(avatarData.name);
      setAvatarDesc(avatarData.intro_desc);
      console.log("Fetched Avatar:", avatarData.name, avatarData.intro_desc);
    } catch (err) {
      console.error("Unexpected error fetching avatar:", err.message);
      setAvatarName("Unknown");
      setAvatarDesc("No description available.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAvatar();
  }, []);

  // Animations for avatar
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(tiltAnimation, {
          toValue: 1,
          duration: 800, // Adjust duration for smooth effect
          easing: Easing.inOut(Easing.ease), // Smooth acceleration & deceleration
          useNativeDriver: true,
        }),
        Animated.timing(tiltAnimation, {
          toValue: 0,
          duration: 800, // Keep same duration for symmetry
          easing: Easing.inOut(Easing.ease), // Smooth transition back
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);
  
  const tiltInterpolation = tiltAnimation.interpolate({
    inputRange: [0, 1], 
    outputRange: ["-10deg", "10deg"], // Smooth swaying motion
  });

  const bubbleContents = (
    <View>
        <Text style={styles.text}>{avatarWelcome[avatarName]}</Text>
    </View>
    );
  
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      {/* Background Image */}
      <Image source={getBgImage(chosenBg)} style={styles.backgroundImg} />
      
      <Animated.Image
        source={getAvatarImage(avatarName)}
        style={[styles.avatarImg, { transform: [{ rotate: tiltInterpolation }] }]}
      />
      
      <TextBubble moreStyle={styles.textBubble} contents={bubbleContents} ></TextBubble>

      <Button
        style={styles.button}
        clickable={true}
        text="Next"
        onPress={() => navigation.navigate("NextScreen")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  button: {
    marginTop: 30,
    position: "absolute",
    bottom: 200,
    zIndex: 2,
  },
  textBubble: {
    top: 120, // Adjust as needed
    alignSelf: "center",
    zIndex: 1, // Ensures it's on top of avatar
  },
  text: {
    fontSize: 20,
    textAlign: "center",
    alignSelf: "center",
  },
  avatarImg: {
    height: 400,
    width: 400,
    marginTop: 190,
    alignSelf: "center",
    resizeMode: "contain",
    position: "absolute",
    zIndex: -1,
  },
  backgroundImg: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    zIndex: -2,
  },
});

