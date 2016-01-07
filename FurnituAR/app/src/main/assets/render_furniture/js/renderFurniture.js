console.log('selection: ' + selectionData.selection);
console.log('y-bearing: ' + selectionData.bearingN);
console.log('x-bearing: ' + selectionData.bearingE);


var World = {
	loaded: false,
	rotating: false,
	lastTouch: {
		x: 0,
		y: 0
	},
	bearing: undefined,
	rotateOrTranslate: 'translate',
	interactionContainer: 'gestureContainer',
//	previousOrientation: undefined,

	init: function initFn() {
		this.createModelAtLocation();
	},

	createModelAtLocation: function createModelAtLocationFn() {

		var location = new AR.RelativeLocation(null, selectionData.bearingN * 5, selectionData.bearingE * 5, 1);

		World.model3DObj = new AR.Model(selectionData.selection + '.wt3', {
			onLoaded: this.worldLoaded,
			scale: {
				x: 0.2,
				y: 0.2,
				z: 0.2
			},
			translate: {
				x: 0.0,
				y: 1, //originally 0.05
				z: 0.0
			}
		});

        var indicatorImage = new AR.ImageResource("indi.png");
        var imgRotate = new AR.ImageResource("rotateButton.png");

        var indicatorDrawable = new AR.ImageDrawable(indicatorImage, 0.1, {
            verticalAnchor: AR.CONST.VERTICAL_ANCHOR.TOP
        });

		var obj = new AR.GeoObject(location, {
            drawables: {
               cam: [this.model3DObj],
               indicator: [indicatorDrawable]
            }
        });

        World.addInteractionEventListener();
	},

	worldLoaded: function worldLoadedFn() {
		World.loaded = true;
		var e = document.getElementById('loadingMessage');
		e.parentElement.removeChild(e);
	},

	handleTouchStart: function handleTouchStartFn(event) {
		World.swipeAllowed = true;

		World.lastTouch.x = event.touches[0].clientX;
		World.lastTouch.y = event.touches[0].clientY;

		event.preventDefault();
	},

	handleTouchMove: function handleTouchMoveFn(event) {

//		console.log('handleTouchMove has been called!')
		if (World.swipeAllowed){
			var touch = {
				x: event.touches[0].clientX,
				y: event.touches[0].clientY
			};
			var movement = {
				x: 0,
				y: 0
			};
			var remappedMovement = World.calculateMovement;

			movement.x = remappedMovement.x; // (World.lastTouch.x - touch.x) * -1;
			movement.y = remappedMovement.y; // (World.lastTouch.y - touch.y) * -1;

			if(World.rotateOrTranslate === 'translate'){

				World.model3DObj.translate.x += (movement.x * 0.25);
//				console.log('y changing by ' + (movement.y * 0.25))
				World.model3DObj.translate.z += (movement.y * 0.25);

			} else{

				World.model3DObj.rotate.heading += (movement.x * 0.3);
				World.model3DObj.rotate.tilt += (movement.y * 0.3);
			}

			World.lastTouch.x = touch.x;
			World.lastTouch.y = touch.y;
		}

		event.preventDefault();
    },

    raiseButton: function() {

    	World.model3DObj.translate.y += 0.8;
    	console.log('translate Y: ' + World.model3DObj.translate.y)

    },

	lowerButton: function() {

		World.model3DObj.translate.y -= 0.8;
		console.log('translate Y: ' + World.model3DObj.translate.y)

	},

    rotateTranslateToggle: function() {

		if(World.rotateOrTranslate === 'translate'){
			World.rotateOrTranslate = 'rotate'
			console.log('rotateOrTranslate: ' + World.rotateOrTranslate)
		} else{
			World.rotateOrTranslate = 'translate'
			console.log('rotateOrTranslate: ' + World.rotateOrTranslate)
		}
	},

	calculateAxes: function() {
		var landscape = 90;

		if(window.orientation === landscape) {
            World.isFlipXOn = true;
            World.isFlipYOn = true;
		} else {
			World.isFlipXOn = false;
			World.isFlipYOn = false;
		}
	},

	calculateMovement: function(touch) {
		var remappedMovement = { 'x': 0, 'y': 0 };
		var diffX = World.lastTouch.x - touch.x;
		var diffY = World.lastTouch.y - touch.y;
		console.log("diffX: " + diffX + "; diffY: " + diffY);
		var bearing = World.bearing;
		remappedMovement.x = diffX * Math.cos(bearing) + diffY * Math.sin(bearing);
		remappedMovement.y = diffY * Math.cos(bearing) + diffX * Math.sin(bearing);
		remappedMovement.x = -remappedMovement.x;
		remappedMovement.y = -remappedMovement.y;
		console.log(remappedMovement);
		return remappedMovement;
	},

	calculateXMovement: function(touch) {
		if(World.isFlipXOn) { return (World.lastTouch.y - touch.y) * -1; }
        return (World.lastTouch.x - touch.x) * -1;
	},

	calculateYMovement: function(touch) {
		if(World.isFlipYOn) { return (World.lastTouch.x - touch.x) * -1; }
			return (World.lastTouch.y - touch.y) * -1;
	},

	checkOrientation: function() {
		if(window.orientation !== previousOrientation) {
			previousOrientation = window.orientation
			World.calculateAxes();
		}
	},

	addInteractionEventListener: function addInteractionEventListenerFn() {
//		console.log('addInteractionEventListener called')
		document.getElementById(World.interactionContainer).addEventListener('touchstart', World.handleTouchStart, false);
		document.getElementById(World.interactionContainer).addEventListener('touchmove', World.handleTouchMove, false);
		document.getElementById("rotate_translate_anchor").addEventListener("click", World.rotateTranslateToggle);
		document.getElementById("raise_anchor").addEventListener("click", World.raiseButton);
		document.getElementById("lower_anchor").addEventListener("click", World.lowerButton);
		window.addEventListener("resize", World.checkOrientation, false);
		window.addEventListener("orientationchange", World.checkOrientation, false);
	}

};

World.init();

function readBearingJSON() {
	var items = [];
	console.log("readBearingJSON");
	$.getJSON("file:///sdcard/Android/data/com.example.deon.furnituar/cache/bearing.json", function(data) {
		console.log(data);
		$.each(data, function(key, value) {
		console.log(data);
		console.log("key: " + key + "; value: " + value);
			items.push({key: value});
		});
	})
	return items;
}
function alignAxes(json) {
	World.userBearing = json.bearing;
}
$(document).ready(function() {
	console.log("document ready");
    setInterval(function() {
        var json = readBearingJSON();
        alignAxes(json);
    }, 333);
});

