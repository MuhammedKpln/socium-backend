export const enum NotificationType {
  Follow = 1,
  CommentedToPost = 2,
}

export const NotificationTitle = {
  [NotificationType.CommentedToPost]:
    '{0} adlı kullanıcı gönderinize yorum yaptı',
  [NotificationType.Follow]: '{0} adlı kullanıcı artık sizi takip ediyor.',
};
