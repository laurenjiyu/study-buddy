import { useState } from "react";
import {
  Text,
  StyleSheet,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import ChoiceButton from "@/components/ChoiceButton"; 
import Button from "@/components/Button";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';

import Theme from "@/assets/theme";
import { onboardingImages } from "@/assets/imgPaths"; 

export default function FeedbackQ() {
  const [chosenFeedback, setFeedback] = useState("");
  const navigation = useNavigation();

  // Map the preferred feedback
  const feedbackOptions = {
    "positive": {
      title: "Positive vibes",
      desc: "I benefit from optimism and cheerfulness!",
      avatar: "Positive Percy",
      image: onboardingImages["positive"]
    },
    "tough": {
      title: "Tough love",
      desc: "I need someone to whip me into shape!",
      avatar: "Sassy Mary",
      image: onboardingImages["tough"]
    },
    "gentle": {
      title: "Gentle support",
      desc: "I'm a calm, words-of-affirmation person.",
      avatar: "Gentle Joey",
      image: onboardingImages["gentle"]
    }
  };

  const chooseFeedback = (chosenOption) => {
    setFeedback(chosenOption);
  };

  const confirmFeedback = async () => {
    try {
      if (!chosenFeedback) return;
      await AsyncStorage.setItem("preferred_avatar", feedbackOptions[chosenFeedback].avatar);
      console.log("Chose feedback type:", chosenFeedback);
      navigation.navigate("TimeQ");
    } catch (err) {
      console.error("Unexpected error updating chosen feedback:", err.message);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.circle} />

      <Text style={styles.note}>
        Answer a few questions to help us learn your study habits!
      </Text>
      <Text style={styles.question}>
        What kind of feedback do you like the most?
      </Text>

      <View style={styles.choices}>
        {Object.entries(feedbackOptions).map(([key, option]) => (
          <ChoiceButton
            key={key}
            choice={key}
            actionFunction={chooseFeedback}
            imageSrc={option.image}
            title={option.title}
            desc={option.desc}
            currentChoice={chosenFeedback}
          />
        ))}
      </View>

      <Button
        style={styles.button}
        text="Next"
        onPress={confirmFeedback}
        clickable={chosenFeedback !== ""}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 60,
    padding: 30,
    backgroundColor: Theme.colors.backgroundPrimary,
    flex: 1,
  },
  circle: {
    position: "absolute",
    bottom: -50,
    alignSelf: "center",
    width: 450,
    height: 500,
    borderRadius: 150,
    backgroundColor: "white",
  },
  note: {
    fontSize: 18,
    textAlign: "center",
    margin: 30,
    color: Theme.colors.textSecondary,
  },
  question: {
    fontSize: 25,
    textAlign: "center",
    fontWeight: "bold",
    alignSelf: "center",
    marginBottom: 30,
  },
  choices: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
  },
  button: {
    padding: 8,
    position: "absolute",
    bottom: 150,
  },
});
