/*__PAGE_CONFIG__*/
(function() {
  let customHeight = $('body')[0].getBoundingClientRect().height - $('aside')[0].getBoundingClientRect().top;
  $('main, aside').css({ 'height': customHeight });

  $('#editor-tool-slider').click(function() {
    let selector = $(this);
    if (selector.attr('aria-expanded') === 'true') {
      $('aside').css({ 'margin-right': '-13.5rem', 'transition': 'all 0.3s' });
      selector
        .empty()
        .append($('<span></span>').attr('data-feather', 'chevron-left'))
        .attr('aria-expanded', false);
      feather.replace();
    } else {
      $('aside').css({ 'margin-right': '0rem', 'transition': 'all 0.3s' });
      selector
        .empty()
        .append($('<span></span>').attr('data-feather', 'chevron-right'))
        .attr('aria-expanded', true);
      feather.replace();
    }
  })

  editorRef();
})();



/*__EDITOR_CONFIG__*/
'use strict'

var lastKey = null;
var lastSelector = null;
var notDropperElement = "ol ul".split(" ");

function editorRef() {
  let ns = '.img-h';
  let textEditorConent = $('#text-editor>*:not(' + ns + ')');
  let notEditableContent = $('#text-editor>' + ns);


  textEditorConent.off('click').click(function(event) {
    event.stopPropagation();
    feelEmptyElement();

    if ($(this).hasClass('sl-elm' || 'n-sl-elm')) {
      showToolBar($(this), event);
      return;
    }

    if ($(this).hasClass('dam')) {
      $(this).empty().removeClass('dam');
    }

    if (lastSelector) {
      lastSelector
        .removeClass('sl-elm n-sl-elm')
        .removeAttr('contentEditable');
    }

    $(this).addClass('sl-elm');
    this.contentEditable = true;
    showToolBar($(this), event);
    lineDropper();
    lastSelector = $(this);
    this.focus();
  });


  notEditableContent.off().on({
    mouseenter: function() {
      $(this).addClass('nh-sl-elm');
    },
    mouseleave: function() {
      $(this).removeClass('nh-sl-elm');
    },
    click: function(event) {
      event.stopPropagation();
      feelEmptyElement();

      if ($(this).hasClass('sl-elm' || 'n-sl-elm')) {
        showToolBar($(this), event);
        return;
      }

      if (lastSelector) {
        lastSelector
          .removeClass('sl-elm n-sl-elm')
          .removeAttr('contentEditable');
      }

      $(this).addClass('n-sl-elm');
      showToolBar($(this), event);
      lastSelector = $(this);
    }
  });


  $(document).click(function() {
    if (lastSelector) {
      lastSelector.removeClass('sl-elm n-sl-elm');
      lastSelector.removeAttr('contentEditable');
      lastSelector = null;
      feelEmptyElement();
      hideToolBar();
    }
  })

}


function lineDropper() {
  let selector = $('.sl-elm');
  let isLineDrop = true;

  notDropperElement.forEach(function(e) {
    if (selector[0].nodeName.toLowerCase() === e) {
      isLineDrop = false;
    }
  });

  selector.off('keydown').keydown(function(e) {
    if (e.keyCode === 13 && isLineDrop) {
      e.preventDefault();
      let selection = window.getSelection();
      if (selection.isCollapsed) {
        let range = selection.getRangeAt(0);
        let selectorChild = selection.anchorNode;
        range.insertNode(document.createElement('br'));

        if (selection.anchorOffset === selectorChild.length) {
          if (selectorChild.data === selector.text().substr(-selectorChild.length, selectorChild.length) && lastKey !== 8) {
            range.insertNode(document.createElement('br'));
          }
        }
        selection.collapseToEnd();
      }
    }
    lastKey = e.keyCode;
  })

}


function feelEmptyElement() {
  let nFell = '.img-h, br, hr';
  let textEditorConent = $('#text-editor>*:not(' + nFell + ')');
  let emptyElement = $('#text-editor>*:not(' + nFell + '):empty');

  emptyElement.addClass('dam').text('Write Somthing ...');
  let customText = 'Write Somthing ...';
  textEditorConent.each(function(i) {
    if (this.textContent === customText) {
      $(this).addClass('dam');
    }
  });

}


function showToolBar(element, event) {
  let mouseTop = event.pageY;
  let mouseLeft = event.pageX / 3.5;
  let posTop = element[0].getBoundingClientRect().top;
  let posLeft = element[0].getBoundingClientRect().left;

  if (element.hasClass('img-h')) {
    $('#text-toolbar').hide(10);
    $('#img-toolbar').css({ 'top': (posTop - 65), 'left': posLeft }).show();
  } else {
    $('#img-toolbar').hide(60);
    if (mouseTop < 220) {
      $('#text-toolbar').css({ 'top': (mouseTop + 30), 'left': (posLeft + mouseLeft) }).show();
    } else {
      $('#text-toolbar').css({ 'top': (mouseTop - 80), 'left': (posLeft + mouseLeft) }).show();
    }
  }

}

function hideToolBar() {
  $('#img-toolbar').hide(10);
  $('#text-toolbar').hide(10);
}



/*__CREATE_STYLES__*/
function createStyle(element) {
  let selector = $('.sl-elm');
  let isFound = false;
  let selection = window.getSelection();
  let selectorElememts = selector.find(element);

  if (!selection.isCollapsed) {
    let range = selection.getRangeAt(0);

    for (let i = 0; i < selectorElememts.length; i++) {
      if (selectorElememts.eq(i).text() === selector.text()) {
        insertNode(selector, element, range, selection);
        deleteNode(selectorElememts.eq(i), selector, element);
        break;
      }

      if (selectorElememts.eq(i).text() === selection.toString()) {
        deleteNode(selectorElememts.eq(i), selector, element);
        isFound = true;
        break;
      }
    }

    if (!isFound) {
      insertNode(selector, element, range, selection);
    }

  } else {
    let boldText = true;

    if (selectorElememts.length === 0) {
      removeWrongSelectionUI(selector);
      let str = selector.html();
      selector.html(`<${element}>${str}</${element}>`);

    } else {
      for (let i = 0; i < selectorElememts.length; i++) {
        if (selectorElememts.eq(i).text() === selector.text()) {
          boldText = false;
        }
        deleteNode(selectorElememts.eq(i), selector, element);
      }

      if (boldText) {
        removeWrongSelectionUI(selector);
        let str = selector.html();
        selector.html(`<${element}>${str}</${element}>`);
      }
    }
  }

}


function insertNode(selector, element, range, selection) {
  try {
    removeWrongSelectionUI(selector);
    range.surroundContents(document.createElement(element));
  } catch (e) {
    selection.removeRange(range);
    wrongSelectionUI(selector);
  }

}

function deleteNode(delNode, selector, element) {
  removeWrongSelectionUI(selector);
  if (!delNode.attr('class')) {
    delNode.removeAttr('class');
  }

  let str = selector.html();
  selector.html(str.replace(`<${element}>${delNode.html()}</${element}>`, delNode.html()));
}



/*__ADD_STYLES__*/
function addStyle(style) {
  let selector = $('.sl-elm');
  let isFound = false;
  let selection = window.getSelection();
  let selectorElememts = selector.find('span');
  let textClass = 'text-primary text-secondary text-success text-info text-warning text-danger';

  if (!selection.isCollapsed) {
    let range = selection.getRangeAt(0);

    for (let i = 0; i < selectorElememts.length; i++) {

      if (selectorElememts.eq(i).text() === selector.text()) {
        insertStyleNode(selector, range, selection, style);
        selector.toggleClass(style);
        break;
      }

      if (selectorElememts.eq(i).text() === selection.toString()) {
        if (selectorElememts.eq(i).hasClass(style)) {
          deleteStyleNode(selectorElememts.eq(i), selector, style);
        } else {
          selectorElememts.eq(i).removeClass(textClass);
          selectorElememts.eq(i).addClass(style);
        }
        isFound = true;
        break;
      }
    }

    if (!isFound) {
      insertStyleNode(selector, range, selection, style);
    }
  } else {
    removeWrongSelectionUI(selector);
    for (let i = 0; i < selectorElememts.length; i++) {
      deleteStyleNode(selectorElememts.eq(i), selector, style);
    }
    if (selector.hasClass(style)) {
      selector.removeClass(style);
    } else {
      selector.removeClass(textClass);
      selector.addClass(style);
    }
  }

}


function insertStyleNode(selector, range, selection, style) {
  try {
    removeWrongSelectionUI(selector);
    let elm = document.createElement('span');
    $(elm).addClass(style);
    range.surroundContents(elm);
  } catch (e) {
    selection.removeRange(range);
    wrongSelectionUI(selector);
  }

}

function deleteStyleNode(delNode, selector, style) {
  delNode.removeClass(style);
  if (!delNode.attr('class')) {
    delNode.removeAttr('class');
  }

  let str = selector.html();
  selector.html(str.replace(`<span>${delNode.html()}</span>`, delNode.html()));
  removeWrongSelectionUI(selector);
}


function wrongSelectionUI(selector) {
  if (selector.attr('sel-err') !== 'true') {
    $('.sl-elm *:not(span)').addClass('se-el-err');
    $('.sl-elm span').addClass('se-el-c-err');
    selector.attr('sel-err', 'true');
  }
}

function removeWrongSelectionUI(selector) {
  if (selector.attr('sel-err') === 'true') {
    $('.sl-elm *').removeClass('se-el-err se-el-c-err');
    selector.removeAttr('sel-err');
  }
}



function textAlign(style) {
  let selection = window.getSelection();
  let selector = $('.sl-elm');
  let textClass = 'text-left text-center text-right text-justify';

  if (!selection.isCollapsed) {
    let range = selection.getRangeAt(0);

    if (selection.toString() === selector.text()) {
      try {
        selector.removeClass(textClass);
        selector.addClass(style);
        selection.removeRange(selection.getRangeAt(0));
      } catch (e) {
        selection.removeRange(selection.getRangeAt(0));
      }
    } else {
      selection.removeRange(selection.getRangeAt(0));
    }
  } else {
    selector.removeClass(textClass);
    selector.addClass(style);
  }
}


function deleteItem() {
  let selection = window.getSelection();
  let selector = $('.sl-elm, .n-sl-elm');

  if (!selection.isCollapsed) {
    let range = selection.getRangeAt(0);

    if (selection.toString() === selector.text()) {
      selector.remove();
      hideToolBar();
      editorRef();
    } else {
      selection.removeRange(selection.getRangeAt(0));
    }
  } else {
    selector.remove();
    hideToolBar();
    editorRef();
  }
}


function newItem(element) {
  let newElement;
  if (element === 'hr') {
    newElement = document.createElement('hr');
  } else {
    newElement = $(`<${element}></${element}>`);
  }

  notDropperElement.forEach(function(e) {
    if (element === e) {
      newElement.append($('<li></li>'));
    }
  });

  $('#text-editor').append(newElement);
  editorRef();
  setTimeout(function() {
    $(newElement).click().focus();
  }, 5);
}



/*__IMAGES_CONFIG__*/

/**
 * Image and Figur toggler
 * @param  {node}
 */
$('#set-cap').change(function() {
  if ($('#set-cap')[0].checked) {
    $('#img-alt-tag').removeClass('is-valid');
    $('#img-caption-tag')
      .removeClass('is-invalid')
      .removeAttr('disabled')
      .focus();
  } else {
    $('#img-caption-tag').attr('disabled', '');
  }
});


/**
 * verify image data
 * @param  {node}
 */
$('#img-uploader').change(function() {
  if (this.files[0]) {
    let imgFile = this.files[0];

    $(this).val('');
    if (imgFile.size > 500 * 1024) {
      NotificationCloseable('Exceed file size!', 'Image size must be less then 500 KB', 'error');
      return;
    }

    $('body').append($("<div></div>").attr('class', 'modal-backdrop fade show')).css('overflow', 'hidden');
    $('#set-img').show();
    $('#img-alt-tag').focus();

    $('#set-img-form').off('submit').submit(function(e) {
      e.preventDefault();
      getImageData(imgFile, $('#img-alt-tag').val(), $('#img-caption-tag').val());
      $('#set-img .close').click();
    });
  }

});


/**
 * Extract data from img blob
 * @param  {multi}
 */
function getImageData(file, alt, caption) {
  let reader = new FileReader();

  reader.readAsDataURL(file);
  reader.onload = function(event) {
    let newImg = document.createElement('img');
    let div = $('<div></div>').addClass('text-center img-h');

    if ($('#set-cap')[0].checked) {
      let fig = $('<figure></figure>').addClass('figure');
      let captionTag = $('<figcaption></figcaption>').text(caption).addClass('text-center figure-caption');

      $(newImg).attr({ 'class': 'figure-img img-fluid rounded', 'alt': alt });
      newImg.src = event.target.result;
      $('#text-editor').append($(div).append($(fig).append(newImg, captionTag)));
    } else {
      $(newImg).attr({ 'class': 'img-fluid', 'alt': alt });
      newImg.src = event.target.result;
      $('#text-editor').append($(div).append(newImg));
    }
    $('#set-img-form')[0].reset();
    $('#img-caption-tag').attr('disabled', '');
    editorRef();
  }

}


/**
 * convert Image to Link
 * @param  {node}
 */
$('#img-link').click(function() {
  let link = window.prompt('Insert Link:', 'https://');
  let selector = $('.n-sl-elm.img-h');

  if (link) {
    if (selector[0]) {
      let lin = $('<a></a>').attr({ 'href': link, 'target': '_blank' });

      if (selector.find('figcaption')[0]) {
        console.log('fig')
        lin.append(selector.find('img'), selector.find('figcaption'));
        selector.append(selector.find('figure').append(lin));
      } else {
        lin.append(selector.find('img'));
        selector.append(lin);
      }

      selector.removeClass('sl-elm n-sl-elm');
      editorRef();
    }
  }
});


function imgStyle(style) {
  let selection = window.getSelection();
  let selector = $('.n-sl-elm');
  if (selection.isCollapsed) {
    selector.find('img').toggleClass(style);
  }
}


function imgAlign(style) {
  let selection = window.getSelection();
  let selector = $('.n-sl-elm');
  if (selection.isCollapsed) {
    selector.removeClass('text-left text-center text-right');
    selector.addClass(style);
  }
}


function execCmd(command) {
  document.execCommand(command, false, null);
}

function execCmdWithArg(command, arg) {
  document.execCommand(command, false, arg);
}


/*__SOURCECODE_TOGGELER__*/
var showingSource = false;

function toggleSource() {
  $('.sl-elm, .n-sl-elm').removeAttr('contentEditable');
  $('.sl-elm, .n-sl-elm').removeClass('sl-elm n-sl-elm');
  hideToolBar();

  if (showingSource) {
    $('#html-editor').hide();
    $('#text-editor').show();
    $('aside .btn, #editor-nav .btn:not(#source-toggle-btn), #img-uploader').removeAttr('disabled');
    showingSource = false;
    feelEmptyElement();
  } else {
    $('#text-editor').hide();
    $('#html-editor')
      .text($('#text-editor').html())
      .show();
    $('aside .btn, #editor-nav .btn:not(#source-toggle-btn), #img-uploader').attr('disabled', '');
    showingSource = true;
    parseSourceCode();
    if (sessionStorage.msgShown !== 'true') {
      setTimeout(function() {
        Notification('Developers Console', 'This is only for read!!', 'warning');
        sessionStorage.msgShown = 'true';
      }, 600);
    }
  }
}


/*__EDITOR_OTHER_FUNCTIONALITY__*/

/**
 * show and hide toolbar
 * press shift & ctrl key
 */
$(document).on({
  keydown: function(e) {
    if (e.shiftKey && e.ctrlKey) {
      hideToolBar();
    }
  },
  keyup: function(e) {
    if (!e.shiftKey || !e.ctrlKey) {
      if ($('.sl-elm')[0]) {
        $('#text-toolbar').show(10);
      }
      if ($('.n-sl-elm')[0]) {
        $('#img-toolbar').show(10);
      }
    }
  }
});