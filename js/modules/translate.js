define(["jquery", "i18next"], function ($) {
  var translate = {};
  translate.run = function () {
    $(document).on("pagebeforeshow.projects", "#projects", function () {
      $("#translate").change(function(e, data){

        var lan = $("#translate").val();
        if (lan === $.i18n.options.lng) {
          return false;
        };
        console.log($.i18n.options.lng);
        $.i18n.setLng(lan, function(t) {
          console.log($(document).find('.t'));
          $(document).find('.t').i18n();
        });
      });
    });

    $.i18n.init({
      lng: 'en',
      load: 'current',
      detectLngQS: 'lang',
      fallbackLng: false,
      ns: 'translation',
      resGetPath: 'lang/__lng__/__ns__.json'
    }, function (t) {
      console.log($.i18n);
    });
  };
  return translate ;
});