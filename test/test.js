(function( $ ){

 module("INDEX TEST", {});

asyncTest( "The page should be enhanced correctly", function(){
	expect(2);
	setTimeout(function () {
	$.testHelper.pageSequence([
				function(){
			    console.log("test");
// 				  $.mobile.changePage( $( "#index" ) );
				},
				
				function() {
					var $page = $( "#index" );

			/*var jio = jIO.newJio({
						"type": "local",
						"username": "Marco",
						"application_name": "Marco_PMAPI"
					}),
					jio_state = jIO.newJio({
						"type": "local",
						"username": "Marco",
						"application_name": "Marco_PMAPI_state"
					}),
					jio_project = jIO.newJio({
						"type": "local",
						"username": "Marco",
						"application_name": "Marco_PMAPI_project"
					});
					*/
      //	stop(); //stop() / start() pour indiquer à qunit de stopper le test et de le relancer apres  le jioallDocs
  // 					jio.allDocs(
  // 						{ "include_docs": true },
  // 						function (err, res) {
        
          ok( localStorage.length > 0, "localStorage is enable:" + localStorage.length + " items");
          //console.log(document.getElementsByTagName("li"));
          //ok(document.getElementsByTagName("li").length > 0, "some task loaded " + document.getElementsByTagName("li").length + " tasks");
          console.log($(".content-listview li").length > 0, "some task loaded " + $(".content-listview li").length + " tasks");
          ok($(".content-listview li").length > 0, "some task loaded " + $(".content-listview li").length + " tasks");
          start();
      }
	]);
	}, 2000);
});



// asyncTest( "The page should be loaded correctly", function(){
// 	expect( 3 );
// 	console.log($)
// 	console.log($.testhelper)
// 	$.testHelper.pageSequence([
  // 				function(){
  // // 					$.mobile.changePage( $( "#basic-collapsible-test" ) );
  //           //console.log(contentWindow.document);
  //           //contentWindow.document.location.href = "../index.html";
  // 					$.mobile.changePage( "#index" );
  // 				},
// 				function() {
// 					console.log("hello world");
// 					//var $page = $( "#basic-collapsible-test" );
// 					var $page = $("#index").trigger("create");
// 
// 						ok( localStorage.length > 0, "localStorage is enable:" + localStorage.length + " items");
// 					ok($page.find( "li" ).length > 0, "some task loaded" );
// 				//	ok($page.find( ".ui-content >:eq(0) >:header" ).hasClass( "ui-collapsible-heading" ), ".ui-collapsible-heading class added to collapsible heading" );
// 				//	ok($page.find( ".ui-content >:eq(0) > div" ).hasClass( "ui-collapsible-content" ), ".ui-collapsible-content class added to collapsible content" );
// 				//	ok($page.find( ".ui-content >:eq(0)" ).hasClass( "ui-collapsible-collapsed" ), ".ui-collapsible-collapsed added to collapsed elements" );
// 				//	ok(!$page.find( ".ui-content >:eq(1)" ).hasClass( "ui-collapsible-collapsed" ), ".ui-collapsible-collapsed not added to expanded elements" );
// 					console.log("starting")
// 					start();
// 				}
// 	]);
// });
})(jQuery);