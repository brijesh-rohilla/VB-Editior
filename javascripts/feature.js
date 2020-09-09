'use strict'

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


function parseSourceCode() {
  let editor = $('#html-editor');
  let str = editor.html();
  let patt = /&lt;.+?&gt;/g;

  /**
   * linebreak after open tag
   * if another tag inside it.
   * @param  {[rgex]}
   */
  let pattDblTag = /&gt;&lt;|\s&gt;&lt;/g;
  let parsedStr = str.replace(pattDblTag, function(d) {
    return `&gt;<br>&lt;`;
  });


  let parsedDoc = parsedStr.replace(patt, function(c) {
    /**
     * linebreak after closed tag
     * @param  {[rgex]}
     */
    if (/&lt;\/.+?&gt;/.test(c)) {
      return `<span class="cs-el">${c}</span>`
    } else {
      let pattAttr = /\s\w{2,}=/g;
      let pattValue = /".+?"/g;

      /**
       * specify color to attribute.
       * @param  {[rgex]}
       */
      let parseAttrName = c.replace(pattAttr, function(f) {
        return `<span class="cs-at-na">${f}</span>`;
      })

      /**
       * specify color to attr value.
       * @param  {[rgex]}
       */
      let parseValue = parseAttrName.replace(pattValue, function(g) {
        if (g.split(':')[0] === '"data') {
          return `<span class="cs-at">"../pathto/image"</span>`;
        } else if (g !== '"cs-at-na"' && g !== '"cs-at"' && g !== '"cs-el"') {
          return `<span class="cs-at">${g}</span>`;
        } else {
          return g;
        }
      })
      return `<span class="cs-el">${parseValue}</span>`;
    }

  });

  $('#html-editor').html(parsedDoc);
}