export const enum Queues {
  Notification = 'notification',
  SendNotification = 'sendNotification',
  ForgotPassword = 'forgotPassword',
}
export const enum QueueEvents {
  SendForgotPasswordCode = 'sendForgotPasswordCode',
}

export type PBool = Promise<boolean>;
export type P<T> = Promise<T>;
