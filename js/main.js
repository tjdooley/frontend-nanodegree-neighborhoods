  // Google Map map data
var googleMap = null;
var googleService = null;

function initializeGoogleMap() {
    var mapOptions = {
        center: { lat: 43.074653, lng: -89.3841669},
        zoom: 16
    };
    googleMap = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
    googleService = new google.maps.places.PlacesService(googleMap);
}

var Location = function(location) {
    var self = this;
    self.name = location.name;
    self.placeId = location.placeId;
    self.placeResult = null;
    self.placeContent = null;
    self.marker = null

    self.goToLocation = function() {
      googleMap.panTo(self.placeResult.geometry.location);
      infoWindow.setContent(self.placeContent);
      infoWindow.open(googleMap, self.marker);
    }

    self.displayMarker = function() {
        if (self.marker == null) {
            googleService.getDetails({ placeId: self.placeId }, function(place, status) {
                if (status === google.maps.places.PlacesServiceStatus.OK) {
                    self.placeResult = place;
                    self.marker = new google.maps.Marker({
                        position: self.placeResult.geometry.location,
                        animation: google.maps.Animation.DROP,
                        map: googleMap
                    });

                    self.placeContent = "<h3>" + place.name + "</h3>" + "<br />" + place.formatted_address +"<br />" + place.website + "<br />" + place.rating + "<br />" + place.formatted_phone_number
                    google.maps.event.addListener(self.marker, 'click', self.goToLocation);
                }
            });
      }

      if (self.marker != null && self.marker.getMap() != googleMap) {
        self.marker.setMap(googleMap);
      }
    }

    self.hideMarker = function() {
      if (self.marker != null) {
        self.marker.setMap(null);
      }
    }
}

var FinderViewModel = function() {
    var self = this;
    self.locations = ko.observableArray();
    initializeGoogleMap();

    for (marker in markers) {
        var location = new Location(markers[marker], self.map);
        location.displayMarker(location);
        self.locations.push(location);
    }
}

var markers = [
    {
      name: "Overture Center for the Arts",
      placeId: "ChIJC5DyPjhTBogR1LYgsq9pQ4s"
    },
    {
      name: "Madison Children's Museum",
      placeId: "ChIJf0C9UkdTBogRQ6v1ecrB8Yk"
    }
];

var infoWindow = new google.maps.InfoWindow();
var viewModel = new FinderViewModel();
ko.applyBindings(viewModel);

