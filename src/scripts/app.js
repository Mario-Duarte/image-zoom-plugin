/*!
jQuery Plugin developed by Mario Duarte
https://github.com/Mario-Duarte/image-zoom-plugin/
Simple jQuery plugin that converts an image into a click to zoom image
perfect for store products and galleries
*/
(function ($) {
	// Thanks to Mozilla for this polyfill
	// find out more on - https://developer.mozilla.org/en-US/docs/Web/API/ChildNode/replaceWith
	function ReplaceWithPolyfill() {
		"use-strict";

		// For safari, and IE > 10
		var parent = this.parentNode,
			i = arguments.length,
			currentNode;
		if (!parent) return;
		if (!i)
			// if there are no arguments
			parent.removeChild(this);
		while (i--) {
			// i-- decrements i and returns the value of i before the decrement
			currentNode = arguments[i];
			if (typeof currentNode !== "object") {
				currentNode = this.ownerDocument.createTextNode(currentNode);
			} else if (currentNode.parentNode) {
				currentNode.parentNode.removeChild(currentNode);
			}
			// the value of "i" below is after the decrement
			if (!i)
				// if currentNode is the first argument (currentNode === arguments[0])
				parent.replaceChild(currentNode, this);
			// if currentNode isn't the first
			else parent.insertBefore(currentNode, this.previousSibling);
		}
	}
	if (!Element.prototype.replaceWith) {
		Element.prototype.replaceWith = ReplaceWithPolyfill;
	}
	if (!CharacterData.prototype.replaceWith) {
		CharacterData.prototype.replaceWith = ReplaceWithPolyfill;
	}
	if (!DocumentType.prototype.replaceWith) {
		DocumentType.prototype.replaceWith = ReplaceWithPolyfill;
	}
	const imageObj = {};
	$.fn.imageZoom = function (options) {
		// Default settings for the zoom level
		let settings = $.extend(
			{
				zoom: 150,
				fullWidth: false,
			},
			options
		);

		// Function to calculate zoom percentage based on fullWidth setting
		function calculateZoomPercentage(imgElement, containerElement) {
			if (
				!settings.fullWidth ||
				!imgElement ||
				!imgElement.naturalWidth
			) {
				return `${settings.zoom}%`;
			}

			const containerWidth = containerElement
				? containerElement.clientWidth
				: 0;
			if (!containerWidth) {
				return `${settings.zoom}%`;
			}

			const zoomPercentage =
				(imgElement.naturalWidth / containerWidth) * 100;
			return `${zoomPercentage < 100 ? settings.zoom : zoomPercentage}%`;
		}

		// Main html template for the zoom in plugin
		imageObj.template = `
			<figure class="containerZoom" style="background-image:url('${$(this).attr(
				"src"
			)}'); background-size: ${settings.zoom}%;">
				<img id="imageZoom" src="${$(this).attr("src")}" alt="${$(this).attr("alt")}" />
			</figure>
		`;

		// Helper function to get touch information consistently across different events
		function getTouchInfo(e) {
			// Try originalEvent.touches first (jQuery normalized), then fall back to native touches
			const touches =
				(e.originalEvent && e.originalEvent.touches) || e.touches;
			return {
				touches: touches,
				length: touches ? touches.length : 0,
				isValid: touches && touches.length > 0,
			};
		}

		// Helper function to check if event is a touch event
		function isTouchEvent(e) {
			return (
				e.type === "touchstart" ||
				e.type === "touchmove" ||
				e.type === "touchend"
			);
		}

		// Helper function to check if touch interaction should be allowed (single finger only)
		function shouldAllowTouchInteraction(e) {
			if (!isTouchEvent(e)) {
				return true; // Allow mouse events
			}

			const touchInfo = getTouchInfo(e);
			return touchInfo.length === 1; // Only allow single finger touch
		}

		// Where all the magic happens, This will detect the position of your mouse
		// in relation to the image and pan the zoomed in background image in the
		// same direction
		function zoomIn(e) {
			let zoomer = e.currentTarget;
			if (!zoomer || !e) {
				return;
			}

			let x, y, offsetX, offsetY;
			let zoomerOffset = $(zoomer).offset();

			// Check if element offset is available
			if (!zoomerOffset) {
				return;
			}

			if (e.type === "mousemove") {
				offsetX = e.offsetX || e.clientX - zoomerOffset.left;
				offsetY = e.offsetY || e.clientY - zoomerOffset.top;
			} else if (e.type === "touchmove") {
				const touchInfo = getTouchInfo(e);

				// Only allow single finger touch interactions
				if (!shouldAllowTouchInteraction(e)) {
					return;
				}

				if (touchInfo.isValid) {
					e.preventDefault();
					offsetX = Math.min(
						Math.max(
							0,
							touchInfo.touches[0].pageX - zoomerOffset.left
						),
						zoomer.offsetWidth
					);
					offsetY = Math.min(
						Math.max(
							0,
							touchInfo.touches[0].pageY - zoomerOffset.top
						),
						zoomer.offsetHeight
					);
				} else {
					return;
				}
			}

			// Check if offsetX and offsetY are valid numbers and zoomer dimensions exist
			if (
				typeof offsetX !== "number" ||
				typeof offsetY !== "number" ||
				!zoomer.offsetWidth ||
				!zoomer.offsetHeight
			) {
				return;
			}

			x = (offsetX / zoomer.offsetWidth) * 100;
			y = (offsetY / zoomer.offsetHeight) * 100;
			$(zoomer).css({
				"background-position": `${x}% ${y}%`,
			});
		}

		// Main function to attach all events after replacing the image tag with
		// the main template code
		function attachEvents(container) {
			container = $(container);

			if (!container || !container.length) {
				return;
			}

			// Update background size when image loads (for fullWidth calculation)
			const imgElement = container.find("#imageZoom")[0];
			if (imgElement) {
				const updateBackgroundSize = () => {
					const calculatedZoom = calculateZoomPercentage(
						imgElement,
						container[0]
					);
					container.css("background-size", calculatedZoom);
				};

				// Update when image loads
				if (imgElement.complete && imgElement.naturalWidth > 0) {
					updateBackgroundSize();
				} else {
					$(imgElement).on("load", updateBackgroundSize);
				}
			}

			container.on("click touchstart", function (e) {
				if (!e) {
					return;
				}

				// Check if touch interaction should be allowed (single finger only)
				if (!shouldAllowTouchInteraction(e)) {
					return;
				}
				if ("zoom" in imageObj == false) {
					// zoom is not defined, let define it and set it to false
					imageObj.zoom = false;
				}
				e.preventDefault();
				if (imageObj.zoom) {
					imageObj.zoom = false;
					$(this).removeClass("active");
				} else {
					imageObj.zoom = true;
					$(this).addClass("active");
					zoomIn(e);
				}
			});
			container.on("mousemove touchmove", function (e) {
				if (!e) {
					return;
				}
				imageObj.zoom ? zoomIn(e) : null;
			});
			container.on("mouseleave touchend", function () {
				imageObj.zoom = false;
				$(this).removeClass("active");
			});
		}
		let newElm;
		if (this[0].nodeName === "IMG") {
			newElm = $(this).replaceWith(String(imageObj.template));
			attachEvents($(".containerZoom")[$(".containerZoom").length - 1]);
		} else {
			newElm = $(this);
		}

		// return updated element to allow for jQuery chained events
		return newElm;
	};
})(jQuery);
