import * as Notifications from "expo-notifications";

// Configure how notifications behave when received
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

// Request notification permissions if not already granted
export async function requestNotificationPermissions() {
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== "granted") {
    await Notifications.requestPermissionsAsync();
  }
}

// Schedule a notification to alert the user when the break is over
export async function scheduleBreakNotification(durationInSeconds) {
  console.log("break duration: ", durationInSeconds);
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Break Over!",
      body: "Time to get back to work! I'm itching to finish up my homework.",
    },
    trigger: { date: new Date(Date.now() + durationInSeconds * 1000) },
  });
}

// Cancel all scheduled notifications (if break is canceled or adjusted)
export async function cancelAllScheduledNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
