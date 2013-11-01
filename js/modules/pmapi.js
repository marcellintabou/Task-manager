/*jslint unparam: true, maxlen: 80, indent: 2, nomen: true*/
/*global jQuery, window, console, jIO, localStorage, alert, jQuery,
setTimeout, insertstates, insertprojects, inserttasks, displaytasks,
define, document, $, confirm, location, parent*/

define(
  ["jquery", 
    "jio",
    "i18next",
    "sha256",
    "overrides",
    "localstorage",
    "complex_queries",
    "jqm",
    "json",
    "text",
    "css",
    "css!modules/pmapi.css",
    "css!lib/jquerymobile/jquery.mobile-1.4.0pre.css"
  ], function ($, jIO, i18next) {
  "use strict";


  var pmapi = {};
  pmapi.run = function () {

    console.log("1: pmapi file loaded");
    //localStorage.clear();

    var jio_local = jIO.createJIO({
      "type": "local",
      "username": "Admin",
      "application_name": "TASK-MANAGER_task"
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
      jio_active_id = "1",
      jio_list = new Array();
      jio_list.push({"id": "1", "name": jio_local});

    function insertstaffs(i, j, jsontasks) {
      if (j === 0) { //j===0 ==> posting project
        jio_project.post(jsontasks.projects[i], function (err, rep) {
          if (i === jsontasks.projects.length - 1) {
            insertstaffs(0, 1, jsontasks);
          } else {
            setTimeout(function () {
              insertstaffs(i + 1, j, jsontasks);
            });
          }
        });
      } else {
        if (j === 1) { //j===0 ==> posting project
          jio_state.post(jsontasks.states[i], function (err, rep) {
            if (i === jsontasks.states.length - 1) {
              insertstaffs(0, 2, jsontasks);
            } else {
              setTimeout(function () {
                insertstaffs(i + 1, j, jsontasks);
              });
            }
          });
        } else {
          jio.post(jsontasks.tasks[i], function (err, rep) {
            if (i === jsontasks.tasks.length - 1) {
              displaytasks();
            } else {
              setTimeout(function () {
                insertstaffs(i + 1, j, jsontasks);
              });
            }
          });
        }
      }
    }

    function filtasklist(err, rep) {
      var i, ftext, cur_row, str = "";
      if (rep.data.total_rows === 0) {
        ident = "auto";
        $(".content-listview").empty().append("<span>No task found, " +
          "click on right top button to create a new task</span>")
          .listview("refresh");
      }

      if (rep.data.rows[0].doc) {
        for (i = 0; i < rep.data.total_rows; i += 1) {
          cur_row = rep.data.rows[i].doc;
          ftext = cur_row.title + " " +
            cur_row.project + " " +
            cur_row.state + " " +
            cur_row.begindate.substring(0, 10).substring(0, 10);
          str += "<li data-filtertext='" + ftext + "'>" +
            "<a class='myLink' href='details.html' data-id='" + cur_row._id +
            "'><span class='titleSpan'>" + cur_row.title + "</span><br/>" +
            "<i>from " + cur_row.begindate.substring(0, 10) + "&nbsp;to " +
            cur_row.enddate.substring(0, 10) + "</i><br/>" +
            "<span class='myspan'>" + cur_row.state + "</span></a></li>";
        }
        $("#sortby").val("#").selectmenu("refresh");
      } else {
        for (i = 0; i < rep.data.total_rows; i += 1) {
          cur_row = rep.data.rows[i].value;
          ftext = cur_row.title + " " +
            cur_row.project + " " +
            cur_row.state + " " +
            cur_row.begindate.substring(0, 10);
          str += "<li data-filtertext='" + ftext + "'>" +
            "<a class='myLink' href='details.html' data-id='" + cur_row._id +
            "'><span class='titleSpan'>" + cur_row.title + "</span><br/>" +
            "<i>from " + cur_row.begindate.substring(0, 10) + "&nbsp;to " +
            cur_row.enddate.substring(0, 10) + "</i><br/>" +
            "<span class='myspan'>" + cur_row.state + "</span></a></li>";
        }
      }
      setTimeout(function () {
        $(".content-listview").empty().append(str).listview("refresh");
        if (ident != "auto") {
          $("a[data-id='" + ident + "']").addClass('ui-btn-active');
        }
        ident = "auto";

        ///////////////////
         /*   var dav = davstorage.createDescription("http://192.168.242.74/uploads", "basic", null, "admin", "admin");
          c onsole*.log(dav);
          var jio_dav = jIO.createJIO(dav);

          jio_dav.post({"_id": "0111", "name": "marcellin"}, function (err, resp) {
            console.log(resp);
            console.log(err);
          });*/
         // }, 20);
         ///////////////////

      }, 10);
    }

    /****************************************************************
    *****************************************************************
    *******************       starting point       ******************
    *****************************************************************
    ****************************************************************/
    jio.allDocs({ "include_docs": true }, function (err, resp) {
      if (resp.data.total_rows > 0) {
        displaytasks();
      } else {
        require(["json!data/tasks.json"], function (tasks) {
          insertstaffs(0, 0, tasks); //insert projects, state and tasks
          //console.log(french);
        });
        jio_config.post({
          "_id": "1",
          "type": "local",
          "username": "me",
          "application_name": "TASK-MANAGER",
          "url":"",
          "realm":""
        });
      }
    });

    $(document).on("click", ".myLink", function(e){
      ident = $(this).eq(0).attr("data-id");
    })
    function displaytasks() {
      /*********************************************************/
      /************** interaction for index page ***************/
      /*********************************************************/

      //console.log("3: displaytasks running");
      $(document).on("pagebeforeshow.index", "#index", function () {
        //console.log("4: pagebeforeshow #index");

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


      // ===================== element bindings ===========================
      //filtering matching list items on jIO
      $(".content-listview").on("listviewbeforefilter", function (e, data) {
        var option = {
          "sort_on": [["title", "ascending"], ["begindate", "ascending"]],
          "select_list": ["_id", "title", "project", "begindate", "enddate",
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
              "% OR begindate: = %" +  filterValue +
              "% OR enddate: = %" + filterValue +
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
        jio.allDocs(
          { "query": "_id: = %",
            "sort_on": [[criteria, "ascending"]],
            "select_list": ["_id", "state", "title", "project", "begindate",
                "enddate"],
            "wildcard_character": '%'
            },
          filtasklist
        );
      });
      // END INDEX

      /***************************************************************/
      /**************** interaction for PROJECT page *****************/
      /***************************************************************/
      $(document).on("pagebeforeshow.projects", "#projects", function () {
        //console.log("Projects page loaded");
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
          { "query": "_id: = %",
            "sort_on": [["project", "ascending"]],
            "select_list": [
              "_id",
              "title",
              "description",
              "begindate",
              "enddate",
              "project",
              "state"
            ],
            "wildcard_character": '%'
            },
          function (err, response) {
            var i, k, j, task, st, str = "", projects = [];
            if (response.data.total_rows === 0) {
              ident = "auto";
              $("#pagecontent").empty().append("<span>No project found, go back to task page an create new task!</span>").listview("refresh");
            }
            for (i = 0; i < response.data.total_rows; i += 1) {
              task = response.data.rows[i].value;
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
              for (k = 0; k < response.data.total_rows; k += 1) {
                task = response.data.rows[k].value;
                if (task.project === projects[j]) {
                  st += "<li><a class='myLink' href='details.html' data-id='" +
                    task._id + "'><span class='titleSpan'>" +
                    task.title + "</span><br/><i>from " +
                    task.begindate.substring(0, 10) + "&nbsp;to " +
                    task.enddate.substring(0, 10) +
                    "</i><br/><span class='myspan'>" + task.state +
                    "</span></a></li>";
                }
              }
              st += "</ol></div>";
              str += st;
            }
            str += "</div>";
            $("#pagecontent").empty().append(str).trigger("create");
            $("#translate-button").addClass("ui-btn-right");
            ident = "auto";
          }
        );
      });
      // END PROJECT

      /***************************************************************/
      /**************** interaction for SETTINGS page ****************/
      /***************************************************************/
      $(document).on("pagebeforeshow.settings", "#settings", function (e, d) {
      //console.log("settings page loaded");
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
          { "query": "_id: = %",
            "sort_on": [["_id", "descending"]],
            "select_list": ["_id", "state"],
            "wildcard_character": '%'
          },
          function (err, response) {
            var i, str = "", cur_row; //section1(states)
            str = "<div data-role='fieldcontain' id='statesset' " +
              "data-mini='true'><form id='stateform'>States:<fieldset " +
              "data-role='controlgroup' id='statefieldset'>";
            for (i = 0; i < response.data.total_rows; i += 1) {
              cur_row = response.data.rows[i].value;
              str += "<label><input class='costum' data-mini='true' name='" +
                cur_row.state + "' id='" + cur_row._id + "' type='checkbox'/>" +
                cur_row.state + "</label>";
            }
            str += "</fieldset><div data-role='controlgroup' " + 
              "data-type='horizontal' data-mini='true' class='controlsclass'>" +
              "<a href='#' data-role='button' class='removestatebutton' " +
              "data-icon='delete'>Delete</a>" +
              "<a data-role='button' class='addstatebutton' " +
              "data-icon='plus'>Add</a></div></form></div>";
              // get list of existing projects
            jio_project.allDocs(
              { "query": "_id: = %",
                "sort_on": [["project", "ascending"]],
                "select_list": ["_id", "project"],
                "wildcard_character": '%'
                },
              function (err, resp) {
                var i, str2 = "", str3 = "";  //section 3 (projects)
                str2 += "<br/><div data-role='fieldcontain' id='projectsset' " +
                  "data-mini='true'><form id='projectform'>Projects:" +
                  "<fieldset data-role='controlgroup' id='projectfieldset'>";
                for (i = 0; i < resp.data.total_rows; i += 1) {
                  str2 += "<label><input type='checkbox' data-mini='true' " +
                    "name='" + resp.data.rows[i].value.project + "' id='" +
                    resp.data.rows[i].value._id + "' class='" +
                    resp.data.rows[i].value.project + "' />" +
                    resp.data.rows[i].value.project + "</label>";
                }
                str2 += "</fieldset><div data-role='controlgroup' " +
                  "data-type='horizontal' class='controlsclass' " +
                  "data-mini='true'><a href='#' data-role='button'" +
                  "class='removeprojectbutton' data-icon='delete'>Delete</a>" +
                  "<a data-role='button' class='addprojectbutton' " +
                  "data-icon='plus'>Add</a></div></form></div>";
                str += str2 + "<br/><hr/><table data-role='table' " + //section storages
                  "data-mode='columntoggle' id='table' class='ui-responsive" +
                  " table-stroke'><thead><tr><th data-priority='1'>Type" +
                  "</th data-priority='1'><th data-priority='4'>Username</th>" +
                  "<th data-priority='1'>App name</th><th data-priority='1'>" +
                  "Switch</th></tr></thead><tbody>";

                jio_config.allDocs({"include_docs": true}, function (err, r) {
                  //console.log(r.data);
                  for (i = 0; i<r.data.total_rows; i++) {

                    str3 += "<tr><td><span class='ok'>" + r.data.rows[i].doc.type +
                      "</span></td><td>" + r.data.rows[i].doc.username + "</td><td>" +
                      "<a href='#storp' class='blabla' data-appname='" + 
                      r.data.rows[i].doc.application_name +
                      "' data-type='" + r.data.rows[i].doc.type + "'";
                    if (r.data.rows[i].doc.type === "dav") {
                      str3 += " data-url='" + r.data.rows[i].doc.url +
                        "' data-realm='" + r.data.rows[i].doc.realm + "'";
                    } else {
                      str3 += " data-url='' data-realm=''";
                    }
                    str3 += " data-username='" + r.data.rows[i].doc.username + "'" +
                      " data-rel='popup' data-position-to='window' " +
                      " data-id='" + r.data.rows[i].doc._id + "'>" +
                      r.data.rows[i].doc.application_name + "</a></td>";

                    if (r.data.rows[i].doc._id === jio_active_id) { //activate default storage
                      str3 += "<td><input type='radio' name='switch' id='" +
                        r.data.rows[i].doc._id + "' checked='checked'/></td></tr>";
                    } else {
                      str3 += "<td><input type='radio' name='switch' id='" +
                      r.data.rows[i].doc._id + "'/></td></tr>";
                    }
                  }
                  str += str3 + "</tbody></table>" +
                    "<div data-role='controlgroup' data-type='horizontal'>" +
                    "<a data-role='button' class='addstorage' href='#storp'" +
                    " data-position-to='window' data-mini='true' " +
                    "data-icon='plus' data-rel='popup'>Add</a></div>";
                  $("#settingscontent").empty().append(str).trigger("create");
                  jio_config.allDocs({"include_docs": true}, function (e, rep) {
                    try_storage(rep, 0); 
                  });
                });
              }
            );
          }
        );
      });

      var storage = {},
        storageaction = "",           //will be set to "create/edit"
        initstorage = function (e) {  //for edition/create new storage
          if (e) {
            storage.id = e.target.getAttribute("data-id");
            storage.type = e.target.getAttribute("data-type");
            storage.url = e.target.getAttribute("data-url");
            storage.username = e.target.getAttribute("data-username");
            storage.appname = e.target.getAttribute("data-appname");
            storage.realm = e.target.getAttribute("data-realm");
          } else {
            storage.id = "";
            storage.type = "";
            storage.url = "";
            storage.username = "";
            storage.appname = "";
            storage.realm = "";
          }
        };

      $(document).on("click", ".blabla", initstorage);

      $(document).on("click", ".addstorage", function(e) {
        initstorage();
        storageaction = "create";
      })

        $(document).on("popupbeforeposition", "#storp", function (event, data) {
          var str;
          if ($("select[name='type']").val() === "local") {
            $("input[name='url']").addClass("ui-disabled");
            $("input[name='realm']").addClass("ui-disabled");
          }
          if( storage.id === "") { //creation
            str = "<div data-role='fieldcontain' data-mini='true'>" +
              "<label for='type'>Type:</label><select name='type' data-mini='true'>" +
              "<option value='dav'>dav</option><option value='local'>local</option></select><label for='url'>" +
            "url:</label><input type='text' name='url' placeholder='required for dav' data-mini='true'/>" +
            "<label for='Appname'>App&nbsp;name:</label><input type='text' name='appname' data-mini='true'/>" +
            "<label for='Username'>Username:</label><input type='text' name='username' data-mini='true'/>" +
            "<label for='realm'>Realm:</label><input type='text' name='realm' data-mini='true'/>" +
            "<br/><div data-role='controlgroup' data-type='horizontal' data-mini='true'>" +
            "<a data-role='button' class='remstorage' data-icon='delete' " +
            "data-mini='true'>Delete</a><a data-role='button' class='savestorage'" +
            " data-mini='true' data-icon='check' href='#'>Save</a></div></div>";
            $("#storp").empty().append(str).trigger("create");
          } else { //edition
            str = "<div data-role='fieldcontain' data-mini='true'>" +
            "<label for='type'>Type:</label><select name='type' data-mini='true'>" +
            "<option value='" + storage.type + "'>" + storage.type + "</option></select><label for='url'>" +
            "url:</label><input type='text' name='url' value='" + storage.url + "' data-mini='true'/>" +
            "<label for='Appname'>App&nbsp;name:</label><input type='text' " +
            "name='appname' value='" + storage.appname + "' data-mini='true'/>" +
            "<label for='Username'>Username:</label><input type='text' value='" + storage.username + "' name='username' data-mini='true'/>" +
            "<label for='realm'>Realm:</label><input type='text' name='realm' value='" + storage.realm + "' data-mini='true'/>" +
            "<input type='hidden' name='id' value='" + storage.id + "'>" +
            "<br/><div data-role='controlgroup' data-type='horizontal' data-mini='true'>" +
            "<a data-role='button' class='remstorage' data-icon='delete' " +
            "data-mini='true'>Delete</a><a data-role='button' class='savestorage'" +
            " data-mini='true' data-icon='check' href='#'>Save</a></div></div>";
            $("#storp").empty().append(str).trigger("create");
            initstorage();
          }

          //bind change to select menu to disable unuded fields
          $("select[name='type']").change(function (e, data) {
            if ($("select[name='type']").val() === "local") {
              $("input[name='url']").addClass("ui-disabled");
              $("input[name='realm']").addClass("ui-disabled");
            } else {
              $("input[name='url']").removeClass("ui-disabled");
              $("input[name='realm']").removeClass("ui-disabled");
            }
          });
        });

      /***************************************************************
      ****************************************************************
      **************** Save a new storage parameters *****************
      ****************************************************************
      ***************************************************************/
      $(document).on("click", ".savestorage", function (e, data) {

        var str, stor = {}, id = $("input[name='id']").val(), jio_check, i;

        stor.username = $("input[name='username']").val();
        stor.application_name = $("input[name='appname']").val();
        stor.type = $("select[name='type']").val();
        stor.url = $("input[name='url']").val();
        stor.realm = $("input[name='realm']").val();
        str = "<tr><td>" + stor.type +"</td><td>" + stor.username + "</td><td>" +
          "<a href='#storp' data-rel='popup' data-position-to='window' class='blabla'" +
          " data-realm='" + stor.realm +
          "' data-appname='" + stor.application_name +
          "' data-username='" + stor.username +
          "' data-type='" + stor.type +
          "' data-url='" + stor.url + "'";

        if (storageaction === "create") { //creating new jio instance
           //console.log("new");
          jio_config.allDocs({"include_docs": true}, function (err, rep) {
            id = rep.data.total_rows + 1;
            stor._id = id.toString();
            if (stor.type === "dav" && stor.url === "") {
                alert("url is required");
                return false;
            }
            if (stor.username === "" || stor.application_name === "") {
              alert("username and appname are required");
              return false;
            }
            $("#storp").popup("close");
            storageaction = "";
            str += " data-id='" + stor._id + "'>" + stor.application_name +
              "</a></td><td><input type='radio' name='switch' id='" +
              stor._id + "'/></td></tr>";
            $("table > tbody").append(str);
            $("table").table("refresh");
            $("#settingscontent").trigger("create");
            $("input[id='" + stor._id + "']").checkboxradio("disable");
            jio_config.post(stor);
            check_storage(stor);
          });

        } else {  //editing an existing jio instance
          //console.log("edition");
          //check whether the storage isn't active before saving edition
          if (jio_active_id === id) {
            alert("Unable to edit active storage");
            $("#storp").popup("close");
            return false;
          }
          // find the storage jio instance name in jio_list
          for (i=0; i < jio_list.length; i++) {
            if (jio_list[i].id === id) {
              jio_check = jio_list[i].name;
            }
          }
          //check if the storage is empty before edition save
          jio_check.allDocs({"include_docs": true}, function (err, respon) {
            if (respon && respon.data.total_rows > 0) {
              alert("Unable,this storage isn't empty");
              $("#storp").popup("close");
              return false;
            }
          });
          stor._id = $("input[name='id']").val();
          $("#storp").popup("close");
          //update the UI table record for the concerning storage
          str += " data-id='" + stor._id + "'>" + stor.application_name +
            "</a></td><td><input type='radio' name='switch' id='" +
            stor._id + "'/></td></tr>";
          $("a[data-id='" + stor._id + "']").parent().parent().replaceWith(str);
          $("table").table("refresh");
          $("#settingscontent").trigger("create");
          $("input[id='" + stor._id + "']").checkboxradio("disable");
          //update the storage record in localstorage jio_config
          jio_config.put(stor);
          //check if the storage is still available
          check_storage(stor);
        }
      });
      /**************************************************************
      ***************************************************************
      ****************  Delete a storage if empty   *****************
      ***************************************************************
      **************************************************************/
      $(document).on("click", ".remstorage", function (e, data) {

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
              alert("problem to remove storage check network or contact your admin");
            }
          })
        }
      });

      /**********************************************************
       *************** remove a given torage id *****************
       *********************************************************/
      function remove_storage (id) {
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
      };
      /***************************************************************
      *************** Switch to the selected storage *****************
      ***************************************************************/
      $(document).on("click", "input[name=switch]", function(e, data) {
        var storage = {}, i;
        for (i=0; i< jio_list.length; i++) {
          if (jio_list[i].id === e.target.getAttribute("id")) {
            jio_active_id = e.target.getAttribute("id");
            jio = jio_list[i].name;
          }
        }
      })

      /**************************************************************
      ***** Check if storage list form jio_config are available *****
      **************************************************************/
      function try_storage (response, i) {
        var jio_jio, i, k = 0, abscent = true, storage = {}, 
          jio_object = {},
        storg = response.data.rows[i];

        storage.type = storg.doc.type;
        storage.application_name = storg.doc.application_name;
        storage.username = storg.doc.username;
        if (storg.doc.type === "dav") {
          storage.url = storg.doc.url;
          storage.realm = storg.doc.realm;
        }
        jio_object.id = storg.doc._id;
        jio_object.name = jIO.createJIO(storage);
        jio_object.name.allDocs({"include_docs": true}, function (error, res) {

          if (error && error.result === "error") {
            $("input[id='" + storg.doc._id + "']").checkboxradio("disable");
          }else {
            while (abscent && k < jio_list.length) {
              if (jio_list[k].id === storg.doc._id) {
                abscent = false;
              }
              k++;
            }
            if (abscent) {
              jio_list.push(jio_object);
            }
          }
          if (i < response.data.total_rows - 1) {
            try_storage(response, i+1);
          }
        });
      };

      /**************************************************************
      ************ Check if a given storage is available ************
      **************************************************************/
      function check_storage (stor) {
        var storage = {}, jio_object = {};

        storage.type = stor.type;
        storage.application_name = stor.application_name;
        storage.username = stor.username;
        if (stor.type === "dav") {
          storage.url = stor.url;
          storage.realm = stor.realm;
        }
        jio_object.id = stor._id;
        jio_object.name = jIO.createJIO(storage);
          jio_object.name.allDocs({"include_docs": true},
          function(err, resp) {
            if (resp) {
              var i = 0, abscent = true;
              $("input[id='" + stor._id + "']").checkboxradio("enable");
              while (abscent && i < jio_list.length) {
                if (jio_list[i].id === stor._id) {
                  abscent = false;
                }
                i++;
              }
              if (abscent) { //put the jio_object in the active jio list
                 jio_list.push(jio_object);
              }
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
        var i = 0, statetr, st,
          stateToRemove = $('#stateform').serialize().split('&');
        function callback(err, resp) {
          jio.allDocs(
            { "query": "state: = \"" + resp.data.rows[0].value.state + "\"",
              "select_list": ["state"],
              "wildcard_character": '%'
              },
            function (er, res) {
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
            st = decodeURI(statetr[0].replace(/\+/g, '%20'));
            if (st === "Started" || st === "Confirmed" || st === "Completed") {
              alert("Unable to remove the default state");
              $("input[name='" + st + "']").attr("checked", false)
                .checkboxradio("refresh");
              return false;
            }
            //select the ID of the state to remove in jIO
            jio_state.allDocs(
              { "query": "state: = \"" + st + "\"",
                "select_list": ["_id", "state"],
                "wildcard_character": '%'
                },
              callback
            );
          }
        }
        if (stateToRemove[0] === "") {
          alert("no state selected to remove");
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
        if (!/^[a-z0-9_ ]+$/i.test(state)) {//Check state to match [a-zA-Z _]
          alert("Expected characters: [a - z, 0 - 9, A - Z_]");
          return false;
        }
        //Find the last ID for incrementing and assigne to the new state
        jio_state.allDocs(
          { "query": "_id: = %",
            "sort_on": [["_id", "descending"]],
            "select_list": ["_id", "state"],
            "wildcard_character": '%'
            },
          function (err, re) {
            var n =  parseInt(re.data.rows[0].value._id.split('-')[1], 10) + 1,
              key = "ST-" + n,
              curRow,
              str,
              i;
            for (i = 0; i < re.data.total_rows; i += 1) {
              if (re.data.rows[i].value.state === state) {
                alert("Dupplicated state name no allowed!");
                return null;
              }
            }
            jio_state.post({"_id": key, "state": state });
            str = "<label><input type='checkbox' name='" + state + "' id='" +
              key + "' class='costum' data-mini='true'/>" + state + "</label>";
            $('#statefieldset .ui-controlgroup-controls').append(str)
              .parent().parent().trigger("create");
          }
        );
      });

      //removing a project
      $(document).on("click", ".removeprojectbutton", function (e, data) {
        var projecttr, pro, i,
          proToRemove = $('#projectform').serialize().split('&');
        function callback2(err, resp) {
          jio.allDocs(
            { "query": "project: = \"" + resp.data.rows[0].value.project + "\"",
              "select_list": ["project"],
              "wildcard_character": '%'
              },
            function (er, res) {
              if (res.data.total_rows === 0) {
                jio_project.remove({"_id": resp.data.rows[0].value._id},
                  function (e, r) {
                    $("#" + resp.data.rows[0].value._id).parent().remove();
                    $('#projectfieldset .ui-controlgroup-controls')
                      .trigger("create");
                  }
                  );
              } else {
                alert("Unauthorized, this project containts tasks");
                $("input[name='" + resp.data.rows[0].value.project + "']")
                  .attr("checked", false)
                  .checkboxradio("refresh");
              }
            }
          );
        }
        for (i = 0; i < proToRemove.length; i += 1) {
          projecttr = proToRemove[i].split('=');
          if (projecttr[1] === "on") { //the project is checked to be removed
            pro = decodeURI(projecttr[0].replace(/\+/g, '%20'));
            jio_project.allDocs(
              { "query": "project: = \"" + pro + "\"",
                "sort_on": [["_id", "descending"]],
                "select_list": ["_id", "project"],
                "wildcard_character": '%'
                },
              callback2
            );
          }
        }
        if (proToRemove[0] === "") {
          alert("Please select one project to remove");
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
        //check the project name to match [a-z, A-Z_ ]
        if (!/^[a-z0-9_ ]+$/i.test(project)) {
          alert("Expected characters: [a-z, 0-9, A-Z_ ]");
          return false;
        }
        //finding the last ID for incrementing and assign to the new project
        jio_project.allDocs(
          { "query": "_id: = %",
            "sort_on": [["_id", "descending"]],
            "select_list": ["_id", "project"],
            "wildcard_character": '%'
            },
          function (err, r) {
            //calculating the new ID 
            var n =  parseInt(r.data.rows[0].value._id.split('-')[1], 10) + 1,
              key = "PR-" + n,
              str,
              i;
            for (i = 0; i < r.data.total_rows; i += 1) {
              if (r.data.rows[i].value.project === project) {
                alert("Dupplicated project name no allowed!");
                return null;
              }
            }
            jio_project.post({"_id": key, "project": project });
            str = "<label><input type='checkbox' name='" + project + "' id='" +
              key + "' class='costum' data-mini='true'/>" + project +
              "</label>";
            $('#projectfieldset .ui-controlgroup-controls')
              .append(str).parent().parent().trigger("create");
          }
        );
      });

      /***************************************************************/
      /**************** interaction for DETAILS page ****************/
      /***************************************************************/
      function validator() {

        var start =  new Date(document.getElementById("begindate").value),
          end =  new Date(document.getElementById("enddate").value),
          title = document.getElementById("title").value;

        if (title) {
          title = title.trim();
        }
        if ((!/^[a-z0-9_ ]+$/i.test(title))) {
          $("#title")
            .attr("placeholder", "Title is required")
            .addClass("ui-focus").css("border", "1px solid red");
          return false;
        }
        if (document.getElementById("begindate").value === "") {
          $("#begindate")
            .attr("placeholder", "Begin date required")
            .addClass("ui-focus").css("border", "1px solid red");
          return false;
        }
        if (document.getElementById("enddate").value === "") {
          $("#enddate")
            .attr("placeholder", "End date required")
            .addClass("ui-focus").css("border", "1px solid red");
          return false;
        }
        if (start > end) {
          $("#enddate").addClass("ui-focus").css("border", "1px solid red");
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
            $("#title").attr("placeholder", "Title").css("border", "");
          } else {
            if (this.id === "begindate") {
              $("#begindate")
              .attr("placeholder", "Begin(yyyy-mm-dd)")
                .removeClass("ui-focus").css("border", "");
            } else {
              if (this.id === "enddate") {
                $("#enddate")
                .attr("placeholder", "End(yyyy-mm-dd)")
                  .removeClass("ui-focus").css("border", "");
              }
            }
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

      $(document).on("pagebeforeshow.details", "#details", function (e, data) {
        console.log("Details page loaded");
        var statestr = "",
          prostr = "",
          i;
        // creating states select list
        jio_state.allDocs(
          {"include_docs": true},
          function (err, response) {
            statestr = "<select name='state' id='state' data-id ='state' " +
              " data-inline='true' data-mini='true' >" +
              "<option value='#'>-- state --</option>";
            for (i = 0; i < response.data.total_rows; i += 1) {
              statestr += "<option value='" + response.data.rows[i].doc.state +
                "'>" + response.data.rows[i].doc.state + "</option>";
            }
            statestr += "</select>";
            // creating projects select list
            jio_project.allDocs(
              {"include_docs": true},
              function (err, resp) {
                var str = "", params, attArray;
                prostr = "<select name='project' data-id ='project'" +
                  " id='project' data-inline='true' data-mini='true'>" +
                  "<option value='#'>-- project --</option>";
                for (i = 0; i < resp.data.total_rows; i += 1) {
                  prostr += "<option value='" + resp.data.rows[i].doc.project +
                    "'>" + resp.data.rows[i].doc.project + "</option>";
                }
                prostr += "</select>";
                if (ident === "auto") { // New task
                  //console.log("new task");
                  str = "<form><div data-role='fieldcontain' data-mini=" +
                    "'true'><input type='text' id='title' name='title' " +
                    "data-mini='true' placeholder='Title'/><input " +
                    "type='hidden' id='id' name='id' value='auto'/><div " +
                    "data-role='fieldcontain' data-mini='true' class=" +
                    "'datediv'><input name='begindate' id='begindate' " +
                    "placeholder='Begin(yyyy-mm-dd)' type='date' data-mini='true'/>" +
                    "</div><div data-role='fieldcontain' data-mini='true' " +
                    "class='datediv'><input name='enddate' id='enddate' " +
                    "type='date' data-mini='true' placeholder='End(yyyy-mm-dd)'/>" +
                    "</div><div data-role='fieldcontain' data-mini='true' >" +
                    prostr + "</div>" +
                    "<div data-role='fieldcontain' data-mini='true' >" +
                    statestr + "</div>" +
                    "<div data-role='fieldcontain' data-mini='true' >" +
                    "<textarea name='description' id='description' " +
                    " data-mini='true' placeholder='Description'>" +
                    "</textarea></div><br/>" +
                    "<div data-role='controlgroup' data-type='horizontal' " +
                    "><a href='index.html' data-mini='true' " +
                    "class='deletetaskbutton ui-disabled' data-icon='delete'" +
                    " data-role='button'>" +
                    "Delete</a><a href='index.html' " +
                    "class='savebut' data-mini='true' data-icon='check' " +
                    "data-role='button' >Save</a></div></form>";
                  $(".fieldcontain1").empty().append(str).trigger("create");
                  bindfocus();
                } else {//edition task
                  //console.log("editing task");
                  jio.allDocs(
                    {
                      "query": "_id: = %" + ident + "%",
                      "sort_on": [["title", "descending"]],
                      "select_list": ["_id", "title", "project", "begindate",
                        "enddate",
                        "state",
                        "description"
                        ],
                      "wildcard_character": '%'
                    },
                    function (err, res) {
                      str = "<form><div data-role='fieldcontain'" +
                        " data-mini='true'><label for='title'>Title:</label>" +
                        " <input type='text' id='title' name='title'  value='" +
                        res.data.rows[0].value.title + "' data-mini='true'" +
                        " placeholder='Title'/></div><input type='hidden'" +
                        " name='id' value='" + res.data.rows[0].value._id +
                        "' id='id'/><div data-role='fieldcontain' " +
                        "data-mini='true' class='datediv'>" +
                        "<label for='begindate' class='datelabel'>Begin&nbsp;date:" +
                        "</label><input name='begindate' id='begindate'" +
                        " placeholder='Begin date' data-mini='true' value='" +
                        res.data.rows[0].value.begindate.substring(0, 10) +
                        "' type='date'/></div><div data-role='fieldcontain'" +
                        " data-mini='true' class='datediv'><label " +
                        " for='enddate'class='datelabel'>End&nbsp;date:</label>" +
                        "<input name='enddate' id='enddate' type='date' value='" +
                        res.data.rows[0].value.enddate.substring(0, 10) + "'" +
                        " placeholder='End date' data-mini='true'/></div>" +
                        "<div data-role='fieldcontain' " +
                        "data-mini='true'><label for='project'>Project:" +
                        "</label>" + prostr + "</div><div data-role=" +
                        "'fieldcontain' data-mini='true'><label " +
                        "for='project'>State:</label>" + statestr + "</div>" +
                        "<div data-role='fieldcontain' data-mini='true'>" +
                        "<label for='description'>Description:</label>" +
                        "<textarea name='textarea' id='description' " +
                        "data-mini='true' placeholder='Description'>" +
                        res.data.rows[0].value.description + "</textarea>" +
                        "</div><br/><div data-role='controlgroup' " +
                        "data-type='horizontal' class='cg'><a href='#' " +
                        "data-mini='true' data-rel='back' " +
                        "class='deletetaskbutton' data-icon='delete' " +
                        "data-role='button'>Delete</a><a href='index.html'" +
                        " class='savebut' data-mini='true' data-icon='check'" +
                        " data-role='button'>Save</a></div></form>";
                      $(".fieldcontain1").empty().append(str).trigger("create");
                      $("#project").val(res.data.rows[0].value.project)
                        .selectmenu("refresh");
                      $("#state").val(res.data.rows[0].value.state)
                        .selectmenu("refresh");
                      bindfocus(); //handle validation effects
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
        var n, object = {};
        e.preventDefault(); // prevent defaul action
        setTimeout(function () {
          if (!validator()) {// stop if no valid field ocur
            return false;
          }; 
          object._id = document.getElementById("id").value;
          object.title = document.getElementById("title").value.charAt(0)
            .toUpperCase() + document.getElementById("title").value.slice(1);
          object.project = document.getElementById("project").value;
          object.state = document.getElementById("state").value;
          object.description = document.getElementById("description").value;
          object.begindate = new Date(document
            .getElementById("begindate").value).toJSON();
          object.enddate = new Date(document.getElementById("enddate").value)
            .toJSON();
          if (document.getElementById("id").value === "auto") { //new task
            //create auto increment ID for the new task
            jio.allDocs(
              {"query": "_id: = %",
                "sort_on": [["_id", "descending"]],
                "select_list": ["_id", "title"]
                },
              function (err, re) {
                if (re.data.total_rows === 0){
                  object._id = "T-0000";
                } else {
                  n = parseInt(re.data.rows[0].value._id.split('-')[1], 10) + 1;
                  object._id = "T-" + n;
                }
                jio.put(object, function (err, response) {
                  ident = object._id;
                  parent.history.back();
                });
              }
            );
          } else { // editing task the ID is in hidden input field
            jio.put(object, function (err, response) {
              parent.history.back();
            });
          }
        }, 50);
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
          jio.remove({
            "_id": document.getElementById("id").value
          }, function (err, resp) {
            if (typeof resp === "object") {
              parent.history.back();
            }
          });
        }
        return false;
      });
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
      };
      if (window.applicationCache) {
        applicationCache.addEventListener('updateready', function() {
          if (confirm('An update is available. Reload now?')) {
            window.location.reload();
          }
        });
      }

      //translation 
      /*$("#translate").change(function(e, data){
        console.log(e.target);
        console.log(i18next);
      });*/
    }
  };
  return pmapi;
});
