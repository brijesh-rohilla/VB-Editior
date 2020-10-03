# VB-Editor
Free and open-source Web-based JavaScript Web Editor.

Note: The HTML generated is totally dependent on bootstrap classes. In the future, we may provide some basics CSS for rendering content.

## Features

* Toolbar that's dance on your hand.
* Styles supported : 
  <b>`bold`</b>,    <b>`italic`</b>,
<b>`underline`</b>, <b>`deleted`</b>,
<b>`highlight`</b>, <b>`small`</b>,
<b>`subscript`</b>, <b>`superscript`</b>

* Headings : <br>
	<b>`<h1>`</b> - main heading <br>
	<b>`<h2>`</b> - sub heading <br>
	<b>`<h3>`</b> - super heading

* Paragraph
* Images
* Lists
* Links
* Quotes

### Key Features

* `Ctrl` then click on text - select the text. (styled)
* `Alt + c` - Toggle text color dropdown.
* `Ctrl + Shift` - Tiggle Toolbar. (when you need to hide toolbar and vice versa)


### control newly created element

* `by default` elements are created and append at the very last.
* `Ctrl` - elements are created and append at the last of the selected element.
* `Ctrl + Shift` - elements are created and append at the before of selected element.

	(Here, elements means new Headings, Paragraph, Lists, Quots etc.)

## Killed by us

* We decide to remove the text-colors. Because we found, there is no need for colored text in blog posts.
* We decide to keep only one `h1` main heading (on the top of the doc).