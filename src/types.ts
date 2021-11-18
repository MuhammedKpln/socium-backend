export const enum Queues {
  Notification = 'notification',
  SendNotification = 'sendNotification',
  ForgotPassword = 'forgotPassword',
  MinifyAvatar = 'minify-avatar',
}
export const enum QueueEvents {
  SendForgotPasswordCode = 'sendForgotPasswordCode',
  MinifyAvatar = 'minify-user-avatar',
}

export type PBool = Promise<boolean>;
