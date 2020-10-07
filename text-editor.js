(function () {

  "use strict";

  const ALIGN_CLASSES = "text-left text-center text-right text-justify";
  let dummyContent = '<span class="dam">Write Somthing ...</span>';
  const NOT_EDITABLE_CONTENT = "figure";
  const NOT_LINE_BREAK_CONTENT = "ol ul";

  let lastSelector, ctrlKey, shiftKey, altKey;


  // listener for keys perssed globally
  $(document).on({
    keydown: function (event) {
      if (event.ctrlKey) {
        ctrlKey = true;
      }
      if (event.shiftKey) {
        shiftKey = true;
      }
      if (event.altKey) {
        altKey = true;
      }
    },
    keyup: function (event) {
      if (event.ctrlKey) {
        ctrlKey = false;
      }
      if (event.shiftKey) {
        shiftKey = false;
      }
      if (event.altKey) {
        altKey = false;
      }
    }
  });



  // adjuct Editor and sidebar on screen
  let customHeight = $("body")[0].getBoundingClientRect().height - $("aside")[0].getBoundingClientRect().top;
  $("main, aside").css({ "height": customHeight });

  // sidebar slider
  $("#editor-tool-slider").click(function () {
    let selector = $(this);
    if (selector.attr("aria-expanded") === "true") {
      $("aside").css({ "margin-right": "-13.5rem", "transition": "all 0.3s" });
      selector
        .empty()
        .append($("<span></span>").attr("data-feather", "chevron-left"))
        .attr("aria-expanded", false);
      feather.replace();
    } else {
      $("aside").css({ "margin-right": "0rem", "transition": "all 0.3s" });
      selector
        .empty()
        .append($("<span></span>").attr("data-feather", "chevron-right"))
        .attr("aria-expanded", true);
      feather.replace();
    }
  })



  /*!
   * VB-Editor {section}
   * Handle {factory()} selected element editable, noteditable.
   * Handle toolbar and fill empty elements.
   * .call fn passed arg as `node` object else `jquary` object.
   */
  $("#text-editor").on("mousedown", function (event) {
    let selector = event.target.closest("#text-editor>*");

    if (!selector && lastSelector) {
      lastSelector
        .removeClass("--is--selected")
        .removeAttr("contentEditable");
      fillEmptyElement();
      lastSelector = null;
      $(".toolbar").hide();
    }

    // return if selector not found (when press outside of element)
    // and stop selecting already selected element
    if (!selector || selector.classList.contains("--is--selected")) return;
    $(".toolbar").hide();

    // unselect last active element.
    if (lastSelector) {
      lastSelector
        .removeClass("--is--selected")
        .removeAttr("contentEditable");
    }

    factory.call(selector);
  });


  // stop link auto behaviour
  $("#text-editor").click(function (event) {
    let selector = event.target.nodeName.toLowerCase();
    if (selector === "img" || selector === "a") {
      event.preventDefault();
    }
  })


  function factory() {
    let notFill = "hr";
    let selector = $(this);
    let flag = false;
    fillEmptyElement();

    // return if hr, br etc. have
    notFill.split(" ").forEach(function (element) {
      if (lastSelector && lastSelector[0].nodeName.toLowerCase() === element) {
        flag = true;
      }
    })

    if (flag) return;

    // select `noteditable` content if present. e.g. figure
    NOT_EDITABLE_CONTENT.split(" ").forEach((element) => {
      if (this.tagName.toLowerCase() === element) {
        notEditableContent.call(this);
        flag = true;
      }
    })

    if (flag) return;

    // here all elemant are `editable`.
    editableContent.call(this);
  }



  function editableContent() {
    let selector = $(this);

    // Remove if dummy text exist
    if (this.innerHTML === dummyContent) {
      selector.empty();
    }

    selector.addClass("--is--selected");
    this.contentEditable = true;
    lastSelector = $(this);
    newLineBreak.call(this);

    // join text node
    this.onselectstart = function () {
      joinElem(this);
    }

    // paste only text
    this.addEventListener("paste", function (event) {
      let data = (event.clipboardData || window.clipboardData).getData("text");
      let selection = window.getSelection();
      let range = selection.getRangeAt(0);
      if (!selection.rangeCount) return false;

      selection.deleteFromDocument();
      range.insertNode(document.createTextNode(data));
      event.preventDefault();
    })
  }



  function notEditableContent() {
    let selector = $(this);

    selector.addClass("--is--selected");
    lastSelector = $(this);

    selector.off("click").click(function () {
      showToolBar(this);

      // style applied for images
      // if (selector.hasClass('img-h')) {
      //   isClass(selector.find('img'), 'img-thumbnail');
      //   isClass(selector.find('img'), 'rounded');
      // }
    })
  }


  function isClass(selector, className) {
    if (selector.hasClass(className)) {
      fillToolbar(className);
    }
  }


  function newLineBreak() {
    let selector = $(this);
    let isLineBreak = true;

    // disable NewParagraph on press enter.
    // e.g. (ol, ul)
    NOT_LINE_BREAK_CONTENT.split(" ").forEach(function (element) {
      if (selector[0].nodeName.toLowerCase() === element) {
        isLineBreak = false;
      }
    });

    selector.off("keydown").keydown(function (event) {
      if ((event.code === "Enter" || event.code === "NumpadEnter") && isLineBreak) {
        let selection = window.getSelection();
        if (!selection.rangeCount) return false;

        selection.deleteFromDocument();
        let range = selection.getRangeAt(0);

        // Line break as <br>
        if (event.shiftKey) {
          let newLine = document.createElement("br");
          range.insertNode(newLine);
          return;
        }

        // Line break as <p>
        let frag = document.createDocumentFragment();
        let newParagraph = document.createElement("p");
        let node, nextNode, pNode, existElement;

        // append node to selected element
        range.insertNode(newParagraph);
        pNode = newParagraph;

        while (pNode !== this) {

          if (pNode !== newParagraph) {
            existElement = document.createElement(pNode.nodeName.toLowerCase());
            existElement.append(frag);
            frag.append(existElement);
          }

          while (node = pNode.nextSibling) {
            nextNode = frag.append(node);
          }

          pNode = pNode.parentNode;
        }

        // create new paragraph
        newParagraph.append(frag);
        this.after(newParagraph);

        // activate new paragraph
        lastSelector
          .removeClass("--is--selected")
          .removeAttr("contentEditable");
        fillEmptyElement();
        editableContent.call(newParagraph);
        newParagraph.focus();
        event.preventDefault();
      }

      if (event.code === "Backspace" && !this.textContent && this.nodeName.toLowerCase() !== "h1") {
        factory.call(this.previousElementSibling);
        let selection = window.getSelection();

        this.previousElementSibling.focus();
        selection.getRangeAt(0).selectNodeContents(this.previousElementSibling);
        selection.collapseToEnd();
        this.remove();
        event.preventDefault();
      }

    })
  }


  function fillEmptyElement() {
    let notFill = "br hr " + NOT_EDITABLE_CONTENT;

    if (!lastSelector) return;

    if (!lastSelector.text()) {
      let flag = false;

      notFill.split(" ").forEach(function (element) {
        if (lastSelector[0].nodeName.toLowerCase() === element) {
          flag = true;
        }
      })

      if (!flag) {
        lastSelector.html(dummyContent);
      }
    }
  }



  // get initial react of text-toolbar
  let toolRect = $("#text-toolbar")[0].getBoundingClientRect();
  $("#text-toolbar").hide();

  function showToolBar(selector) {
    let selection = window.getSelection();
    let rangeRect, diff, flag = false;

    // return if selector is figcaption
    if (selector.nodeName.toLowerCase() === "figcaption") return;

    // if selector is notEditable e.g. (figure)
    NOT_EDITABLE_CONTENT.split(" ").forEach((element) => {
      if (selector.tagName.toLowerCase() === element) {
        flag = true;
      }
    })

    if (!selection.isCollapsed) {
      let range = selection.getRangeAt(0);
      rangeRect = range.getBoundingClientRect();
      diff = (toolRect.width / 2) - (rangeRect.width / 2);
    }

    let selectorRect = selector.getBoundingClientRect();
    let imgDiff = (toolRect.width / 2) - (selectorRect.width / 2);

    if (!flag && !selection.isCollapsed) {
      $("#img-toolbar").hide();
      if (rangeRect.top < 150) {
        $("#text-toolbar").css({ "top": (rangeRect.bottom + 3), "left": (rangeRect.left - 31.2) - diff }).show();
      } else {
        $("#text-toolbar").css({ "top": ((rangeRect.top - toolRect.height) - 15), "left": (rangeRect.left - 31.2) - diff }).show();
      }
    } else if (flag) {
      $("#text-toolbar").hide();
      $("#img-toolbar").css({ "top": ((selectorRect.top - toolRect.height) - 10), "left": (selectorRect.left - 31.2) - imgDiff }).show();
    }
  }


  $("main").scroll(function () {
    let selector = $(".--is--selected")[0];
    if (!selector) return;

    showToolBar(selector);
  })


  /*!
   * VB-Editor {section}
   * Initilize toolbar menu actions.
   * e.g. id & onclick
   */
  $(".toolbar .btn, aside .btn").each(function () {

    if (this.dataset.tag) {
      this.onclick = () => createTag(this.dataset.tag);
      this.id = "btn-" + this.dataset.tag;
    }

    if (this.dataset.item) {
      this.onclick = () => newItem(this.dataset.item);
      this.id = "btn-" + this.dataset.item;
    }

    // Handle individual functions.
    if (this.dataset.action) {

      if (this.dataset.action === "deleteItem") {
        this.onclick = () => deleteItem();
      }

      if (this.dataset.action === "imgLink") {
        this.onclick = () => imgLink();
      }

      this.id = "btn-" + this.dataset.action;
    }

    if (this.dataset.imgClass) {
      this.onclick = () => imgStyle(this.dataset.imgClass);
      this.id = "btn-" + this.dataset.imgClass;
    }

  })



  /**
   * Fill toolbar button back-ground
   * when clicked on buttons.
   */
  $(".toolbar .btn").click(function () {
    let selector = $(this);

    if (selector.css("background-color") === "rgba(0, 0, 0, 0.06)") {
      selector.css("background-color", "")
    } else {
      selector.css("background-color", "rgba(0, 0, 0, 0.06)");
    }

  });




  /**
   * Fill toolbar button back-ground
   * if any style already applied.
   */
  let debounceFillToolBar = debounce(fillToolBar, 300);

  document.onselectionchange = function (event) {
    // showToolBar fn call inside this fn
    debounceFillToolBar(event.target.activeElement);
  }


  function fillToolBar(selector) {

    // return if text-editor not contain selector
    if (!$("#text-editor")[0].contains(selector)) return;
    let selection = window.getSelection();
    let range = selection.getRangeAt(0);

    // Select figcaption node
    if (selection.isCollapsed && selector.nodeName.toLowerCase() === "figcaption") {
      range.selectNodeContents(selection.anchorNode);
    }

    // Select #text node if press Ctrl key
    if (ctrlKey && selection.isCollapsed) {
      range.selectNodeContents(selection.anchorNode);
    }

    $(".toolbar .btn").css("background-color", "");
    showToolBar(selector);

    if (selection.isCollapsed) {
      $(".toolbar").hide();
      return;
    }

    // show style applied for markep tag
    let node = selection.anchorNode; // select text node
    let parent = node; // select html node (parent)

    while (parent !== selector) {
      if (node.textContent.includes(selection.toString())) {
        fillToolbar(parent.nodeName.toLowerCase());
      }
      parent = parent.parentNode;
    }

  }



  /**
   * Fill toolbar button back-ground.
   * for styled applied on selected #text.
   */
  function fillToolbar(tag) {
    $(".toolbar").find("#btn-" + tag).css("background-color", "rgba(0, 0, 0, 0.06)");
  }



  /*!
   * VB-Editor {section}
   * apply tags to selected text.
   */
  function createTag(tag) {

    let selection = window.getSelection();

    if (selection.isCollapsed) return;

    let range = selection.getRangeAt(0);
    let fragment = range.extractContents();
    let selector = $(".--is--selected");
    let newNode = document.createElement(tag);

    newNode.append(fragment);

    // if tag is a link
    if (tag === "a") {
      let link = window.prompt("URL:", "https://");
      if (!link) return;
      $(newNode).attr({ "href": link, "target": "_blank" });
    }


    // Remove if any child exists (same style)
    $(newNode).find(tag).each(function () {
      $(this).before(this.innerHTML).remove();
    });

    range.insertNode(newNode)
    range.selectNodeContents(newNode);

    // Remove style if any parent exists (same style)
    let perviousFrag = document.createDocumentFragment();
    let nextFrag = document.createDocumentFragment();
    let middleFrag = document.createDocumentFragment();
    let parent = newNode.parentElement;
    let node, nextNode, pNode;

    while (newNode.parentElement && parent !== selector[0]) {
      if (parent.nodeName.toLowerCase() === tag && parent.textContent.includes(newNode.textContent)) {

        // join pervious node
        while (node = newNode.previousSibling) {
          nextNode = perviousFrag.append(node);
        }

        // join next node
        while (node = newNode.nextSibling) {
          nextNode = nextFrag.append(node);
        }

        // join middel node
        while (node = newNode.firstChild) {
          nextNode = middleFrag.append(node);
        }

        // fit into outer html nodes
        pNode = newNode;
        while (true) {
          pNode = pNode.parentElement;

          let node = pNode.nodeName.toLowerCase();
          let perviousNode = document.createElement(node);
          let middelNode = document.createElement(node);
          let nextNode = document.createElement(node);

          perviousNode.append(perviousFrag);
          perviousFrag.append(perviousNode);

          nextNode.append(nextFrag);
          nextFrag.append(nextNode);

          if (pNode !== parent) {
            middelNode.append(middleFrag);
            middleFrag.append(middelNode);
          }

          if (pNode === parent) break;
        }

        range.selectNode(parent);
        range.deleteContents(parent);

        if (perviousFrag.textContent) {
          range.insertNode(perviousFrag);
          range.collapse(false);
        }

        if (nextFrag.textContent) {
          range.insertNode(nextFrag);
          range.collapse(true);
        }
        range.insertNode(middleFrag);
        return;
      }
      parent = parent.parentElement;
    }

  }


  function joinElem(element) {
    element.normalize();
    let node = element.childNodes;

    for (let i = 0; i < node.length - 1; i++) {
      if (node[i].nodeType !== 3 && node[i].nodeName.toLowerCase() !== "li") {
        if (node[i].nodeName === node[i + 1].nodeName) {
          $(node[i]).append(node[i + 1].innerHTML);
          node[i + 1].remove();
          i--;
        } else {
          $(element).find(":empty").remove();
        }
      }
    }
    element.normalize();
  }



  function deleteItem() {
    let selector = $(".--is--selected");

    selector.remove();
    $(".toolbar").hide(10);
  }


  function newItem(element) {
    let newNode = document.createElement(element);
    let selector = $(newNode);

    if (element === "blockquote") {
      selector
        .addClass("blockquote")
        .append(
          $("<p></p>").addClass("mb-0").text("Write Quote ..."),
          $("<footer></footer>").addClass("blockquote-footer text-right").append($("<cite></cite>").text("author"))
        );
    }

    NOT_LINE_BREAK_CONTENT.split(" ").forEach(function (elem) {
      if (element === elem) {
        $(newNode).prepend($("<li></li>"));
      }
    });


    if (ctrlKey && shiftKey) {
      $(".--is--selected").before(newNode);
    } else if (ctrlKey) {
      $(".--is--selected").after(newNode);
    } else {
      $("#text-editor").append(newNode);
    }

    // activate new paragraph
    if (lastSelector) {
      lastSelector
        .removeClass("--is--selected")
        .removeAttr("contentEditable");
    }
    fillEmptyElement();
    $(".toolbar").hide();
    if (element !== "hr") {
      factory.call(newNode);
      newNode.focus();
    }
  }




  /*!
   * VB-Editor {section}
   * Fatch Image data
   */
  let imgAltForm = document.forms["setImg-alt"];
  let imgFiles = [];

  // show alt tag model
  $("[data-action='img-alt']").click(function () {
    $("#set-img-alt").modal("show");
  });


  $("#img-uploader").change(function (event) {

    let file = this.files[0];
    this.value = "";

    if (!file) return;

    // push image and img  id to array
    let obj = {
      img: file,
      id: rendomId()
    }

    imgFiles.push(obj);


    // fatch image
    let img = document.createElement("img");
    let fig = $("<figure></figure>").addClass("figure");
    let captionTag = $("<figcaption></figcaption>")
      .text("Type caption for image (optional)")
      .attr("contentEditable", "true")
      .addClass("text-center figure-caption");

    $(img).attr({ "class": "figure-img img-fluid", "name": obj.id });

    img.src = URL.createObjectURL(file);

    $("#text-editor").append($(fig).append(img, captionTag));

    imgAltForm.reset();

    if (lastSelector) {
      lastSelector
        .removeClass("--is--selected")
        .removeAttr("contentEditable");
    }

    fillEmptyElement();
    $(".toolbar").hide();
  });


  // attetch image alt
  imgAltForm.addEventListener("submit", function (event) {
    event.preventDefault();

    let alt = imgAltForm.elements.alt.value;
    $("#set-img-alt").modal("hide");

    $(".--is--selected").find("img").attr({ "alt": alt });
  })


  function imgStyle(style) {
    let selector = $(".--is--selected");
    selector.find("img").toggleClass(style);
  }


  function imgLink() {
    let link = window.prompt("Insert Link:", "https://");
    if (!link) return;

    let selector = $(".--is--selected");

    if (selector[0]) {
      let node = $("<a></a>").attr({ "href": link, "target": "_blank" });

      node.append(selector.find("img"));
      selector.prepend(node);
    }

  }



  /**
   * Key Featuers for editor.
   * style Shortcuts events
   */
  $(document).on({
    keydown: function (event) {

 
    }
  });


  function debounce(func, ms) {
    let timeout;
    return function () {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, arguments), ms);
    };
  }

  function rendomId() {
    return Math.random().toString(36).substr(2, 5);
  }


}());