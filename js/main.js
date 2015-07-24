function initialize() {
        var mapOptions = {
          center: { lat: 43.074653, lng: -89.3841669},
          zoom: 16
        };
        var map = new google.maps.Map(document.getElementById('map-canvas'),
            mapOptions);
      }
      google.maps.event.addDomListener(window, 'load', initialize);