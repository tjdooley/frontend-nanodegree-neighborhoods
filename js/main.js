  function Location(location) {
    this.name = location.name;
    this.latitude = location.latitude;
    this.longitude = location.longitude;
  }

  var markers = [
    {
      name: "Overture Center for the Arts",
      latitude: 43.0744015,
      longitude: -89.3883918
    },
    {
      name: "Madison Children's Museum",
      latitude: 43.07667,
      longitude: -89.38439
    }
  ];

  function mapViewModel() {
    var self = this;
    self.locations = ko.observableArray();
    self.map;

    self.initialize = function() {
      self.map = self.createMap();
      self.initializeLocations();
    }

    self.createMap = function() {
      var mapOptions = {
        center: { lat: 43.074653, lng: -89.3841669},
        zoom: 16
      };
      var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
      return map;
    }

    self.initializeLocations = function() {
      for (marker in markers) {
        var location = new Location(markers[marker]);
        self.createMarker(location);
        self.locations.push(location);
      }
    }

    self.createMarker = function(location) {
      var mapMarker = new google.maps.Marker({
            position: new google.maps.LatLng(location.latitude, location.longitude),
            animation: google.maps.Animation.DROP,
            map: self.map,
            title: location.name,
            });

        var contents = '<h3>' + location.name + '</h3>';

        google.maps.event.addListener(mapMarker, 'click', (function(mapMarker) {
            return function(){
              infoWindow.setContent(contents);
              infoWindow.open(self.map, this);
              };
        })(mapMarker));

    }

    google.maps.event.addDomListener(window, 'load', self.initialize());
  }

  var infoWindow = new google.maps.InfoWindow();
  ko.applyBindings(new mapViewModel());

