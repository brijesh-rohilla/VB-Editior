( function() {

  "use strict";

  const EDITOR = "text-editor";
  const NOT_EDITABLE_CONTENT = ".img-h";
  const NOT_LINE_BREAK_CONTENT = "ol ul";

  const ALIGN_CLASSES = "text-left text-center text-right text-justify";
  const COLOR_CLASSES = "text-primary text-secondary text-success text-info text-warning text-danger";

  var lastPressedKey, lastSelector, ctrlKey, shiftKey, altKey;


  // listener for keys perssed
  $( document ).on( {
    keydown: function( event ) {
      if ( event.ctrlKey ) {
        ctrlKey = true;
      }
      if ( event.shiftKey ) {
        shiftKey = true;
      }
      if ( event.altKey ) {
        altKey = true;
      }
    },
    keyup: function( event ) {
      ctrlKey = false;
      shiftKey = false;
      altKey = false;
    }
  } );


  // adjuct Editor and sidebar on screen
  let customHeight = $( 'body' )[ 0 ].getBoundingClientRect().height - $( 'aside' )[ 0 ].getBoundingClientRect().top;
  $( 'main, aside' ).css( { 'height': customHeight } );

  // sidebar slider
  $( '#editor-tool-slider' ).click( function() {
    let selector = $( this );
    if ( selector.attr( 'aria-expanded' ) === 'true' ) {
      $( 'aside' ).css( { 'margin-right': '-13.5rem', 'transition': 'all 0.3s' } );
      selector
        .empty()
        .append( $( '<span></span>' ).attr( 'data-feather', 'chevron-left' ) )
        .attr( 'aria-expanded', false );
      feather.replace();
    } else {
      $( 'aside' ).css( { 'margin-right': '0rem', 'transition': 'all 0.3s' } );
      selector
        .empty()
        .append( $( '<span></span>' ).attr( 'data-feather', 'chevron-right' ) )
        .attr( 'aria-expanded', true );
      feather.replace();
    }
  } )




  /*!
   * VB-Editor {section}
   * Handle {factory()} selected element editable, noteditable or innereditable.
   * Handle toolbar and fill empty elements.
   * Attetch linebreak when press enter.
   * .call fn passed arg as `node` object else `jquary` object.
   */
  $( "#" + EDITOR ).on( "click mousedown", function( event ) {
    let selector = event.target.closest( "#" + EDITOR + ">*" );

    if ( !selector && lastSelector ) {
      lastSelector
        .removeClass( 'sl-elm n-sl-elm' )
        .removeAttr( 'contentEditable' );
      fillEmptyElement();
      lastSelector = null;
      $( '.toolbar' ).hide( 10 );
    }

    if ( !selector ) return;

    // stop selecting already selected element
    // only toolbar position changed alongside cursor.
    if ( selector.classList.contains( 'sl-elm' || 'n-sl-elm' ) ) {
      showToolBar( $( selector ), event );
      return;
    }

    // unselect last active element.
    if ( lastSelector ) {
      lastSelector
        .removeClass( 'sl-elm n-sl-elm' )
        .removeAttr( 'contentEditable' );
    }

    factory.call( selector );
  } );


  function factory() {
    let selector = $( this );
    let isFound = false;
    fillEmptyElement();

    // select `noteditable` content if present.
    NOT_EDITABLE_CONTENT.split( " " ).forEach( ( element ) => {
      if ( selector.hasClass( element.split( "." )[ 1 ] ) ) {
        notEditableContent.call( this );
        isFound = true;
      }
    } )

    // here all elemant are `editable`.
    if ( !isFound ) {
      editableContent.call( this );
    }
  }



  function editableContent() {
    let selector = $( this );

    if ( selector.hasClass( 'dam' ) ) {
      selector.empty().removeClass( 'dam' );
    }

    selector.addClass( 'sl-elm' );
    this.contentEditable = true;
    lastSelector = $( this );

    showToolBar( selector, event );
    lineBreak.call( this );

    selector[ 0 ].onselectstart = function() {
      joinElem( selector[ 0 ] );
    }

  }


  function notEditableContent() {
    let selector = $( this );

    selector.addClass( 'n-sl-elm' );
    lastSelector = $( this );

    showToolBar( selector, event );
  }



  function lineBreak() {
    let selector = $( this );
    let isLineBreak = true;

    // disable linebreake on press enter.
    // e.g. (ol, ul)
    NOT_LINE_BREAK_CONTENT.split( " " ).forEach( function( element ) {
      if ( selector[ 0 ].nodeName.toLowerCase() === element ) {
        isLineBreak = false;
      }
    } );

    selector.off( 'keydown' ).keydown( function( event ) {
      if ( event.keyCode === 13 && isLineBreak ) {
        let selection = window.getSelection();
        event.preventDefault();

        if ( selection.isCollapsed ) {
          let range = selection.getRangeAt( 0 );
          let selectorChild = selection.anchorNode;
          range.insertNode( document.createElement( 'br' ) );

          if ( selection.anchorOffset === selectorChild.length ) {
            if ( selectorChild.data === selector.text().substr( -selectorChild.length, selectorChild.length ) && lastPressedKey !== 8 ) {
              range.insertNode( document.createElement( 'br' ) );
            }
          }
          selection.collapseToEnd();
        }
      }
      lastPressedKey = event.keyCode;
    } )

  }


  function fillEmptyElement() {
    let notFill = "br, hr, " + NOT_EDITABLE_CONTENT;
    let customText = 'Write Somthing ...';

    let emptyElement = $( '#text-editor>*:not(' + notFill + '):empty' );
    emptyElement.addClass( 'dam' ).text( customText );

    let selector = $( '#text-editor>*:not(' + notFill + ')' );
    selector.each( function( element ) {
      if ( this.textContent.length === customText.length && this.textContent === customText ) {
        $( this ).addClass( 'dam' );
      }
    } );

  }


  function showToolBar( element, event ) {
    let selector = element[ 0 ];
    let mouseTop = event.pageY;
    let mouseLeft = event.pageX / 3.5;
    let posTop = selector.getBoundingClientRect().top;
    let posLeft = selector.getBoundingClientRect().left;
    $( '#btn-list-unstyled' ).hide();

    // show {btn-list-unstyled} button if selected element is a list.
    NOT_LINE_BREAK_CONTENT.split( " " ).forEach( function( elem ) {
      if ( selector.nodeName.toLowerCase() === elem ) {
        $( '#btn-list-unstyled' ).show();
      }
    } );

    if ( element.hasClass( 'img-h' ) ) {
      $( '#text-toolbar' ).hide( 10 );
      $( '#img-toolbar' ).css( { 'top': ( posTop - 65 ), 'left': posLeft } ).show();
    } else {
      $( '#img-toolbar' ).hide( 10 );
      if ( mouseTop < 220 ) {
        $( '#text-toolbar' ).css( { 'top': ( mouseTop + 30 ), 'left': ( posLeft + mouseLeft ) } ).show();
      } else {
        $( '#text-toolbar' ).css( { 'top': ( mouseTop - 80 ), 'left': ( posLeft + mouseLeft ) } ).show();
      }
    }

  }

  // Hide selected element toolbar
  $( 'aside, aside .btn, header, #editor-nav' ).click( function( event ) {
    if ( lastSelector && !ctrlKey ) {
      $( '.toolbar' ).hide( 10 );
    }
  } );



  /*!
   * VB-Editor {section}
   * Initilize toolbar menu actions.
   * e.g. id & onclick
   */
  $( '.toolbar .btn, aside .btn' ).each( function() {

    if ( this.dataset.tag ) {
      this.onclick = () => createTag( this.dataset.tag );
      this.id = "btn-" + this.dataset.tag;
    }

    if ( this.dataset.class ) {
      this.onclick = () => createStyle( this.dataset.class );
      this.id = "btn-" + this.dataset.class;
    }

    if ( this.dataset.align ) {
      this.onclick = () => alignItem( this.dataset.align );
      this.id = "btn-" + this.dataset.align;
    }

    if ( this.dataset.item ) {
      this.onclick = () => newItem( this.dataset.item );
      this.id = "btn-" + this.dataset.item;
    }

    // Handle individual functions.
    if ( this.dataset.action ) {

      if ( this.dataset.action === 'deleteItem' ) {
        this.onclick = () => deleteItem();
      } else if ( this.dataset.action === 'imgLink' ) {
        this.onclick = () => imgLink();
      }
      this.id = "btn-" + this.dataset.action;
    }

    if ( this.dataset.imgClass ) {
      this.onclick = () => imgStyle( this.dataset.imgClass );
      this.id = "btn-" + this.dataset.imgClass;
    }

  } )



  /**
   * Fill toolbar button back-ground
   * when clicked on buttons.
   */
  $( '.toolbar .btn:not(.dropdown-toggle)' ).click( function() {
    let selector = $( this );

    if ( this.dataset.align || this.dataset.class ) {
      if ( selector.css( 'background-color' ) === 'rgba(0, 0, 0, 0.05)' ) {
        selector.siblings().css( 'background-color', '' );
      }
    }

    if ( this.dataset.align ) {
      $( '.dropdown-toggle.text-align' ).html( `<span data-feather="align-${this.dataset.align.split("-")[1]}"></span>` );
      feather.replace();
    }

    ( selector.css( 'background-color' ) === 'rgba(0, 0, 0, 0.06)' ) ?
    selector.css( 'background-color', '' ): selector.css( 'background-color', 'rgba(0, 0, 0, 0.06)' );
  } );



  /**
   * Fill toolbar button back-ground
   * if any style already applied.
   */
  document.onselectionchange = function() {
    let selector = $( '.sl-elm, .n-sl-elm' );
    let selection = window.getSelection();

    if ( !selection.anchorNode || !selector[ 0 ] ) {
      return;
    }

    let range = selection.getRangeAt( 0 );

    // show style applied for markep tag
    // these are always child
    if ( !selection.isCollapsed ) {
      let node = selection.anchorNode;
      let parent = node.parentNode;

      if ( selection.toString() === node.data ) {
        $( '.toolbar .btn' ).css( 'background-color', '' );

        while ( parent.className !== 'sl-elm' ) {
          ( parent.nodeName.toLowerCase() === 'span' ) ?
          fillToolbar( parent.className ):
            fillToolbar( parent.nodeName.toLowerCase() );

          parent = parent.parentNode;
          if ( !parent ) break;
        }
      }

    } else {
      let parent = selection.anchorNode.parentNode;
      $( '.toolbar .btn' ).css( 'background-color', '' );

      while ( parent.className !== 'sl-elm' ) {
        ( parent.nodeName.toLowerCase() === 'span' ) ?
        fillToolbar( parent.className ):
          fillToolbar( parent.nodeName.toLowerCase() );

        parent = parent.parentNode;
        if ( !parent ) break;
      }

      // Select #text node if press Ctrl key
      if ( ctrlKey ) {
        range.selectNodeContents( selection.anchorNode );
      }

    }

    // style applied for alignment
    // these are always perent
    if ( !selection.isCollapsed && selection.toString() === selector.text() ) {
      $( '.dropdown-toggle.text-align' ).html( `<span data-feather="align-left"></span>` );
      feather.replace();

      ALIGN_CLASSES.split( " " ).forEach( function( element ) {
        isClass( selector, element );
      } );

      COLOR_CLASSES.split( " " ).forEach( function( element ) {
        isClass( selector, element );
      } );

      isClass( selector, 'lead' );
      isClass( selector, 'list-unstyled' );

    } else {
      $( '.dropdown-toggle.text-align' ).html( `<span data-feather="align-left"></span>` );
      feather.replace();

      ALIGN_CLASSES.split( " " ).forEach( function( element ) {
        isClass( selector, element );
      } );

      COLOR_CLASSES.split( " " ).forEach( function( element ) {
        isClass( selector, element );
      } );

      isClass( selector, 'lead' );
      isClass( selector, 'list-unstyled' );


      // style applied for images
      if ( selector.hasClass( 'img-h' ) ) {
        isClass( selector.find( 'img' ), 'img-thumbnail' );
        isClass( selector.find( 'img' ), 'rounded' );
      }
    }

  }


  function isClass( selector, className ) {
    if ( selector.hasClass( className ) ) {
      fillToolbar( className );
    }

  }


  /**
   * Fill toolbar button back-ground.
   * for styled applied on selected #text.
   */
  function fillToolbar( tag ) {
    let alignToggler = $( '.dropdown-toggle.text-align' );
    $( '.toolbar' ).find( "#btn-" + tag ).css( 'background-color', 'rgba(0, 0, 0, 0.06)' );

    switch ( tag ) {
      case 'text-left':
        alignToggler.html( `<span data-feather="align-left"></span>` );
        feather.replace();
        break;
      case 'text-center':
        alignToggler.html( `<span data-feather="align-center"></span>` );
        feather.replace();
        break;
      case 'text-right':
        alignToggler.html( `<span data-feather="align-right"></span>` );
        feather.replace();
        break;
      case 'text-justify':
        alignToggler.html( `<span data-feather="align-justify"></span>` );
        feather.replace();
        break;
    }
  }



  /*!
   * VB-Editor {section}
   * apply style and tags to selected text.
   */
  function createTag( tag ) {
    let selector = $( '.sl-elm' );
    let selection = window.getSelection();
    let sameElement = selector.find( tag );
    let newNode = document.createElement( tag );

    if ( !selection.isCollapsed ) {
      let range = selection.getRangeAt( 0 );
      let fragment = range.cloneContents();
      newNode.append( fragment );

      // Remove if any child exists (same style)
      let innerChild = $( newNode ).find( tag );
      innerChild.each( function() {
        $( this ).before( this.innerHTML ).remove();
      } );

      // Remove style if selected text have already.
      for ( let i = 0; i < sameElement.length; i++ ) {
        if ( sameElement[ i ].textContent === selection.toString() ) {
          sameElement[ i ].remove();
          insertHtml( newNode.innerHTML, range, true );
          selector[ 0 ].normalize();
          return;
        }
      }

      // if tag is a link
      if ( tag === 'a' ) {
        let link = window.prompt( 'URL:', 'https://' );
        if ( !link ) return;
        $( newNode ).attr( { 'href': link, 'target': '_blank' } );
      }

      range.deleteContents();
      insertHtml( newNode, range, true );

      // Remove style if any parent exists (same style)
      let parent = newNode.parentElement;
      while ( parent && parent.className !== 'sl-elm' ) {
        if ( parent.nodeName.toLowerCase() === tag ) {
          if ( parent.textContent.indexOf( newNode.textContent ) !== -1 ) {
            let pNode = parent.outerHTML.split( newNode.outerHTML );
            fragment.append( parseToValidHtml( pNode[ 0 ] ), parseToValidHtml( newNode.innerHTML ), parseToValidHtml( `<${tag}>${pNode[ 1 ]}` ) );
            parent.before( fragment );
            range.selectNodeContents( parent.previousSibling.previousSibling );
            parent.remove();
            joinElem( selector[ 0 ] );
          }
        }
        parent = parent.parentElement;
        if ( !parent ) break;
      }

    } else {
      let styleApplied = false;
      let range = selection.getRangeAt( 0 );

      // Remove style if selected text have already.
      for ( let i = 0; i < sameElement.length; i++ ) {
        if ( sameElement[ i ].textContent === selector.text() ) {
          styleApplied = true;
        }
        sameElement.eq( i ).before( sameElement[ i ].innerHTML ).remove();
      }
      selector[ 0 ].normalize();

      if ( !styleApplied ) {

        // if tag is a link
        if ( tag === 'a' ) {
          let link = window.prompt( 'URL:', 'https://' );
          if ( !link ) return;
          $( newNode ).attr( { 'href': link, 'target': '_blank' } );
        }

        range.selectNodeContents( selector[ 0 ] );
        range.surroundContents( newNode );
      }
    }
  }


  function createStyle( style ) {
    let selector = $( '.sl-elm' );
    let selection = window.getSelection();
    let sameElement = selector.find( 'span' );
    let newNode = document.createElement( 'span' );


    if ( !selection.isCollapsed ) {
      let range = selection.getRangeAt( 0 );
      let fragment = range.cloneContents();
      $( newNode ).addClass( style ).append( fragment );

      // Remove if any child exists (any style)
      let innerChild = $( newNode ).find( 'span' );
      innerChild.each( function() {
        $( this ).before( this.innerHTML ).remove();
      } );

      // Remove or Change style if selected text have already.
      for ( let i = 0; i < sameElement.length; i++ ) {
        if ( sameElement[ i ].textContent === selection.toString() ) {
          sameElement[ i ].remove();
          ( sameElement[ i ].classList.contains( style ) ) ?
          insertHtml( newNode.innerHTML, range, true ):
            insertHtml( newNode, range, true )
          selector[ 0 ].normalize();
          return;
        }
      }

      range.deleteContents();
      insertHtml( newNode, range, true );

      // Remove style if any parent exists (same style)
      let nodeClass, node, parent = newNode.parentElement;
      while ( parent && parent.className !== 'sl-elm' ) {
        if ( parent.nodeName.toLowerCase() === 'span' ) {
          if ( parent.textContent.indexOf( newNode.textContent ) !== -1 ) {
            let pNode = parent.outerHTML.split( newNode.outerHTML );
            nodeClass = parseToValidHtml( pNode[ 0 ] ).firstChild.getAttribute( 'class' );
            node = nodeClass === style ? parseToValidHtml( newNode.innerHTML ) : newNode;
            fragment.append( parseToValidHtml( pNode[ 0 ] ), node, parseToValidHtml( `<span class="${nodeClass}">${pNode[ 1 ]}` ) );
            parent.before( fragment );
            range.selectNodeContents( parent.previousSibling.previousSibling );
            parent.remove();
            joinElem( selector[ 0 ] );
          }
        }
        parent = parent.parentElement;
        if ( !parent ) break;
      }

    } else {
      let range = selection.getRangeAt( 0 );

      if ( selector.hasClass( style ) ) {
        selector.removeClass( style );
        return;
      }

      // remove if any style(same) applied.
      for ( let i = 0; i < sameElement.length; i++ ) {
        $( sameElement[ i ] ).before( sameElement[ i ].innerHTML ).remove();
      }

      selector.removeClass( COLOR_CLASSES );
      selector.addClass( style );
    }

  }


  function parseToValidHtml( html ) {
    let elem = document.createElement( "div" );
    let frag = document.createDocumentFragment();
    let node, lastNode;
    elem.innerHTML = paeseMissingTag( html ) + html;
    while ( ( node = elem.firstChild ) ) {
      lastNode = frag.appendChild( node );
    }
    return frag;
  }

  function paeseMissingTag( str ) {
    let patt = /<\/.+?>/g;
    let result, arr = [];

    if ( result = str.match( patt ) ) {
      for ( let i = result.length - 1; i >= 0; i-- ) {
        if ( str.indexOf( '<' + result[ i ].split( "/" )[ 1 ] ) === -1 ) {
          arr.push( '<' + result[ i ].split( "/" )[ 1 ] );
        }
      }
    }

    return arr.join( "" );
  }

  function insertHtml( html, range, isCollapsed ) {
    let elem = document.createElement( "div" );
    let frag = document.createDocumentFragment();
    let node, lastNode;

    // if (true) insert before, else after.  
    range.collapse( isCollapsed );
    if ( typeof html === "object" ) {
      range.insertNode( html );
      return;
    }

    elem.innerHTML = html;
    while ( ( node = elem.firstChild ) ) {
      lastNode = frag.appendChild( node );
    }
    range.insertNode( frag );
  }


  function joinElem( element ) {
    let node = element.childNodes;
    element.normalize();

    for ( let i = 0; i < node.length - 1; i++ ) {
      if ( node[ i ].nodeType !== 3 ) {
        if ( node[ i ].nodeName === node[ i + 1 ].nodeName ) {
          if ( node[ i ].nodeName.toLowerCase() === 'span' && node[ i ].className !== node[ i + 1 ].className ) {
            continue;
          }
          $( node[ i ] ).append( node[ i + 1 ].innerHTML );
          node[ i + 1 ].remove();
          i--;
        } else {
          $( '.sl-elm' ).find( ':empty' ).remove();
        }
      }
    }
    element.normalize();
  }


  function alignItem( style ) {
    let selection = window.getSelection();
    let selector = $( '.sl-elm, .n-sl-elm' );

    if ( !selection.isCollapsed ) {
      let range = selection.getRangeAt( 0 );

      if ( selection.toString() === selector.text() ) {
        selector.removeClass( ALIGN_CLASSES );
        selector.addClass( style );
      } else {
        selection.removeRange( range );
      }

    } else {
      selector.removeClass( ALIGN_CLASSES );
      selector.addClass( style );
    }
  }


  function deleteItem() {
    let selection = window.getSelection();
    let selector = $( '.sl-elm, .n-sl-elm' );

    if ( !selection.isCollapsed ) {
      let range = selection.getRangeAt( 0 );

      if ( selection.toString() === selector.text() ) {
        $( '.toolbar' ).hide( 10 );
        selector.remove();
      } else {
        selection.removeRange( selection.getRangeAt( 0 ) );
      }
    } else {
      $( '.toolbar' ).hide( 10 );
      selector.remove();
    }
  }


  function newItem( element ) {
    let newNode = document.createElement( element );
    let selector = $( newNode );

    if ( element === 'blockquote' ) {
      selector
        .addClass( 'blockquote' )
        .append(
          $( '<p></p>' ).addClass( 'mb-0' ).text( 'Write Quote ...' ),
          $( '<footer></footer>' ).addClass( 'blockquote-footer text-right' ).append( $( '<cite></cite>' ).text( 'author' ) )
        );
    }

    NOT_LINE_BREAK_CONTENT.split( " " ).forEach( function( elem ) {
      if ( element === elem ) {
        $( newNode ).prepend( $( '<li></li>' ) );
      }
    } );


    if ( ctrlKey && shiftKey ) {
      $( '.sl-elm, .n-sl-elm' ).before( newNode );
    } else if ( ctrlKey ) {
      $( '.sl-elm, .n-sl-elm' ).after( newNode );
    } else {
      $( '#text-editor' ).append( newNode );
    }

    fillEmptyElement();
    $( newNode ).click().focus();
    $( '.toolbar' ).hide();
  }


  /**
   * Check for image is figure or a image!
   * Then extract data from image blob
   * and show on editor.
   */
  $( '#set-caption' ).change( function() {
    if ( $( '#set-caption' )[ 0 ].checked ) {
      $( '#img-caption-tag' )
        .removeClass( 'is-invalid' )
        .removeAttr( 'disabled' )
        .focus();
    } else {
      $( '#img-caption-tag' )
        .removeClass( 'is-invalid' )
        .attr( 'disabled', '' );
    }
  } );


  $( '#img-uploader' ).change( function() {
    if ( !this.files[ 0 ] ) return;

    let imgFile = this.files[ 0 ];
    this.value = "";

    if ( imgFile.size > 500 * 1024 ) {
      NotificationCloseable( 'Exceed file size!', 'Image size must be less then 500 KB', 'error' );
      return;
    }

    $( 'body' )
      .append( $( "<div></div>" ).attr( 'class', 'modal-backdrop fade show' ) )
      .css( 'overflow', 'hidden' );

    $( '#set-img' ).show();
    $( '#img-alt-tag' ).focus();

    $( '#set-img-form' ).off( 'submit' ).submit( function( event ) {
      event.preventDefault();
      fatchImage( imgFile, $( '#img-alt-tag' ).val(), $( '#img-caption-tag' ).val() );
      $( '#set-img .close' ).click();
    } );
  } );


  // Extract data from img as blob
  function fatchImage( file, alt, caption ) {
    let div = $( '<div></div>' ).addClass( 'text-center img-h' );
    let img = document.createElement( 'img' );
    let reader = new FileReader();

    reader.readAsDataURL( file );

    reader.onload = function( event ) {

      if ( $( '#set-caption' )[ 0 ].checked ) {
        let fig = $( '<figure></figure>' ).addClass( 'figure' );
        let captionTag = $( '<figcaption></figcaption>' ).text( caption ).addClass( 'text-center figure-caption' );
        $( img ).attr( { 'class': 'figure-img img-fluid rounded', 'alt': alt } );
        img.src = event.target.result;
        $( '#text-editor' ).append( $( div ).append( $( fig ).append( img, captionTag ) ) );
      } else {
        $( img ).attr( { 'class': 'img-fluid', 'alt': alt } );
        img.src = event.target.result;
        $( '#text-editor' ).append( $( div ).append( img ) );
      }

      $( '#set-img-form' )[ 0 ].reset();
      $( '#img-caption-tag' ).attr( 'disabled', '' );
    }

  }


  function imgLink() {
    let link = window.prompt( 'Insert Link:', 'https://' );
    if ( !link ) return;

    let selector = $( '.n-sl-elm.img-h' );

    if ( selector[ 0 ] ) {
      let node = $( '<a></a>' ).attr( { 'href': link, 'target': '_blank' } );

      if ( selector.find( 'figcaption' )[ 0 ] ) {
        node.append( selector.find( 'img' ), selector.find( 'figcaption' ) );
        selector.append( selector.find( 'figure' ).append( node ) );
      } else {
        node.append( selector.find( 'img' ) );
        selector.append( node );
      }
    }

  }


  function imgStyle( style ) {
    let selector = $( '.n-sl-elm' );
    selector.find( 'img' ).toggleClass( style );
  }


  /**
   * Key Featuers for editor.
   * style Shortcuts events
   */
  $( document ).on( {
    keydown: function( event ) {

      // toggle toolber
      if ( shiftKey && ctrlKey ) {
        $( '.toolbar' ).toggle();
      }

      // toggle text color dropdown
      if ( altKey && event.keyCode === 67 ) {
        $( '#TextStyleDropdown' ).click();
        $( '#TextColorKit' ).click();
      }
    }
  } );



}() );