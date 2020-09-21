/*__DROPDOWN_TOGGLER__*/
$( ".dropdown-toggle" ).click( function( e ) {
  e.stopPropagation();
  let selector = $( this );
  selector.siblings( ".dropdown-menu" ).toggle();

  selector.attr( "aria-expanded" ) === "false" ?
    selector.attr( "aria-expanded", true ) :
    selector.attr( "aria-expanded", false );
} );

$( document ).click( function() {
  $( ".dropdown-menu" ).hide();
  $( ".dropdown-menu" ).siblings( ".dropdown-toggle" ).attr( "aria-expanded", false );
} );


/*__MODAL_CLOSER__*/
$( ".modal .close" ).click( function() {
  $( this ).parents( ".modal" ).hide();
  $( this ).parents( ".modal" ).attr( "aria-hidden", true );
  $( ".modal-backdrop" )[ 0 ].remove();

  if ( $( "body" ).attr( "style" ) === "overflow: hidden;" ) {
    $( "body" ).css( "overflow", "" );
  }
} );


/*__NOTIFICATION_HANDLER__*/
function NotificationCloseable( title, message, theme ) {
  window.createNotification( {
    closeOnClick: false,
    displayCloseButton: true,
    positionClass: "nfc-top-right",
    showDuration: 10 * 1000,
    theme: theme
  } )( {
    title: title,
    message: message
  } );
}

function Notification( title, message, theme ) {
  window.createNotification( {
    closeOnClick: false,
    displayCloseButton: false,
    positionClass: "nfc-top-right",
    showDuration: 5 * 1000,
    theme: theme
  } )( {
    title: title,
    message: message
  } );
}


/*__INPUT_HANDLER__*/
$( 'input[type=text]' ).keyup( function() {
  if ( this.classList.contains( "is-invalid" ) ) {
    this.classList.remove( "is-invalid" );
  }
} )

function form_invalid( selector ) {
  selector.classList.remove( "is-valid" );
  selector.classList.add( "is-invalid" );
}