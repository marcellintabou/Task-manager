(function () {
  "use strict";

  require.config({
    waitSeconds: 2,
    paths: {
      //plugins (require-css, text, json)
      css:             "plugins/requirejs-plugins/require-css/css",
      normalize:       "plugins/requirejs-plugins/require-css/normalize",
      text:            "plugins/requirejs-plugins/text/text",
      json:            "plugins/requirejs-plugins/json/json",
      i18next:         "plugins/i18next/i18next-1.7.1",
      //librairies (jquery, jquery mobile, jio)
      jquery:          "lib/jquery/jquery-1.10.1",
      jqm:             "lib/jquerymobile/jquery.mobile-1.4.0pre",
      sha256:          "lib/jio/sha256.amd",
      rsvp:            "lib/jio/rsvp-custom.amd",
      jio:             "lib/jio/jio",
      complex_queries: "lib/jio/complex_queries",
      localstorage:    "lib/jio/localstorage",
      davstorage:      "lib/jio/davstorage",
      translate:       "modules/translate",
      overrides:       "modules/overrides"
    },
    shim: {
      "jquery": {exports: "$"},
      "i18next": {deps: ["jquery"]},
      "jqm":     { deps: ["jquery"], exports: "mobile" },
      "overrides": {deps: ["jquery"]}
    },
    map: {
      "*": {
        "css": "plugins/requirejs-plugins/require-css/css"
      }
    }
  });

  require(
    ["modules/pmapi", "translate"],
    function (pmapi, translate) {
      pmapi.run();
      translate.run();
    }
  );
}());

