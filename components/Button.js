import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

import Theme from "@/assets/theme";

const CustomButton = ({ text, onPress, style, textStyle, clickable }) => {

  return (
    <TouchableOpacity onPress={onPress} style={[styles.button, style, clickable && styles.activeBackground]}>
      <Text style={[styles.text, clickable && styles.activeText]}>{text}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: Theme.colors.inactiveGray,     // default inactive
    paddingVertical: 8,
    paddingHorizontal: 15,
    minWidth:"95%",
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  activeBackground: {
    backgroundColor: Theme.colors.buttonBlue,
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Theme.colors.textInactive,
  },
  activeText: {
    color: Theme.colors.textPrimary,
  }
});

export default CustomButton;
