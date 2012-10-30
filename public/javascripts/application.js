// the dimensions of the full-size image
var native_width = 3954;
var native_height = 2470;

var waypoints = [];

getDays = function() {
	$.ajax({
		url: '/track/days', 
		dataType: 'json',
		success: function(data) {
			$.each(data.days, function(key, day) {
				$('select#day').append($('<option/>', {value: day.id, text: day.date}));
			});
		}
	});
}

getWaypoints = function() {
	var id = $('select#day option:selected').val();
	$.ajax({
		url: '/track/waypoints/' + id,
		dataType: 'json',
		success: function(data) {
			waypoints = data.waypoints;
			drawSmallMapWaypoints();
		}
	});
};

setupDayDropdown = function() {
	$('select#day').change(function() {
		getWaypoints();
	});
}

setupMagnifyingGlass = function() {
	$(".magnify").mousemove(function(e) {
		//x/y coordinates of the mouse
		//This is the position of .magnify with respect to the document.
		var magnify_offset = $(this).offset();
		//We will deduct the positions of .magnify from the mouse positions with
		//respect to the document to get the mouse positions with respect to the 
		//container(.magnify)
		var mx = e.pageX - magnify_offset.left;
		var my = e.pageY - magnify_offset.top;
	
		//Finally the code to fade out the glass if the mouse is outside the container
		if(mx < $(this).width() && my < $(this).height() && mx > 0 && my > 0)
		{
			$("div.large").fadeIn(100);
		}
		else
		{
			$("div.large").fadeOut(100);
		}
		if($("div.large").is(":visible"))
		{
			//The background position of .large will be changed according to the position
			//of the mouse over the .small image. So we will get the ratio of the pixel
			//under the mouse pointer with respect to the image and use that to position the 
			//large image inside the magnifying glass

			var rx = Math.round(mx/$(".small").width()*native_width - $("div.large").width()/2)*-1;
			var ry = Math.round(my/$(".small").height()*native_height - $("div.large").height()/2)*-1;
			var bgp = rx + "px " + ry + "px";
			
			//Time to move the magnifying glass with the mouse
			var px = mx - $("div.large").width()/2;
			var py = my - $("div.large").height()/2;
			//Now the glass moves with the mouse
			//The logic is to deduct half of the glass's width and height from the 
			//mouse coordinates to place it with its center at the mouse coordinates
			
			//If you hover on the image now, you should see the magnifying glass in action
			$("div.large").css({left: px, top: py, backgroundPosition: bgp});
      
			$('div.info').text("rx: " + rx + ", ry: " + ry);

			drawMagnifiedWaypoints(rx, ry);
		}
	});
};

drawMagnifiedWaypoints = function(rx, ry) {
	var scale_x = 1.5; 
	var scale_y = 0.75;

	$('#routeCanvas').clearCanvas({
		x: 0, y: 0,
		width: native_width, height: native_height
	});

	$.each(waypoints, function(i, waypoint) {
		$("#routeCanvas").drawPolygon({
			strokeStyle: "#0f0",
			strokeWidth: 10,
			x: scale_x * (waypoint.x + rx), y: scale_y * (waypoint.y + ry),
			radius: 8,
			sides: 3
		});	
	});
};

drawSmallMapWaypoints = function() {
	var originX = 1147;
	var originY = 22;

	$('#smallRouteCanvas').clearCanvas({
		x: 0, y: 0,
		width: 1280, height: 800
	});

	$.each(waypoints, function(i, waypoint) {
		console.log(waypoint);
		$("#smallRouteCanvas").drawPolygon({
			strokeStyle: "#0f0",
			strokeWidth: 8,
			x: originX + waypoint.x, y: originY + waypoint.y,
			radius: 6,
			sides: 3
		});	
	});
}

$('body').waitForImages(function() {
  $('.loader').hide();
	$('.fade').fadeIn(2000, function() {});  
});

$(document).ready(function() {
	getDays();
	setupMagnifyingGlass();	
	setupDayDropdown();
});
