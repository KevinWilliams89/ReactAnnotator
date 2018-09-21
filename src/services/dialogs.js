export const alert = (
  msg,
  { title = '', buttonName = 'OK', alertDismissed = function() {} } = {}
) => {
  if (window.navigator.notification) {
    setTimeout(() => {
      window.navigator.notification.alert(
        msg, // message
        alertDismissed, // callback
        title, // title
        buttonName // buttonName
      );
    }, 50);
  } else {
    window.alert(msg);
    if (typeof alertDismissed === 'function') {
      alertDismissed();
    }
  }
};

export const confirm = (
  msg,
  {
    title = '',
    buttonLabels = ['Yes', 'No'],
    confirmCallback = function() {}
  } = {}
) => {
  if (window.navigator.notification) {
    window.navigator.notification.confirm(
      msg,
      confirmCallback,
      title,
      buttonLabels
    );
  } else {
    window.alert(msg);
    if (typeof confirmCallback === 'function') {
      confirmCallback(1);
    }
  }
};
