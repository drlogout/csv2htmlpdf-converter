jQuery(document).ready(function($){

  var formData = new window.FormData();
  var fileSelected = false;

  $(document).on('change', '.btn-file :file', function() {

     var $input = $(this);

     $('#convert-catalogue').find('.file-name').text($input[0].files[0].name);

     formData.append('catalogue', $input[0].files[0]);
     fileSelected = true;

  });


  $('#catalogue-html').click(function(event){

    formData.append('title', $('#title').val());

    var $this = $(this);

    event.preventDefault();
    event.stopPropagation();

    if (fileSelected) {

      var l = Ladda.create(this);
      l.start();

      $this.removeClass('alert');
      $this.addClass('btn-warning');

      $.ajax({
         url: "http://DOCKERCONTAINER/api/csv2html",
         data: formData,
         cache: false,
         contentType: false,
         processData: false,
         type: 'POST',
         beforeSend: function (xhr) {
          xhr.setRequestHeader ("Authorization", "Basic " + btoa('LtPkf6nAf8z2kRG62zUV8mnDhqegcJvXno')); 
         },
         success: function( data ){

            $('#catalogue_html_field').val(data);
            $this.removeClass('btn-warning');
            $this.addClass('btn-success');
            $this.find('.ladda-label').text('HTML erstellt');
            $this.siblings('i').removeClass('hidden');

         },
         error: function(data) {
          console.log(data.responseText);
          $this.addClass('btn-warning');
          $this.find('.ladda-label').text('Fehler');

         }
       }).always(function() { 
        l.stop(); 
      });
    } else {
      alert('Keine Datei ausgewählt');
    }
    return false;
  });


  $('#catalogue-pdf').click(function(event){


      formData.append('title', $('#title').val());

      var $this = $(this);

      event.preventDefault();
      event.stopPropagation();

      if (fileSelected) {

        var l = Ladda.create(this);
        l.start();

        $this.removeClass('alert');
        $this.addClass('btn-warning');

        $.ajax({
           url: "http://DOCKERCONTAINER/api/csv2pdf",
           data: formData,
           cache: false,
           contentType: false,
           processData: false,
           type: 'POST',
           beforeSend: function (xhr) {
            xhr.setRequestHeader ("Authorization", "Basic " + btoa('DBdfGbUW8EEFbERdEG3iEJsYk24ZjccPx4aC8')); 
           },
           success: function( data ){

              $('#catalogue_pdf_field').val(data.pdfName);
              $this.removeClass('btn-warning');
              $this.addClass('btn-success');
              $this.find('.ladda-label').text('PDF erstellt');
              $this.siblings('i').removeClass('hidden');

           },
           error: function(data) {
            console.log(data.responseText);
            $this.addClass('btn-warning')
            $this.find('.ladda-label').text('Fehler');
           }
         }).always(function() { 
          l.stop(); 
        });
      } else {
        alert('Keine Datei ausgewählt');
      }
      return false;
    });

});