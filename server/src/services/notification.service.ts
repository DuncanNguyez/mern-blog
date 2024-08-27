import Notification from "../models/notification.model";

const getNotificationByUser = async (
  userId: string | any,
  fromCreatedAt: string
) => {
  const notifications = await Notification.find(
    {
      userId,
      createdAt: { $gte: new Date(fromCreatedAt).toISOString() },
    },
    {},
    { sort: { createdAt: -1 } }
  );
  return notifications;
};
const readNotification = async (userId: string, ids: [string]) => {
  await Notification.updateMany(
    { userId, _id: { $in: ids } },
    { $set: { read: true } }
  );
};
export default { getNotificationByUser, readNotification };
