import React, { useState, useEffect, useRef } from "react";
import { Text, View, StyleSheet, TouchableOpacity, Animated } from "react-native";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import WorkingAvatar from "@/components/WorkingAvatar";

export default function WorkSession({ sessionDuration, onQuit, avatarName }) {
    const [timerSeconds, setTimerSeconds] = useState(0);
    const [timerPaused, setTimerPaused] = useState(false);
    const timerRef = useRef(null);
    const progressAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (!timerPaused) {
            timerRef.current = setInterval(() => {
                setTimerSeconds((prev) => {
                    if (prev >= sessionDuration) {
                        clearInterval(timerRef.current);
                        return sessionDuration;
                    }
                    return prev + 1;
                });
            }, 1000);
        }

        return () => clearInterval(timerRef.current);
    }, [timerPaused]);

    useEffect(() => {
        Animated.timing(progressAnim, {
            toValue: timerSeconds / sessionDuration,
            duration: 1000,
            useNativeDriver: false,
        }).start();
    }, [timerSeconds]);

    const handlePause = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        setTimerPaused(true);
    };

    const handleResume = () => {
        if (!timerRef.current) {
            setTimerPaused(false);
        }
    };

    const handleQuit = () => {
        clearInterval(timerRef.current);
        onQuit();
    };

    // Format time as HH:MM:SS
    const formatTime = (totalSeconds) => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    };

    return (
        <>
        <WorkingAvatar avatarName={avatarName}/>
        <View style={styles.container}>

            <View style={styles.timerContainer}>
                <Text style={styles.timerText}>{formatTime(sessionDuration - timerSeconds)}</Text>
            </View>

            <View style={styles.progressContainer}>
                <Text style={styles.progressTitle}>Working - {Math.floor(sessionDuration / 60)} min</Text>
                <Text style={styles.progressSubtitle}>{Math.floor((sessionDuration - timerSeconds) / 60)} min remaining</Text>
                <View style={styles.progressBackground}>
                    <Animated.View 
                        style={[
                            styles.progressFill, 
                            { width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] }) }
                        ]}
                    />
                </View>
            </View>

            <View style={styles.controls}>
                <TouchableOpacity style={styles.controlButton}>
                    <FontAwesome6 name="forward-fast" size={20} color="black" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.controlButton} onPress={timerPaused ? handleResume : handlePause}>
                    <FontAwesome6 name={timerPaused ? "play" : "pause"} size={20} color="black" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.controlButton} onPress={handleQuit}>
                    <FontAwesome6 name="xmark" size={20} color="black" />
                </TouchableOpacity>
            </View>
        </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    timerContainer: {
        position: "absolute",
        top: 90,
        transform: [{ translateX: 85 }],
        backgroundColor: "#94B2A7",
        paddingVertical: 10,
        paddingHorizontal: 25,
        borderRadius: 10,
    },
    timerText: {
        fontSize: 28,
        color: "black",
        fontWeight: "bold",
    },
    progressContainer: {
        position: "absolute",
        bottom: 100,
        width: "85%",
        backgroundColor: "#94B2A7",
        padding: 15,
        borderRadius: 12,
    },
    progressTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "black",
    },
    progressSubtitle: {
        fontSize: 14,
        color: "black",
        marginBottom: 5,
    },
    progressBackground: {
        height: 8,
        borderRadius: 5,
        backgroundColor: "#fff",
        overflow: "hidden",
    },
    progressFill: {
        height: "100%",
        backgroundColor: "black",
        borderRadius: 5,
    },
    controls: {
        position: "absolute",
        bottom: 30,
        flexDirection: "row",
        justifyContent: "space-around",
        width: "60%",
    },
    controlButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 2,
        borderColor: "black",
        justifyContent: "center",
        alignItems: "center",
    },
});
