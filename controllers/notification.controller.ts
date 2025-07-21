import { Request, Response, NextFunction } from "express";
import NotificationModel from "../models/notification_model";
import ErrorHandler from "../utils/errorHandler";
import catchAsyncError from "../middlewares/catchAsyncError";
import cron from "node-cron";

export const getAllNotifications = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  // Optional: filter notifications by user ID if req.user is set
  const userId = req.user?._id;

  const filter = userId ? { userId } : {};

  const notifications = await NotificationModel.find(filter).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: notifications.length,
    notifications,
  });
});

export const updateNotification = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  const notificationId = req.params.id;
  const updateData = req.body;

  const notification = await NotificationModel.findById(notificationId);

  if (!notification) {
    return next(new ErrorHandler("Notification not found", 404));
  }

  // Optional: verify ownership, e.g.
  // if (notification.userId.toString() !== req.user._id.toString()) {
  //   return next(new ErrorHandler("Unauthorized", 401));
  // }

  // Update fields
  Object.assign(notification, updateData);

  await notification.save();

  res.status(200).json({
    success: true,
    message: "Notification updated successfully",
    notification,
  });
});


// Run every day at 2 AM
cron.schedule("0 2 * * *", async () => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const result = await NotificationModel.deleteMany({
      status: "read",
      createdAt: { $lte: thirtyDaysAgo },
    });

    console.log(
      `[CRON] Deleted ${result.deletedCount} old read notifications`
    );
  } catch (err) {
    console.error("[CRON ERROR] Failed to clean up notifications:", err);
  }
});