import {
  Text,
  Alert,
  StyleSheet,
  View,
  Image,
  TextInput,
  TouchableOpacity,
} from "react-native";


import Theme from "@/assets/theme";

const avatarDict = {"Positive Percy": "Stays positive even in the hardest times",
  "Sassy Mary": "Gets a little feisty and will put you to work",
  "Gentle Joey": "Understanding and very forgiving at all times",
  };

const avatarImages = {
  "Positive Percy": require("@/assets/avatar/positive-percy.png"),
  "Sassy Mary": require("@/assets/avatar/sassy-mary.png"),
  "Gentle Joey": require("@/assets/avatar/gentle-joey.png"),
};

export default function AvatarChoice({ avatar, alignment, chooseAvatar, chosen }) {
  const selectAvatar = () => {
    chooseAvatar(avatar);
    console.log(avatar);
  };

  return (
    <View style={styles.biggerContainer}>
      {alignment === "left" ? (
        <>
          <TouchableOpacity 
            style={[styles.grayRectangle, chosen && styles.selected]} 
            onPress={selectAvatar}
            activeOpacity={0.7}
          >
            <View style={styles.textSectionLeft}>
              <Text style={styles.name}>{avatar}</Text>
              <Text>{avatarDict[avatar]}</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={selectAvatar} activeOpacity={0.7}>
            <Image source={avatarImages[avatar]} style={styles.imgLeft} />
          </TouchableOpacity>
        </>
      ) : (
        <>
          <TouchableOpacity 
            style={[styles.grayRectangle, chosen && styles.selected]} 
            onPress={selectAvatar}
            activeOpacity={0.7}
          >
            <View style={styles.textSectionRight}>
              <Text style={styles.name}>{avatar}</Text>
              <Text>{avatarDict[avatar]}</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={selectAvatar} activeOpacity={0.7}>
            <Image source={avatarImages[avatar]} style={styles.imgRight} />
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}


const styles = StyleSheet.create({
  name: {
    fontWeight: "bold",
    fontSize: 22,
    paddingBottom: 1,
  },
  biggerContainer: {
    height: 150,
    justifyContent: "center",
  },
  textSectionLeft: {
    marginLeft: 80,
    justifyContent: "center",
  },
  textSectionRight: {
    marginRight: 80,
    textAlign: "right",
    justifyContent: "center",
  },
  grayRectangle: {
    justifyContent: "center",
    padding: 20,
    margin: 30,
    borderRadius: 15,
    backgroundColor: Theme.colors.lightGray,
  },
  selected: {
    backgroundColor: Theme.colors.darkGray,
  },
  imgLeft: {
    position: "absolute",
    maxHeight: 180,
    resizeMode: "contain",
    top: -180,
    left: -170,
    zIndex: 1,
  },
  imgRight: {
    position: "absolute",
    maxHeight: 180,
    resizeMode: "contain",
    top: -180,
    right: -180,
    zIndex: 1,
  },
});
