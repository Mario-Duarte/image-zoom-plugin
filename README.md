# Image Zoom (jQuery) Plugin
Simple jQuery plugin that will allow users to zoom in your images, perfect for product images and galleries that is less than 1.5kb.

### Dependencies
- [jQuery 3.X](https://jquery.com/download/)


## How to use?

Just add the `image-zoom.css` to the head of your html file and the `image-zoom.min.js` just before the end of the body tag and after the jQuery script.

```
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Your title</title>
	<link rel="stylesheet" href="css/style.css">
	<link rel="stylesheet" href="css/image-zoom.css">
</head>
<body>

	<!-- Your HTML content here -->

	<script src="js/jquery.min.js" type="text/javascript"></script>
	<script src="js/image-zoom.js" type="text/javascript"></script>
</body>
</html>
```

You will not need to modify any existing html code as can be added to any existing images on your document, but alternatively add some images to your page:

```
<section id="main">
	<div class="inner">
		<h1>Image Zoom jQuery Demo</h1>

		<div class="image-container">
			<img id="imageZoom" src="https://picsum.photos/1080/720" alt="A image to apply the ImageZoom plugin">
		</div>

	</div>
</section>
```

#### Lets add the zoom to the images

Add a new script at the end of your html just before the end of the body tag and add the zoom to your images.

```
<script type="text/javascript">
	$(document).ready(function(){
		$('#imageZoom').imageZoom();
	});
</script>
```

#### Options

You can pass the Zoom level as an option, by default this is set to 150%.

`$('#imageZoom').imageZoom({zoom : 200});`

#### Add to all images in a gallery

To add the zoom plugin to multiple images on a gallery you can use a standard loop to loop through the images and add the plugin to each of them.

The HTML:
```
	<div class="my-gallery">
		<img class="my-gallery-image" src="https://picsum.photos/1080/720" alt="A image to apply the ImageZoom plugin">
		<p>&nbsp;</p>
		<img class="my-gallery-image" src="https://picsum.photos/1920/1080" alt="A image to apply the ImageZoom plugin">
		<p>&nbsp;</p>
		<img class="my-gallery-image" src="https://picsum.photos/1440/1080" alt="A image to apply the ImageZoom plugin">
	</div>
```

And now the javascript:
```
	$('.my-gallery-image').each(function(){
		$(this).imageZoom();
	});
```
