(function ($, document) {
  "use strict";

  $(document).bind("mobileinit", function () {
    $.mobile.autoInitializePage = false;
    $.mobile.defaultPageTransition = 'none';
  });
}(jQuery, document));
