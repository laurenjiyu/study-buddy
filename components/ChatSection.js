import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  View,
  TextInput,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  TouchableOpacity
} from "react-native";

export default function ChatSection({ visible, onClose }) {
  const inputRef = useRef(null);
  const [modalTopPosition, setModalTopPosition] = useState(null);

  useEffect(() => {
    if (visible) {
      const timeout = setTimeout(() => {
        try {
          inputRef.current?.focus();
        } catch (error) {
          console.error("Focus error:", error);
        }
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
      hardwareAccelerated
    >
      <TouchableWithoutFeedback
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalContent}
          >
            <TextInput
              ref={inputRef}
              style={styles.input}
              placeholder="Type your reply..."
              autoFocus
            />
            <View style={styles.rowOfOptions}>

            </View>
            <TouchableOpacity> </TouchableOpacity>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContent: {
    width: "100%",
    backgroundColor: "white",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    elevation: 5,
    minHeight: "40%",
  },
  input: {
    fontSize: 18,
    padding: 10,
    borderColor: "#ccc",
    borderRadius: 10,
    marginBottom: 5,
  },
});
