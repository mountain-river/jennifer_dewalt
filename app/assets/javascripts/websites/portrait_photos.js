function portraitPhotos() {
	if ($('#video_canvas').length) {
		var video_canvas = $('#video_canvas')[0];
		var video_ctx = video_canvas.getContext('2d');
		var image_canvas = $('#image_canvas')[0];
		var image_ctx = image_canvas.getContext('2d');
		var width = 400;
		var height = 550;
		var scale_factor = 0.35;
		var video = $('video')[0];
		var photo_taken = false;
		var base_image = new Image();
		var new_image = new Image();

		video_canvas.width = image_canvas.width = width;
		video_canvas.height = image_canvas.height = height;

		window.URL = window.URL || window.webkitURL;
		navigator.getUserMedia  = navigator.getUserMedia || navigator.webkitGetUserMedia ||
	                      	      navigator.mozGetUserMedia || navigator.msGetUserMedia;

	    if (navigator.getUserMedia) {
		  	navigator.getUserMedia({audio: false, video: true}, function(stream) {
		    video.src = window.URL.createObjectURL(stream);
		    video.play();
		    $('#shoot_btn').attr('disabled', false);
		    updateVideoCanvas();
		  }, function () {
		  	alert("This app requires access to your camera.")
		  });
		} else {
			$('#no_support').show();
		}

		$('#shoot_btn').one('click', function () {
			photo_taken = true;
			$('#save_btn').attr('disabled', false);
		});

		$('#shoot_btn').on('click', function () {
			snapPhoto();
		});

		$('#save_btn').on('click', function () {
			if (photo_taken) {
				saveNewPortrait();
			}
		});

		base_image.onload = function () {
			image_ctx.clearRect(0, 0, image_canvas.width, image_canvas.height);
			image_ctx.drawImage(base_image, 0, 0);
		};

		function updateVideoCanvas() {
			if (video.videoWidth) {
				var scale = image_canvas.height / video.videoHeight;
				var vid_w = video.videoWidth * scale;
				var vid_h = video.videoHeight * scale;
				var offset = -1 * ((vid_w / 2) - (image_canvas.width / 2));
				
				video_ctx.drawImage(video, offset, 0, vid_w, vid_h);				
			}

			requestAnimFrame(updateVideoCanvas);
		}

		function snapPhoto() {
			var url = video_canvas.toDataURL();

			new_image.onload = function () {
				image_ctx.clearRect(0, 0, image_canvas.width, image_canvas.height);
				image_ctx.drawImage(base_image, 0, 0);

				var new_img_data = video_ctx.getImageData(0, 0, video_canvas.width, video_canvas.height);
				var base_img_data = image_ctx.getImageData(0, 0, image_canvas.width, image_canvas.height);
				blendImages(new_img_data, base_img_data);
			}

			new_image.src = url;
		}

		function blendImages(new_img, old_img) {
			var new_data = new_img.data;
			var old_data = old_img.data;
			console.log(new_data[1], old_data[1])

			for (var i = 0; i < new_data.length; i += 4) {
				new_data[i] = (new_data[i] + old_data[i]) / 2;
				new_data[i+1] = (new_data[i+1] + old_data[i+1]) / 2;
				new_data[i+2] = (new_data[i+2] + old_data[i+2]) / 2;
			}
			console.log(new_data[1], old_data[1])

			image_ctx.clearRect(0, 0, image_canvas.width, image_canvas.height);
			image_ctx.putImageData(new_img, 0, 0);
		}

		function saveNewPortrait() {
			var file = dataURLtoBlob(image_canvas.toDataURL());
			var form_data = new FormData();

			form_data.append('image', file);

			$.ajax({
				url: "/portrait/photos",
				type: "POST",
				data: form_data,
				processData: false,
				contentType: false,
				success: function (data) {
					window.location = '/portrait/photos/' + data
				},
				error: function () {
					alert('There was a problem with your request. Please try again.');
				}
			});
		}

		function dataURLtoBlob(dataURL) {
			var binary = atob(dataURL.split(',')[1]);
			var array = [];

			for(var i = 0; i < binary.length; i++) {
				array.push(binary.charCodeAt(i));
			}
			return new Blob([new Uint8Array(array)], {type: 'image/png'});
		}

		base_image.src = $('#data-img').data('img');
	}
}