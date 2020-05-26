/*
* jQuery Plugin developed by Mario Duarte
* https://github.com/Mario-Duarte
* Simple jQuery plugin that converts an image into a click to zoom image
* perfect for store products and galleries
*/
(function($){

	function ReplaceWithPolyfill() {
		'use-strict'; // For safari, and IE > 10
		var parent = this.parentNode, i = arguments.length, currentNode;
		if (!parent) return;
		if (!i) // if there are no arguments
		parent.removeChild(this);
		while (i--) { // i-- decrements i and returns the value of i before the decrement
		currentNode = arguments[i];
		if (typeof currentNode !== 'object'){
			currentNode = this.ownerDocument.createTextNode(currentNode);
		} else if (currentNode.parentNode){
			currentNode.parentNode.removeChild(currentNode);
		}
		// the value of "i" below is after the decrement
		if (!i) // if currentNode is the first argument (currentNode === arguments[0])
			parent.replaceChild(currentNode, this);
		else // if currentNode isn't the first
			parent.insertBefore(currentNode, this.previousSibling);
		}
	}
	if (!Element.prototype.replaceWith) {Element.prototype.replaceWith = ReplaceWithPolyfill;}
	if (!CharacterData.prototype.replaceWith) {CharacterData.prototype.replaceWith = ReplaceWithPolyfill;}
	if (!DocumentType.prototype.replaceWith) {DocumentType.prototype.replaceWith = ReplaceWithPolyfill;}

	const imageObj = {};

	$.fn.imageZoom = function(options) {

		let settings = $.extend({
            // These are the defaults.
            zoom: 150,
        }, options );

		imageObj.template = `
			<figure class="containerZoom" style="background-image:url(${this.attr('src')}); background-size: ${settings.zoom}%;">
				<img id="imageZoom" src="${this.attr('src')}" alt="${this.attr('alt')}" />
			</figure>
		`;

		function zoomIn(e){
			let zoomer = e.currentTarget;
			let x,y,offsetX,offsetY;
			e.offsetX ? offsetX = e.offsetX : offsetX = e.touches[0].pageX;
			e.offsetY ? offsetY = e.offsetY : offsetY = e.touches[0].pageX;
			x = offsetX/zoomer.offsetWidth*100;
			y = offsetY/zoomer.offsetHeight*100;
			$(zoomer).css({"background-position" : `${x}% ${y}%`});
		}

		function attachEvents(container) {

			container = $(container);
			console.log(container);

			container.on('click', function(e){

				if ( "zoom" in imageObj == false ) {
					// zoom is not defined, let define it and set it to false
					imageObj.zoom = false;
				}

				if (imageObj.zoom) {
						imageObj.zoom = false;
						$(this).removeClass('active');
					} else {
						imageObj.zoom = true;
						$(this).addClass('active');
						zoomIn(e);
					}

				});

			container.on('mousemove', function(e) {
				imageObj.zoom ? zoomIn(e) : null;
			});


			container.on('mouseleave', function() {
				imageObj.zoom = false;
				$(this).removeClass('active');
			});

		}
		
		let newElm = $(this).replaceWith(imageObj.template);
		attachEvents($('.containerZoom')[$('.containerZoom').length - 1]);

		return newElm;

	};

}(jQuery));
