/*jslint maxlen: 80, indent: 2, nomen: true */
/*global jQuery, window, console, jIO, localStorage, alert, jQuery, setTimeout,
  insertstates, insertprojects, inserttasks, displaytasks, define, document, $,
  confirm, location, parent, require, choose_Storage, try_storage,
  check_storage, davstorage, applicationCache */

/*
(function (dependencies, module) {
  "use strict";
  if (typeof define === 'function' && define.amd) {
    return define(dependencies, module);
  }
  if (typeof exports === 'object') {
    return module(exports,
      require('jquery'),
      require('jio'),
      require('i18next'),
      require('sha256'),
      require('overrides'),
      require('localstorage'),
      require('complex_queries'),
      require('jqm'),
      require('rsvp'),
      require('json'),
      require('text'),
      require('css'),
      require('css!modules/pmapi.css'),
      require('css!lib/jquerymobile/jquery.mobile-1.4.0pre.css')
    );
  }
  // window.jIO = {};
  //module(window.jIO, RSVP, {hex_sha256: hex_sha256});
  }(['exports', 'jquery', 'jio', 'i18next',auth_type
  'sha256', 'overrides', 'localstorage',
  'localstorage', 'complex_queries', 'jqm',
  'rsvp', 'json', 'text', 'css',
  'css!modules/pmapi.css',
  'css!lib/jquerymobile/jquery.mobile-1.4.0pre.css'
  ], function (exports, $, jIO) {
  "use strict";


});


*/
//////////////////////////
define(
  ["jquery",
    "jio",
    "i18next",
    "sha256",
    "overrides",
   // "normalize",
    "localstorage",
    "davstorage",
    "replicatestorage",
    "gidstorage",
    "erp5storage",
    "complex_queries",
    "jqm",
    "rsvp",
    "json",
    "text",
    "css",
    "css!modules/pmapi.css",
    "css!lib/jquerymobile/jquery.mobile-1.4.0pre.css"
    ],
  function ($, jIO) {
    "use strict";

    var pmapi = {};
    pmapi.run = function () {

      console.log("1: pmapi file loaded");
      //localStorage.clear();

      var jio_local = jIO.createJIO({
        "type": "local",
        "username": "Admin",
        "application_name": "TASK-MANAGER"
      }),
        jio_state = jIO.createJIO({
          "type": "local",
          "username": "Admin",
          "application_name": "TASK-MANAGER_state"
        }),
        jio_project = jIO.createJIO({
          "type": "local",
          "username": "Admin",
          "application_name": "TASK-MANAGER_project"
        }),
        jio_config = jIO.createJIO({
          "type": "local",
          "username": "Admin",
          "application_name": "TASK-MANAGER_config"
        }),
        ident = "auto",  //to send task id to details.html page
        jio = jio_local,
        jio_active_id,
        curr_lang = "en",  //default language
        jio_list = [],
        storage_type = "new",
        auth_type = "none", // (none|basic)
        set_lang = function (curr_lang) {  //applie new language translation
          $.i18n.setLng(curr_lang, function (t) {
            $(document).find('.t').i18n();
          });
        },
        uuid = function () {
          function S4() {
            return ('0000' + Math.floor(Math.random() * 0x10000)
                    .toString(16)).slice(-4);
          }
          return S4() + S4() + "-" +
                   S4() + "-" +
                   S4() + "-" +
                   S4() + "-" +
                   S4() + S4() + S4();
        },
        insertstaffs = function (i, j, jsontasks) {
          if (j === 0) { //j===0 ==> posting project
            jsontasks.projects[i].modified = new Date();
            jio_project.post(jsontasks.projects[i], function (err, rep) {
              if (err) {
                console.warn("Error posting initial project ", err);
              }
              if (i === jsontasks.projects.length - 1) {
                insertstaffs(0, 1, jsontasks);
              } else {
                setTimeout(function () {
                  insertstaffs(i + 1, j, jsontasks);
                });
              }
            });
          } else if (j === 1) {
            jsontasks.states[i].modified = new Date();
            jio_state.post(jsontasks.states[i], function (err, rep) {
              if (err) {
                console.warn("Error posting initial state ", err);
              }
              if (i === jsontasks.states.length - 1) {
                insertstaffs(0, 2, jsontasks);
              } else {
                setTimeout(function () {
                  insertstaffs(i + 1, j, jsontasks);
                });
              }
            });
          } else {
            jsontasks.tasks[i].modified = new Date();
            jio.post(jsontasks.tasks[i], function (err, rep) {
              if (err) {
                console.warn("Error posting initial tasks ", err);
              }
              if (i === jsontasks.tasks.length - 1) {
                displaytasks();
              } else {
                setTimeout(function () {
                  insertstaffs(i + 1, j, jsontasks);
                });
              }
            });
          }
        },

        filtasklist = function (err, rep) {
          if (err) {
            console.warn("Error on filtasklist callback ", err);
          }
          var i, ftext, cur_row, str = "";
          for (i = 0; i < rep.data.total_rows; i += 1) {
            jio.repair({_id: rep.data.rows[i].id});
          }
          if (rep.data.total_rows === 0) {
            ident = "auto";
            $(".content-listview")
              .empty()
              .append("<span class='t' " +
                "data-i18n='tasks.content.empty'>No task found, " +
                " click on right top button to create a new task</span>")
              .listview("refresh");
            set_lang(curr_lang);
          }
          if (rep.data.rows[0].doc) {
            for (i = 0; i < rep.data.total_rows; i += 1) {
              cur_row = rep.data.rows[i].doc;
              ftext = cur_row.title + " " +
                cur_row.project + " " +
                cur_row.state + " " +
                cur_row.start.substring(0, 10).substring(0, 10);
              str += "<li data-filtertext='" + ftext + "'>" +
                "<a class='myLink' href='details.html' data-ref='" +
                cur_row.reference + "'><span class='titleSpan'>" +
                cur_row.title + "</span><br/><i><span class='t' " +
                "data-i18n='tasks.content.from'>from </span>" +
                cur_row.start.substring(0, 10) +
                "&nbsp;<span class='t' data-i18n='tasks.content.to'>to " +
                "</span>" + cur_row.stop.substring(0, 10) + "</i><br/>" +
                "<span class='myspan' data-state='" + cur_row.state + "'>" +
                cur_row.state + "</span></a></li>";
            }
            $("#sortby").val("#").selectmenu("refresh");
          } else {
            for (i = 0; i < rep.data.total_rows; i += 1) {
              cur_row = rep.data.rows[i].value;
              ftext = cur_row.title + " " +
                cur_row.project + " " +
                cur_row.state + " " +
                cur_row.start.substring(0, 10);
              str += "<li data-filtertext='" + ftext + "'>" +
                "<a class='myLink' href='details.html' data-ref='" +
                cur_row.reference + "'><span class='titleSpan'>" +
                cur_row.title + "</span><br/><i><span class='t' " +
                "data-i18n='tasks.content.from'>from </span>" +
                cur_row.start.substring(0, 10) +
                "&nbsp;<span class='t' data-i18n='tasks.content.to'>to " +
                "</span>" + cur_row.stop.substring(0, 10) + "</i><br/>" +
                "<span class='myspan' data-state='" + cur_row.state + "'>" +
                cur_row.state + "</span></a></li>";
            }
          }
          setTimeout(function () {
            $(".content-listview").empty().append(str).listview("refresh");
            // perform translation on placeholder
            $(".ui-input-search input")
              .addClass("t")
              .attr("data-i18n", "[placeholder]tasks.content.placeholder;");
            if (ident !== "auto") {
              $("a[data-ref='" + ident + "']").addClass('ui-btn-active');
            }
            ident = "auto";
            set_lang(curr_lang);
          }, 10);
        };
        //jio_list.push({"name": jio_local});

      $.i18n.init({   //initial setup for translation
        lng: 'en',
        load: 'current',
        detectLngQS: 'lang',
        fallbackLng: false,
        ns: 'translation',
        resGetPath: 'lang/__lng__/__ns__.json'
      });

      /****************************************************************
      *****************************************************************
      *******************       starting point       ******************
      *****************************************************************
      ****************************************************************/
      jio.allDocs({ "include_docs": true }, function (err, resp) {
        if (err) {
          console.warn("jio allDocs erro at starting point:", err);
        }
        if (resp.data.total_rows > 0) {
          displaytasks();
        } else {
          require(["json!data/tasks.json"], function (tasks) {
            insertstaffs(0, 0, tasks); //insert projects, state and tasks
          });
          jio_config.post({
            "reference": "baeba5b3-dec7-c06e-1ae3-49585b5bd938",
            "modified": new Date(),
            "storage_type": "local",
            "username": "Admin",
            "application_name": "TASK-MANAGER",
            "type": "Task Report",
            "url": "",
            "realm": ""
          }, function (err, resp) {
            if (err) {
              console.warn("Error posting default jio on jio_config", err);
            }
            jio_active_id = resp.id;
          });
        }
      });

      $(document).on("click", ".myLink", function (e) {
        ident = $(this).eq(0).attr("data-ref");
      });

      function displaytasks() {

        $(document).on("pagebeforeshow.index", "#index", function () {
          // button states footer menu
          if ($('.projectbutton').hasClass('ui-btn-active')) {
            $('.projectbutton').removeClass('ui-btn-active');
          }
          if ($('.settingsbutton').hasClass('ui-btn-active')) {
            $('.settingsbutton').removeClass('ui-btn-active');
          }
          $('.tasklistbutton').addClass('ui-btn-active');
          // initial display of tasks
          jio.allDocs({ "include_docs": true }, filtasklist);
          $("#sortby-button").addClass("ui-btn-left");
        });

        // ========== index page element bindings ===========
        //filtering matching list items on jIO
        $(".content-listview").on("listviewbeforefilter", function (e, data) {
          var option = {
            "sort_on": [["title", "ascending"], ["start", "ascending"]],
            "select_list": ["_id", "title", "project", "start", "stop",
              "state"],
            "wildcard_character": '%'
          },
            sort_string,
            timer,
            filterValue,
            val = data.input.value;
          // 500ms delay to allow entering multiple characters
          if (timer) {
            window.clearTimeout(timer);
          }
          if ((filterValue === undefined) || (val !== filterValue)) {
            timer = window.setTimeout(function () {
              timer = null;
              filterValue = val.trim();
              filterValue = filterValue
                .charAt(0).toUpperCase() + filterValue.slice(1);
              sort_string = "title: = %" + filterValue +
                "% OR project: = %" + filterValue +
                "% OR start: = %" +  filterValue +
                "% OR stop: = %" + filterValue +
                "% OR _id: = %" + filterValue +
                "% OR state: = %" + filterValue + "%";
              option.query = sort_string;
              jio.allDocs(option, filtasklist);
            }, 500);
          }
        });

        // ================ document bindings ====================
        //the listview is reload, based for sort criteria selected
        $("#sortby").change(function (e, data) {
          var criteria = document.getElementById("sortby").value;
          if (criteria === "#") {
            return false;
          }
          jio.allDocs({ "include_docs": true,
            "sort_on": [[criteria, "ascending"]]
            },
            filtasklist);
        });
        // END INDEX

        /***************************************************************/
        /**************** interaction for PROJECT page *****************/
        /***************************************************************/
        $(document).on("pagebeforeshow.projects", "#projects", function () {
          // button states footer menu
          if ($('.settingsbutton').hasClass('ui-btn-active')) {
            $('.settingsbutton').removeClass('ui-btn-active');
          }
          if ($('.tasklistbutton').hasClass('ui-btn-active')) {
            $('.tasklistbutton').removeClass('ui-btn-active');
          }
          $('.projectbutton').addClass('ui-btn-active');
          // initial display of projects
          jio.allDocs(
            {"include_docs": true},
            function (err, resp) {
              if (err) {
                console.warn("Error on jio allDocs on projects page:", err);
              }
              var i, k, j, task, st, str = "", projects = [];
              if (resp.data.total_rows === 0) {
                ident = "auto";
                $("#pagecontent")
                  .empty()
                  .append("<span>No project found, go back to task page an" +
                    " create new task!</span>").listview("refresh");
              }
              for (i = 0; i < resp.data.total_rows; i += 1) {
                task = resp.data.rows[i].doc;
                if ($.inArray(task.project, projects) === -1) {
                  projects.push(task.project); // find if element is in array
                }
                st += "</ol></div>";
                str += st;
              }
              str = "<div data-role='collapsible-set' class='projectgroup' " +
                "data-inset='true'>";
              for (j = 0; j < projects.length; j += 1) {
                st = "<div data-role='collapsible' class='myol' " +
                  " data-inset='true'><h2>" + projects[j] +
                  "</h2><ol data-role='listview' data-inset='true'>";
                for (k = 0; k < resp.data.total_rows; k += 1) {
                  task = resp.data.rows[k].doc;
                  if (task.project === projects[j]) {
                    st += "<li><a class='myLink' href='details.html' " +
                      "data-ref='" + task.reference + "'><span" +
                      " class='titleSpan'>" + task.title + "</span><br/>" +
                      "<i><span class='t' data-i18n='tasks.content.from'>" +
                      "from </span>" + task.start.substring(0, 10) +
                      "&nbsp;<span class='t' data-i18n='tasks.content.to'>to" +
                      " </span>" + task.stop.substring(0, 10) + "</i><br/>" +
                      "<span class='myspan' data-state='" + task.state +
                      "'>" + task.state + "</span></a></li>";
                  }
                }
                st += "</ol></div>";
                str += st;
              }
              str += "</div>";
              $("#pagecontent").empty().append(str).trigger("create");
              ident = "auto";
              set_lang(curr_lang);
            }
          );
        }); // END PROJECT

        /***************************************************************/
        /**************** interaction for SETTINGS page ****************/
        /***************************************************************/
        $(document).on("pagebeforeshow.settings", "#settings", function (e, d) {

          // button states footer menu
          if ($('.projectbutton').hasClass('ui-btn-active')) {
            $('.projectbutton').removeClass('ui-btn-active');
          }
          if ($('.tasklistbutton').hasClass('ui-btn-active')) {
            $('.tasklistbutton').removeClass('ui-btn-active');
          }
          $('.settingsbutton').addClass('ui-btn-active');

          //get list of existing states
          jio_state.allDocs(
            {"include_docs": true},
            function (err, response) {
              if (err) {
                console.warn("Error on allDocs to get default states ", err);
              }
              var i, str = "", cur_row; //section1(states)
              str = "<div data-role='fieldcontain' id='statesset' " +
                "data-mini='true'><form id='stateform'><span  class='t' " +
                "data-i18n='settings.content.states'>States</span>:<fieldset " +
                "data-role='controlgroup' id='statefieldset'>";
              for (i = 0; i < response.data.total_rows; i += 1) {
                cur_row = response.data.rows[i].doc;
                str += "<label><input class='costum' data-mini='true' name='" +
                  cur_row.state + "' id='" + cur_row._id +
                  "' type='checkbox' data-ref='" + cur_row.reference + "'/>" +
                  cur_row.state + "</label>";
              }
              str += "</fieldset><div data-role='controlgroup' " +
                "data-type='horizontal' data-mini='true' " +
                "class='controlsclass'><a href='#' data-role='button' " +
                "class='removestatebutton t' data-icon='delete' " +
                "data-i18n='settings.content.delete'>Delete</a>" +
                "<a data-role='button' class='addstatebutton t' " +
                "data-icon='plus' data-i18n='settings.content.add'>Add</a>" +
                "</div></form></div>";
                // get list of existing projects
              jio_project.allDocs(
                {"include_docs": true},
                function (err, resp) {
                  if (err) {
                    console.warn("Error on jio project allDocs: ", err);
                  }
                  console.log(resp);
                  var str2 = "", str3 = "";  //section 3 (projects)
                  str2 += "<br/><div data-role='fieldcontain' " +
                    "id='projectsset' data-mini='true'><form id='projform'>" +
                    "<span class='t' data-i18n='settings.content.projects'>" +
                    "Projects</span>:<fieldset data-role='controlgroup' " +
                    "id='projectfieldset'>";
                  for (i = 0; i < resp.data.total_rows; i += 1) {
                    cur_row = resp.data.rows[i].doc;
                    str2 += "<label><input type='checkbox' data-mini='true' " +
                    "name='" + cur_row.project + "' id='" + cur_row._id + 
                    "' class='" + cur_row.project + "' data-ref='" + 
                    cur_row.reference + "'/>" + cur_row.project + "</label>";
                  }
                  str2 += "</fieldset><div data-role='controlgroup' " +
                    "data-type='horizontal' class='controlsclass' " +
                    "data-mini='true'><a href='#' data-role='button'" +
                    "class='removeprojectbutton t' data-icon='delete' " +
                    "data-i18n='settings.content.delete'>Delete</a>" +
                    "<a data-role='button' class='addprojectbutton t' " +
                    "data-icon='plus' data-i18n='settings.content.add'>Add" +
                    "</a></div></form></div>";
                  str += str2 + "<br/><hr/><table data-role='table' " +
                    "data-mode='columntoggle' id='table' class='ui-responsive" +
                    " table-stroke'><thead><tr><th data-priority='1' " +
                    "class='t' data-i18n='settings.content.type'>Type" +
                    "</th data-priority='1'><th data-priority='1' class='t'" +
                    " data-i18n='settings.content.appname'>App name</th>" +
                    "<th data-priority='1' class='t' " +
                    "data-i18n='settings.content.switch'>Switch</th></tr>" +
                    "</thead><tbody>";
                  jio_config.allDocs({"include_docs": true}, function (err, r) {
                    if (err) {
                      console.warn("Error on jio_config allDocs: ", err);
                    }
                    for (i = 0; i < r.data.total_rows; i++) {

                      str3 += "<tr  class='ko'><td><span>" +
                        r.data.rows[i].doc.storage_type + "</span></td><td>" +
                        "<a href='#storp' class='blabla' data-appname='" +
                        r.data.rows[i].doc.application_name +
                        "' data-type='" + r.data.rows[i].doc.type + "'";
                      if (r.data.rows[i].doc.storage_type === "dav") {
                        str3 += " data-url='" + r.data.rows[i].doc.url +
                          "' data-realm='" + r.data.rows[i].doc.realm + "'";
                      } else {
                        str3 += " data-url='' data-realm=''";
                      }
                      str3 += " data-username='" + r.data.rows[i].doc.username +
                        "' data-rel='popup' data-position-to='window' " +
                        " data-id='" + r.data.rows[i].doc._id + "'>" +
                        r.data.rows[i].doc.application_name + "</a></td>";

                      if (r.data.rows[i].doc._id === jio_active_id) {
                        str3 += "<td><input type='radio' name='switch' id='" +
                          r.data.rows[i].doc._id +
                          "' checked='checked'/></td></tr>";
                      } else {
                        str3 += "<td><input type='radio' name='switch' id='" +
                          r.data.rows[i].doc._id + "'/></td></tr>";
                      }
                    }
                    str += str3 + "</tbody></table>" +
                      "<hr/><div data-role='controlgroup' " +
                      "data-type='horizontal' class='storagediv'>" +
                      "<select name='type' id='storagetype' " +
                      "data-mini='true'><option value='new'>" +
                      "-- new storage --</option><option value='local'>" +
                      "Local</option><option value='dav'>Dav</option>" +
                      "<option value='erp5'>Erp5</option><option " +
                      "value='replicate'>Replicate</option></select>&nbsp;" +
                      "<a data-role='button' class='addstorage t ui-disabled'" +
                      " href='#storp' data-position-to='window' " +
                      "data-mini='true' data-icon='plus' data-rel='popup'" +
                      " data-i18n='settings.content.add' >Add</a></div>";
                    $("#settingscontent").empty().append(str).trigger("create");
                    choose_Storage();
                    //setup dynamic generated data translation
                    var data_i18n = $("option[value='" + curr_lang + "']")
                      .attr("data-i18n");
                    $("#translate-button").find("span")
                      .attr("data-i18n", data_i18n);
                    $("a.ui-table-columntoggle-btn")
                      .attr("data-i18n", "settings.content.columns")
                      .addClass("t");
                    set_lang(curr_lang);
                    jio_config.allDocs({"include_docs": true}, function (e, r) {
                      if (e) {
                        console.error("Error on jio_config allDocs: ", e);
                      }
                      try_storage(r, 0);
                    });
                  });
                }
              );
            }
          );
          $("#translate").change(function (e, data) { //language change
            var datai18n;
            curr_lang = $("#translate").val();
            if (curr_lang === $.i18n.options.lng) {
              return false;
            }
            datai18n = $("option[value='" +
              curr_lang + "']").attr("data-i18n");
            $("#translate-button").find("span").attr("data-i18n", datai18n);
            $("a.ui-table-columntoggle-btn")
              .attr("data-i18n", "settings.content.columns").addClass("t");
            set_lang(curr_lang);
          });
        });

        /*********************************************************************
         * *******************************************************************
         * *** chose the new storage to create (local, dav or replicate)  ****
         * *******************************************************************
         * *******************************************************************/

        var choose_Storage = function () {
          $("#storagetype").change(function (e, data) { //language change
            storage_type = $("#storagetype").val();
            if (storage_type === "new") {
              $(".addstorage").addClass("ui-disabled");
              return false;
            }
            $(".addstorage").removeClass("ui-disabled");
          });
        },
          storage = {},
          storageaction = "",           //will be set to "create/edit"
          initstorage = function (e) {  //for edition/create new storage
            if (e) {
              storage.id = e.target.getAttribute("data-id");
              storage.storage_type = e.target.getAttribute("data-type");
              storage.url = e.target.getAttribute("data-url");
              storage.appname = e.target.getAttribute("data-appname");
              storage.realm = e.target.getAttribute("data-realm");
            } else {
              storage.id = "";
              storage.storage_type = "";
              storage.url = "";
              storage.username = "";
              storage.appname = "";
              storage.realm = "";
            }
          };

        $(document).on("popupbeforeposition", "#storp", function (event, data) {

          var str = "<div data-role='fieldcontain' data-mini='true'>" +
            storage_type;

          if (storage_type === "local") { //creation
            str += "storage<hr/><label for='appname'>App&nbsp;name:</label>" +
              "<input type='text' name='appname' data-mini='true'/>" +
              "<label for='Username'>Username:</label>" +
              "<input type='text' name='username' data-mini='true'/>";
          } else if (storage_type === "dav") {
            str += "storage<hr/><label for='url'>Url:</label>" +
              "<input type='text' name='url' placeholder='required' " +
              "value='http:\/\/' data-mini='true'/><fieldset " +
              "data-role='controlgroup' data-mini='true'><legend>" +
              "Auth type:</legend><label for='none'>none</label>" +
              "<input type='radio' name='auth_type' data-mini='true' " +
              "id='none' value='none' checked='checked'>" +
              "<label for='basic'>basic</label>" +
              "<input type='radio' name='auth_type'  data-mini='true' " +
              "id='basic' value='basic'></fieldset>" +
              "<label for='realm'>Realm:</label>" +
              "<input type='text' name='realm' data-mini='true' " +
              "class='ui-disabled'/>" +
              "<label for='username'>Username:</label>" +
              "<input type='text' name='username' data-mini='true' " +
              "class='ui-disabled'/>" +
              "<label for='password'>Password:</label>" +
              "<input type='password' name='password' data-mini='true' " +
              "class='ui-disabled'/>";
          } else if (storage_type === "erp5") {
            str += "storage<hr/><label for='url'>Url:</label><input " +
              "type='text' name='url' placeholder='required' " +
              " value='http:\/\/' data-mini='true'/>" +
              "<label for='username'>Username:</label>" +
              "<input type='text' name='username' data-mini='true'/>" +
              "<label for='password'>Password:</label>" +
              "<input type='password' name='password' data-mini='true'/>";
          } else {
            str += "&nbsp;storage for ERP5<hr/><label for='url'>Url:</label>" +
              "<input type='text' name='url' placeholder='required'" +
              " value='http://' data-mini='true'/>" +
              "<label for='username'>Username:</label>" +
              "<input type='text' name='username' data-mini='true'/>" +
              "<label for='password'>Password:</label>" +
              "<input type='password' name='password' data-mini='true'/>";
          }
          str += "<br/><div data-role='controlgroup' data-type='horizontal' " +
            "data-mini='true'>" +
            "<a data-role='button' class='remstorage' data-icon='delete' " +
            "data-mini='true'>Delete</a><a data-role='button' " +
            "class='savestorage' data-mini='true' data-icon='check' " +
            "href='#'>Save</a></div></div>";
          $("#storp").empty().append(str).trigger("create");
        });

        /***************************************************************
        ****************************************************************
        ************   save a new storage in jio_config,     ***********
        ************   check if it's available and display   ***********
        ****************************************************************
        ***************************************************************/
        $(document).on("click", ".savestorage", function (e, data) {

          var str, stor = {};
          stor.storage_type = storage_type;
          stor.application_name = "";
          stor.username = "";
          stor.type = "Task Report";
          stor.ref = uuid();
          if (storage_type === "local") {
            stor.username = $("input[name='username']").val();
            stor.application_name = $("input[name='appname']").val();
          } else if (storage_type === "dav") {
            stor.url = $("input[name='url']").val();
            stor.auth_type = auth_type;  //declared at the top === "none|basic"
            if (auth_type === "basic") {
              stor.username = $("input[name='username']").val();
              stor.password = $("input[name='password']").val();
            }
          } else if (storage_type === "erp5") {
            stor.url = $("input[name='url']").val();
            stor.username = $("input[name='username']").val();
            stor.password = $("input[name='password']").val();
          } else {
            stor.url = $("input[name='url']").val();
            stor.username = $("input[name='username']").val();
            stor.password =  $("input[name='password']").val();
          }
          stor.ref = uuid();
          stor.modified = new Date();
          $("#storp").popup("close");
          jio_config.post(stor, function (e, resp) {
            if (e) {
              console.warn("Error posting new jio instance in jio_config", e);
            }
            str = "<tr class='ko'><td>" + stor.storage_type + "</td><td>" +
              "<a href='#storp' data-rel='popup' data-position-to='window'" +
              " class='blabla' data-appname='" + stor.application_name +
              "' data-username='" + stor.username +
              "' data-type='" + stor.storage_type +
              " data-id='" + resp.id + "'>" +
              stor.application_name +
              "</a></td><td><input type='radio' name='switch' id='" +
              resp.id + "'/></td></tr>";
            $("table > tbody").append(str);
            $("table").table("refresh");
            $("#settingscontent").trigger("create");
            $("input[id='" + resp.id + "']").checkboxradio("disable");
            stor._id = resp.id;
            check_storage(stor);
          });
        });
        /**************************************************************
        ***************************************************************
        ****************  Delete a storage if empty   *****************
        **************************************************************/
        /* $(document).on("click", ".remstorage", function (e, data) {

        var jioToRemov,
          i = 0,
          id = $("input[name='id']").val(),
          abscent = true;
          if (id === "1" || id === jio_active_id) {
          $("#storp").popup("close");
          alert ("Unable to delete default or active storage");
          return false;
        }
        while (abscent && i < jio_list.length) {
          if (jio_list[i].id === id) {
            abscent = false;
          }
          i++;
        }
        if (abscent) {
          remove_storage (id);
        } else {
          jioToRemov = jio_list[i-1].name;
          jioToRemov.allDocs({"include_docs": true}, function (err, respo) {
            if (respo) {
              if (respo.data.total_rows > 0) {
                $("#storp").popup("close");
                alert ("Unable, this storage isn't empty");
              } else {
                remove_storage (id);
              }
            } else {
              alert("problem to remove storage check network or " +
                "contact your admin");
            }
          })
        }
      });*/

      /**********************************************************
       *************** remove a given torage id *****************
       *********************************************************/
       /* function remove_storage (id) {
        var i = 0, jio_to_remove, target = 0;
        jio_config.remove(
          {"_id": id},
          function (err, resp) {
            if (resp) {
              $("#storp").popup("close");
              $("a[data-id='" + id + "']").parent().parent().detach();
              while (i < jio_list.length && target === 0) {
                if (jio_list[i].id === id) {
                  target = i;
                }
                i++;
              }
              if (target != 0) {
                jio_list.splice(target, 1);
              }
            } else {
              alert ("problem to delete storage");
            }
          }
        )
      };*/

        /***************************************************************
        *************** Switch to the selected storage *****************
        ***************************************************************/
        $(document).on("click", "input[name=switch]", function (e, data) {

          jio_active_id = e.target.getAttribute("id");
          jio_config.get(
            {"_id": e.target.getAttribute("id")},
            function (err, resp) {
              if (err) {
                console.warn("Error on jio_config get ", err);
              }
              if (resp.data.storage_type === "local") {
                jio = jIO.createJIO({
                  "type": "local",
                  "username": resp.data.username,
                  "application_name": resp.data.application_name
                });
              } else if (resp.data.storage_type === "dav") {
                jio = jIO.createJIO(
                  davstorage.createDescription({
                    "url": resp.data.url,
                    "auth_type": resp.data.auth_type,
                    "realm": resp.data.realm,
                    "username": resp.data.username,
                    "password": resp.data.password
                  })
                );
              } else if (resp.data.storage_type === "erp5") {
                jio = jIO.createJIO({
                  "type": "erp5",
                  "url": resp.data.url,
                  "username": resp.data.username,
                  "password": resp.data.password
                });
              } else { //replicate storage with erp5
                jio = jIO.createJIO({
                  "type": "replicate",
                  "storage_list": [{
                    "type": "gid",
                    "constraints": {
                      "default": {
                        "type": "string",
                        "reference": "string"
                      }
                    },
                    "sub_storage": {
                      "type": "local",
                      "username": resp.data.username,
                      "application_name": "task-manager"
                    }
                  }, {
                    "type": "gid",
                    "constraints": {
                      "default": {
                        "type": "string",
                        "reference": "string"
                      }
                    },
                    "sub_storage": {
                      "type": "erp5",
                      "url": resp.data.url,
                      "username": resp.data.username,
                      "password": resp.data.password
                    }
                  }]
                });
              }
            }
          );
        });

        /************************************************************
        **** Check if storage list form jio_config are available ****
        *************************************************************/
        var try_storage = function (response, i) {
          var jio_object = {},
            storg = response.data.rows[i];
          if (storg.doc.storage_type === "replicate") {
            jio_object.name = jIO.createJIO({
              "type": "replicate",
              "storage_list": [{
                "type": "gid",
                "constraints": {
                  "default": {
                    "type": "string",
                    "reference": "string"
                  }
                },
                "sub_storage": {
                  "type": "local",
                  "username": storg.doc.username,
                  "application_name": "task-manager"
                }
              },
                {
                  "type": "gid",
                  "constraints": {
                    "default": {
                      "type": "string",
                      "reference": "string"
                    }
                  },
                  "sub_storage": {
                    "type": "erp5",
                    "url": storg.doc.url,
                    "username": storg.doc.username,
                    "password": storg.doc.password
                  }
                }
              ]
            });
          } else {
            if (storg.doc.storage_type === "dav") {
              jio_object.name = jIO.createJIO(
                davstorage.createDescription(
                  storg.doc.url,
                  storg.doc.auth_type,
                  storg.doc.realm,
                  storg.doc.username,
                  storg.doc.password
                )
              );
            } else {
              jio_object.name = jIO.createJIO({
                "type": "local",
                "username": storg.doc.username,
                "application_name": storg.doc.appname
              });
            }
          }
          jio_object.id = storg.doc._id;
          jio_object.name.allDocs({"include_docs": true}, function (e, res) {
            if (e) {
              console.warn(e);
              $("input[id='" + storg.doc._id + "']").checkboxradio("disable");
              $("input[id='" + storg.doc._id + "']")
                .parent()
                .parent()
                .parent()
                .removeClass("ok")
                .addClass("ko");
            } else {
              $("input[id='" + storg.doc._id + "']").checkboxradio("enable")
                .parent()
                .parent()
                .parent()
                .removeClass("ko")
                .addClass("ok");
            }
            if (i < response.data.total_rows - 1) {
              try_storage(response, i + 1);
            }
          });
        };

        /**************************************************************
        ************ Check if a given storage is available ************
        **************************************************************/
        var check_storage = function (stor) {
          var jio_object;

          if (stor.storage_type === "replicate") {
            jio_object = jIO.createJIO({
              "type": "replicate",
              "storage_list": [
                {
                  "type": "gid",
                  "constraints": {
                    "default": {
                      "type": "string",
                      "reference": "string"
                    }
                  },
                  "sub_storage": {
                    "type": "local",
                    "username": stor.username,
                    "application_name": "task-manager"
                  }
                },
                {
                  "type": "gid",
                  "constraints": {
                    "default": {
                      "type": "string",
                      "reference": "string"
                    }
                  },
                  "sub_storage": {
                    "type": "erp5",
                    "url": stor.url,
                    "username": stor.username,
                    "password": stor.password
                  }
                }
              ]
            });
          } else if (stor.storage_type === "dav") {
            jio_object = jIO.createJIO(
              davstorage.createDescription(
                stor.url,
                stor.auth_type,
                stor.realm,
                stor.username,
                stor.password
              )
            );
          } else if (stor.storage_type === "erp5") {
            jio_object = jIO.createJIO({
              "type": "erp5",
              "url":  stor.url,
              "username": stor.username,
              "password": stor.password
            });
          } else {
            jio_object = jIO.createJIO({
              "type": "local",
              "username": stor.username,
              "application_name": stor.appname
            });
          }
          //check if the jio instance is available and put in jio_list if so
          jio_object.allDocs(
            {"include_docs": true},
            function (err, resp) {
              if (err) {
                console.warn("err check_storage", err);
              }
              if (resp) {
                $("input[id='" + stor._id + "']").checkboxradio("enable");
                $("input[id='" + stor._id + "']")
                  .parent()
                  .parent()
                  .parent()
                  .removeClass("ko")
                  .addClass("ok");
              }
            }
          );
        };

        /****************************************************************
        *****************************************************************
        **********   Removing a selected checkbox state from   **********
        **********   localstorage and from checkbox list       **********
        *****************************************************************
        *****************************************************************/
        $(document).on("click", ".removestatebutton", function (e, data) {
          var i = 0, statetr, s,
            stateToRemove = $('#stateform').serialize().split('&');
            console.log(stateToRemove);
          function callback(err, resp) {
            if (err) {
              console.warn("Error on jio_state allDocs", err);
            }
            jio.allDocs(
              { "query": "state: = \"" + resp.data.rows[0].value.state + "\"",
                "select_list": ["state"],
                "wildcard_character": '%'
                },
              function (er, res) {
                if (er) {
                  console.warn("er", er);
                }
                if (res.data.total_rows === 0) {
                  jio_state.remove(
                    {"_id": resp.data.rows[0].value._id},
                    function (e, r) {
                      $("#" + resp.data.rows[0].value._id).parent().remove();
                      $('#statefieldset .ui-controlgroup-controls')
                        .trigger("create");
                    }
                  );
                } else {
                  alert("Unauthorized, this state is used");
                  $("input[name='" + resp.data.rows[0].value.state + "']")
                    .attr("checked", false)
                    .checkboxradio("refresh");
                }
              }
            );
          }
          for (i = 0; i < stateToRemove.length; i += 1) {
            statetr = stateToRemove[i].split('=');
            if (statetr[1] === "on") { //the state is checked to be removed
              s = decodeURI(statetr[0].replace(/\+/g, '%20'));
              if (s === "Started" || s === "Confirmed" || s === "Completed") {
                alert("Unable to remove the default state");
                $("input[name='" + s + "']").attr("checked", false)
                  .checkboxradio("refresh");
                return false;
              } else {
                //select the ID of the state to remove in jIO
                jio_state.allDocs(
                  { "query": "state: = \"" + s + "\"",
                    "select_list": ["_id", "state"],
                    "wildcard_character": '%'
                    },
                  callback
                );
              }
            }
          }
        });

        //adding state in jIO and the state form
        $(document).on("click", ".addstatebutton", function (e) {

          var state = window.prompt("Enter the state pleased");
          if (state) {
            state = state.trim();
          } else {
            return false;
          }
          state = state.charAt(0).toUpperCase() + state.slice(1);
          if (state.lenght < 1) {
            return false;
          }
          jio_state.allDocs(
            { "query": "_id: = %",
              "select_list": ["state"],
              "wildcard_character": '%'
              },
            function (err, re) {
              if (err) {
                console.warn("err2 ", err);
              }
              var str, i;
              for (i = 0; i < re.data.total_rows; i += 1) {
                if (re.data.rows[i].value.state === state) {
                  alert("Dupplicated state name no allowed!");
                  return false;
                }
              }
              jio_state.post(
                { "type": "Task Report",
                  "state": state,
                  "reference": uuid(),
                  "modified": new Date()
                  },
                function (err, resp) {
                  if (err) {
                    console.warn("Error to post new state: ", err);
                  }
                  str = "<label><input type='checkbox' name='" +
                    state + "' id='" + resp.id +
                    "' class='costum' data-mini='true'/>" + state + "</label>";
                  $('#statefieldset .ui-controlgroup-controls').append(str)
                    .parent().parent().trigger("create");
                }
              );
            }
          );
        });

        //removing a project
        $(document).on("click", ".removeprojectbutton", function (e, data) {
          var projecttr, pro, i,
            proToRemove = $('#projform').serialize().split('&');
          function callback2(err, resp) {
            if (err) {
              console.warn("detail allDocs err", err);
            }
            var r = resp.data.rows[0].value;
            jio.allDocs(
              { "query": "project: = \"" + r.project + "\"",
                "select_list": ["project"],
                "wildcard_character": '%'
                },
              function (er, res) {
                if (er) {
                  console.warn("detail allDocs err2 ", er);
                }
                if (res.data.total_rows === 0) {
                  jio_project.remove(
                    {"_id": r._id},
                    function (e, r) {
                      if (e) {
                        console.log("Error on jio_project.remove: ", e);
                      }
                      console.log(r);
                      $("#" + r.id).parent().remove();
                      $('#projectfieldset .ui-controlgroup-controls')
                        .trigger("create");
                    }
                  );
                } else {
                  alert("Unauthorized, this project containts tasks");
                  $("input[name='" + r.project + "']")
                    .attr("checked", false)
                    .checkboxradio("refresh");
                }
              }
            );
          }
          for (i = 0; i < proToRemove.length; i += 1) {
            projecttr = proToRemove[i].split('=');
            if (projecttr[1] === "on") { //project is checked to be removed
              pro = decodeURI(projecttr[0].replace(/\+/g, '%20'));
              jio_project.allDocs(
                { "query": "project: = \"" + pro + "\"",
                  "select_list": ["_id", "project"],
                  "wildcard_character": '%'
                  },
                callback2
              );
            }
          }
        });

        //adding a new project injIO and display in the form
        $(document).on("click", ".addprojectbutton", function (e) {

          var project = window.prompt("Pleased enter the project");
          if (project) {
            project = project.trim();
          } else {
            return false;
          }
          project = project.charAt(0).toUpperCase() + project.slice(1);
          if (project.length < 1) {
            return false;
          }
          jio_project.allDocs(
            { "query": "_id: = %",
              "select_list": ["project"],
              "wildcard_character": '%'
              },
            function (err, r) {
              if (err) {
                console.warn("detail allDocs err3 ", err);
              }
              var str, i;
              for (i = 0; i < r.data.total_rows; i += 1) {
                if (r.data.rows[i].value.project === project) {
                  alert("Dupplicated project name no allowed!");
                  return null;
                }
              }
              jio_project.post(
                {
                  "type": "Task Report",
                  "project": project,
                  "reference": uuid(),
                  "modified": new Date()
                },
                function (err, resp) {
                  if (err) {
                    console.warn("detail allDocs err4 ", err);
                  }
                  str = "<label><input type='checkbox' name='" +
                    project + "' id='" + resp.id +
                    "' class='costum' data-mini='true'/>" +
                    project + "</label>";
                  $('#projectfieldset .ui-controlgroup-controls')
                    .append(str).parent().parent().trigger("create");
                }
              );
            }
          );
        });

        /***************************************************************/
        /**************** interaction for DETAILS page ****************/
        /***************************************************************/
        function validator() {

          var start =  new Date(document.getElementById("start").value),
            end =  new Date(document.getElementById("stop").value),
            title = document.getElementById("title").value;
          if (title) {
            title = title.trim();
          }
          if (title.length < 1) {
            $("#title").addClass("ui-focus").css("border", "1px solid red");
            return false;
          }
          if (document.getElementById("start").value === "") {
            $("#start").addClass("ui-focus").css("border", "1px solid red");
            return false;
          }
          if (document.getElementById("stop").value === "") {
            $("#stop").addClass("ui-focus").css("border", "1px solid red");
            return false;
          }
          if (start > end) {
            $("#stop").addClass("ui-focus").css("border", "1px solid red");
            return false;
          }
          if (document.getElementById("project").value === "#") {
            $("#project")
              .parent().addClass("ui-focus").css("border", "1px solid red");
            return false;
          }
          if (document.getElementById("state").value === "#") {
            $("#state")
              .parent().addClass("ui-focus").css("border", "1px solid red");
            return false;
          }
          return true;
        }

        var bindfocus = function () {
          $("#details input").focus(function (e) { //validation features
            if (this.id === "title") {
              $("#title").css("border", "");
            } else if (this.id === "start") {
              $("#start").removeClass("ui-focus").css("border", "");
            } else if (this.id === "stop") {
              $("#stop").removeClass("ui-focus").css("border", "");
            }
          });
          $("#details select").focus(function (e) {
            if (this.id === "project") {
              $("#project").parent().removeClass("ui-focus").css("border", "");
            } else {
              $("#state").parent().removeClass("ui-focus").css("border", "");
            }
          });
        };

        $(document).on("pagebeforeshow.details", "#details", function (e, d) {
          var statestr = "", prostr = "", i;
          // creating states select list
          jio_state.allDocs(
            {"include_docs": true},
            function (err, respo) {
              if (err) {
                console.warn("jio_state allDocs error: ", err);
              }
              statestr = "<select name='state' id='state' data-id ='state' " +
                " data-inline='true' data-mini='true'><option value='#' " +
                "class='t' data-i18n='details.content.selectstate'>" +
                "-- state --</option>";
              for (i = 0; i < respo.data.total_rows; i += 1) {
                statestr += "<option value='" + respo.data.rows[i].doc.state +
                  "'>" + respo.data.rows[i].doc.state + "</option>";
              }
              statestr += "</select>";
              // creating projects select list
              jio_project.allDocs(
                {"include_docs": true},
                function (err, r) {
                  if (err) {
                    console.warn("detail allDocs err6 ", err);
                  }
                  var str = "";
                  prostr = "<select name='project' data-id ='project'" +
                    " id='project' data-inline='true' data-mini='true'>" +
                    "<option value='#' class='t' " +
                    "data-i18n='details.content.selectproject'>" +
                    "-- project --</option>";
                  for (i = 0; i < r.data.total_rows; i += 1) {
                    prostr += "<option value='" + r.data.rows[i].doc.project +
                      "'>" + r.data.rows[i].doc.project + "</option>";
                  }
                  prostr += "</select>";
                  if (ident === "auto") { // New task
                    str = "<form><div data-role='fieldcontain' data-mini=" +
                      "'true'><input type='text' id='title' name='title' " +
                      "data-mini='true' placeholder='Title' class='t' " +
                      "data-i18n='[placeholder]details.content.title'/><input" +
                      " type='hidden' id='ref' name='ref' value='auto'/><div " +
                      "data-role='fieldcontain' data-mini='true' class=" +
                      "'datediv'><input name='start' id='start' " +
                      "placeholder='Begin(yyyy-mm-dd)' type='date' " +
                      "data-mini='true' class='t' data-i18n" +
                      "='[placeholder]details.content.startformat'/>" +
                      "</div><div data-role='fieldcontain' data-mini='true' " +
                      "class='datediv'><input name='stop' id='stop' " +
                      "type='date' data-mini='true' " +
                      "placeholder='End(yyyy-mm-dd)' class='t' " +
                      "data-i18n='[placeholder]details.content.stopformat'/>" +
                      "</div><div data-role='fieldcontain' data-mini='true'>" +
                      prostr + "</div>" +
                      "<div data-role='fieldcontain' data-mini='true' >" +
                      statestr + "</div>" +
                      "<div data-role='fieldcontain' data-mini='true' >" +
                      "<textarea name='description' id='description' " +
                      " data-mini='true' placeholder='Description' class='t'" +
                      " data-i18n='[placeholder]details.content.description'>" +
                      "</textarea></div><br/>" +
                      "<div data-role='controlgroup' data-type='horizontal'>" +
                      "<a href='index.html' data-mini='true' class=" +
                      "'deletetaskbutton ui-disabled t' data-icon='delete' " +
                      "data-role='button' data-i18n='details.content.delete'>" +
                      "Delete</a><a href='index.html' class='savebut t'" +
                      " data-mini='true' data-icon='check' " +
                      "data-role='button' data-i18n='details.content.save'>" +
                      "Save</a></div></form>";
                    $(".fieldcontain1").empty().append(str).trigger("create");
                    //perform translation to dynamic select menu generated
                    $("#state-button").find("span")
                      .attr("data-i18n", "details.content.selectstate");
                    $("#project-button").find("span")
                      .attr("data-i18n", "details.content.selectproject");
                    bindfocus();
                    set_lang(curr_lang);
                  } else {//edition task
                    jio.allDocs(
                      { "query": "reference: = \"" + ident + "\"",
                        "select_list": [
                          "_id",
                          "reference",
                          "type",
                          "modified",
                          "title",
                          "start",
                          "stop",
                          "state",
                          "description",
                          "project"
                        ],
                        "wildcard_character": '%'
                      },
                      function (err, res) {
                        if (err) {
                          console.warn("Error jio.allDocs in detail.html:", err);
                        }
                        var r = res.data.rows[0].value;
                        str = "<form><div data-role='fieldcontain'" +
                          " data-mini='true'><label for='title' class='t' " +
                          "data-i18n='details.content.title'>Title:</label>" +
                          "<input type='text' id='title' name='title'" +
                          " value='" + r.title + "' data-mini='true' " +
                          "placeholder='Title'/></div><input type='hidden' " +
                          "name='ref' value='" + r.reference +
                          "' id='ref'/><input type='hidden' name='id'" +
                          " id='id' value='" + r._id +
                          "'/><div data-role='fieldcontain' " +
                          "data-mini='true' class='datediv'>" +
                          "<label for='start' class='datelabel t' data" +
                          "-i18n='details.content.start'>Begin&nbsp;date:" +
                          "</label><input name='start' id='start'" +
                          "placeholder='Begin date' data-mini='true' value='" +
                          r.start.substring(0, 10) + "' " +
                          "type='date'/></div><div data-role='fieldcontain'" +
                          " data-mini='true' class='datediv'><label " +
                          "for='stop 'class='datelabel t' " +
                          "data-i18n='details.content.stop'>End&nbsp;date:" +
                          "</label><input name='stop' id='stop' type='date'" +
                          " value='" + r.stop.substring(0, 10) + "'" +
                          " placeholder='End date' data-mini='true'/></div>" +
                          "<div data-role='fieldcontain' " +
                          "data-mini='true'><label for='project' class='t'" +
                          " data-i18n='details.content.project'>Project:" +
                          "</label>" + prostr + "</div><div data-role=" +
                          "'fieldcontain' data-mini='true'><label class='t'" +
                          "for='state' data-i18n='details.content.state'>" +
                          "State:</label>" + statestr + "</div>" +
                          "<div data-role='fieldcontain' data-mini='true'>" +
                          "<label for='description' class='t' " +
                          "data-i18n='details.content.description'>" +
                          "Description:</label><textarea name='textarea'" +
                          "id='description' data-mini='true' placeholder=" +
                          "'Description'>" + r.description +
                          "</textarea></div><br/><div data-role=" +
                          "'controlgroup' data-type='horizontal' class='cg'>" +
                          "<a href='#' data-mini='true' data-rel='back' " +
                          "class='deletetaskbutton t' data-icon='delete' " +
                          "data-role='button' " +
                          "data-i18n='details.content.delete'>Delete</a>" +
                          "<a href='index.html' class='savebut t' " +
                          "data-mini='true' data-icon='check' data-role=" +
                          "'button' data-i18n='details.content.save'>Save" +
                          "</a></div></form>";
                        $(".fieldcontain1").empty()
                          .append(str).trigger("create");
                        $("#project").val(r.project)
                          .selectmenu("refresh");
                        $("#state").val(r.state)
                          .selectmenu("refresh");
                        bindfocus(); //handle validation effects
                        set_lang(curr_lang);
                      }
                    );
                  }
                }
              );
            }
          );
        });

        //Save edited or new task[0].
        $(document).on("click", ".savebut", function (e, data) {
          var object = {};
          e.preventDefault(); // prevent defaul action
          if (!validator()) {// stop if no valid field ocur
            return false;
          }
          object.type = "Task Report";
          object.modified  = new Date();
          object.title = document.getElementById("title").value.charAt(0)
            .toUpperCase() + document.getElementById("title").value.slice(1);
          object.project = document.getElementById("project").value;
          object.state = document.getElementById("state").value;
          object.description = document.getElementById("description").value;
          object.start = new Date(document
            .getElementById("start").value).toJSON();
          object.stop = new Date(document.getElementById("stop").value)
            .toJSON();
          if (document.getElementById("ref").value === "auto") { //new task
            object.reference = uuid();
            jio.post(object, function (err, response) {
              if (err) {
                console.warn("new task err", err);
              }
              ident = object.reference;
              parent.history.back();
            });
          } else { // editing task the ID is in hidden input field
            object.reference = document.getElementById("ref").value;
            object._id = document.getElementById("id").value;
            jio.put(object, function (err, response) {
              if (err) {
                console.warn("error on jio put", err);
              }
              parent.history.back();
            });
          }
        });

        //form removing a given task
        $(document).on("click", ".deletetaskbutton", function (e, data) {
          e.preventDefault();
          if (!validator()) {
            return false;
          }
          var r = confirm("Sure to delete the task " +
            document.getElementById("title").value + "?");
          if (r === true) {
            console.log(document.getElementById("ref").value);
            jio.remove({
              "_id": document.getElementById("id").value
            }, function (err, resp) {
              console.log(resp);
              if (typeof resp === "object") {
                parent.history.back();
              }
            });
          }
          return false;
        });

        // forcing user to start from the index page
        $(document)
          .on("pagebeforecreate.details", "#details", function (e, data) {
            if ($("#index").length === 0) { //force to start from index page
              location.href = "index.html";
            }
          });
        $(document)
          .on("pagebeforecreate.projects", "#projects", function (e, data) {
            if ($("#index").length === 0) { //force to start from index page
              location.href = "index.html";
            }
          });
        $(document)
          .on("pagebeforecreate.settings", "#settings", function (e, data) {
            if ($("#index").length === 0) { //force to start from index page
              location.href = "index.html";
            }
          });
        if ($.mobile.autoInitializePage === false) {
          $.mobile.initializePage();
        } else {
          console.log("autoInitializePage is set to true");
        }
        if (window.applicationCache) {
          applicationCache.addEventListener('updateready', function () {
            if (confirm('An update is available. Reload now?')) {
              window.location.reload();
            }
          });
        }
      };
    }
    return pmapi;
  });
//}));
