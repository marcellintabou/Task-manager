//set namespace for unit test markp
jQuery( document ).bind( "mobileinit", function(){
  console.log(jQuery.mobile.ns);
	jQuery.mobile.ns = "nstest-";
  console.log(jQuery.mobile.ns);
});