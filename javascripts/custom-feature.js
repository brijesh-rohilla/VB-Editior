(function () {
  'use strict';

  $('#doc-download').click(function () {
    let link = document.createElement('a');
    link.download = 'vb-doc.html';

    let blob = new Blob([htmlTemplete(parseSourceCode())], { type: 'text/html' });

    link.href = URL.createObjectURL(blob);
    link.click();

    URL.revokeObjectURL(link.href);
  });

  function parseSourceCode() {
    let notRemove = 'br, hr, img';
    let selector = $('<div></div>');
    selector.html($('#text-editor').html());

    selector.find(':not(' + notRemove + '):empty').remove();

    selector.find('*').removeClass('sl-elm n-sl-elm').removeAttr('contentEditable');

    selector.find('*').each(function () {
      if (!$(this).attr('class')) {
        $(this).removeAttr('class');
      }
    });

    selector.find('img').attr('href', '../path/to/image');

    return selector.html();
  }

  // HTML htmlTemplete
  function htmlTemplete(data) {
    return `<!doctype html>
<html class="no-js" lang="">

<head>

  <meta charset="utf-8">
  <title></title>
  <meta name="description" content="">
  <meta name="viewport" content="width=device-width, initial-scale=1">

  <meta property="og:title" content="">
  <meta property="og:type" content="">
  <meta property="og:url" content="">
  <meta property="og:image" content="">
  <meta name="theme-color" content="#fafafa">

  <link rel="manifest" href="site.webmanifest">
  <link rel="apple-touch-icon" href="icon.png">
  <link rel="canonical" href="">
  <!-- Place favicon.ico in the root directory -->

  <link rel="stylesheet" type="text/css" href="css/bootstrap-4.5.0.min.css">
  <link rel="stylesheet" type="text/css" href="css/main.css">
</head>

<body>
  <!-- ============================================================= -->

${data}

  <!-- ============================================================= -->
  <script src="js/vendor/modernizr-3.11.2.min.js"></script>
  <script src="js/plugins.js"></script>
  <script src="js/main.js"></script>
  <!-- Google Analytics: change UA-XXXXX-Y to be your site's ID. -->
  <script>
window.ga = function() { ga.q.push( arguments ) };
ga.q = [];
ga.l = +new Date;
ga( 'create', 'UA-XXXXX-Y', 'auto' );
ga( 'set', 'anonymizeIp', true );
ga( 'set', 'transport', 'beacon' );
ga( 'send', 'pageview' )
  </script>
  <script src="https://www.google-analytics.com/analytics.js" async></script>
</body>

</html>`;
  }
})();
