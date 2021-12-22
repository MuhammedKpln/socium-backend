export const enum NotificationType {
  Follow = 1,
  CommentedToPost = 2,
  MessageRequestSended = 3,
  MessageRequestAccepted = 4,
}

export const NotificationTitle = {
  [NotificationType.CommentedToPost]:
    '{0} adlı kullanıcı gönderinize yorum yaptı',
  [NotificationType.Follow]: '{0} adlı kullanıcı artık sizi takip ediyor.',
  [NotificationType.MessageRequestSended]:
    '{0} adlı kullanıcı size bir mesaj isteği gönderdi!',
  [NotificationType.MessageRequestAccepted]:
    '{0} adlı kullanıcı mesaj isteğinizi kabul etti!',
};
