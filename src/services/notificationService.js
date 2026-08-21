import { Platform } from 'react-native';

let Notifications = null;

if (Platform.OS !== 'web') {
  try {
    Notifications = require('expo-notifications');
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  } catch (err) {
    console.warn('expo-notifications module load error:', err);
  }
}

/**
 * Request Notification Permissions & Create Android Notification Channel
 */
export async function requestNotificationPermissions() {
  if (Platform.OS === 'web' || !Notifications) {
    return false;
  }
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return false;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default-task-reminders', {
        name: 'Task Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#38BDF8',
        sound: 'default',
      });
    }

    return true;
  } catch (err) {
    console.error('Error requesting notification permissions:', err);
    return false;
  }
}

/**
 * Schedule a local push notification for a task at a specific Date & Time
 * @param {string} title Task title
 * @param {Date} date Date object when notification should trigger
 * @returns {Promise<string|null>} notificationId
 */
export async function scheduleTaskNotification(title, date) {
  if (Platform.OS === 'web' || !Notifications) {
    return null;
  }
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) return null;

    const now = new Date();
    if (date.getTime() <= now.getTime()) {
      date = new Date(now.getTime() + 5000);
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: '📌 Task Reminder',
        body: title,
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.HIGH,
        data: { title },
      },
      trigger: {
        date,
        channelId: Platform.OS === 'android' ? 'default-task-reminders' : undefined,
      },
    });

    return notificationId;
  } catch (err) {
    console.error('Error scheduling notification:', err);
    return null;
  }
}

/**
 * Cancel a scheduled notification
 * @param {string} notificationId
 */
export async function cancelTaskNotification(notificationId) {
  if (Platform.OS === 'web' || !Notifications || !notificationId) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (err) {
    console.error('Error cancelling notification:', err);
  }
}
