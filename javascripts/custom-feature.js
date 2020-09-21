( function() {

  "use strict";

  $( '.nav-right>.btn:last' ).text( 'Download' );

  function parseSourceCode() {
    let editor = $( '#text-editor' );
    let str = editor.text();
    let patt = /<.+?>/g;
    let patt1 = /".+?"/g;

    return str.replace( patt, function( c ) {
      let parseValue = c.replace( patt1, function( g ) {

        // replace inage data to path string.
        if ( g.split( ':' )[ 0 ] === '"data' ) {
          return `"../path/to/image"`;
        } else {
          return g;
        }

      } )

      return parseValue;
    } );

  }


} )();

//===========================================================