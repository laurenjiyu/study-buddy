import * as Notifications from "expo-notifications";
import { getCompletion } from "@/app/OpenAI";

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
export async function scheduleBreakNotification(durationInSeconds, workPrompt) {
  // Get custom notification based on the persona
  const customAvatarNotif = await getCompletion(workPrompt);

  console.log("notif: ", customAvatarNotif);

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Break Over!",
      body: customAvatarNotif,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: durationInSeconds,
    },  });
}

// Cancel all scheduled notifications (if break is canceled or adjusted)
export async function cancelAllScheduledNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
