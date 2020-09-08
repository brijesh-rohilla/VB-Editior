/*__DROPDOWN_HANDLER__*/
$('.dropdown-toggle').on('click', function(e) {
  e.stopPropagation();
  let selector = $(this);
  selector.siblings(".dropdown-menu").toggle();
  if (selector.attr('aria-expanded') === 'false') {
    selector.attr('aria-expanded', true);
  } else {
    selector.attr('aria-expanded', false);
  }
});

$(document).click(function() {
  $('.dropdown-menu').hide();
  $('.dropdown-menu').siblings(".dropdown-toggle").attr('aria-expanded', false);
});


/*__MODAL_HANDLER__*/
$('.modal .close').click(function() {
  $(this).parents('.modal').hide();
  $(this).parents('.modal').attr('aria-hidden', true);
  $('.modal-backdrop')[0].remove();
  if ($('body').attr('style') === 'overflow: hidden;') {
    $('body').removeAttr('style');
  } else {
    $('body').css('overflow', 'auto');
  }
});

/*__NOTIFICATION_HANDLER__*/
function NotificationCloseable(title, message, theme) {
  window.createNotification({
    closeOnClick: false,
    displayCloseButton: true,
    positionClass: 'nfc-top-right',
    showDuration: 10 * 1000,
    theme: theme
  })({
    title: title,
    message: message
  });
}

function Notification(title, message, theme) {
  window.createNotification({
    closeOnClick: false,
    displayCloseButton: false,
    positionClass: 'nfc-top-right',
    showDuration: 5 * 1000,
    theme: theme
  })({
    title: title,
    message: message
  });
}

function form_invalid(selector) {
  selector.classList.remove('is-valid');
  selector.classList.add('is-invalid');
};