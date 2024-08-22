(function($) {

	"use strict";

	var fullHeight = function() {

		$('.js-fullheight').css('height', $(window).height());
		$(window).resize(function(){
			$('.js-fullheight').css('height', $(window).height());
		});

	};
	fullHeight();

	$('#sidebarCollapse').on('click', function () {
      $('#sidebar').toggleClass('active');
  });

})(jQuery);


// for chat form
$('#fileInput').change(function (event) {
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    fetch('/upload-file', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        // Handle response from the server if needed
    })
    .catch(error => console.error('Error:', error));
});