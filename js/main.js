  // Google Map map and Yelp variables
var googleMap = null;
var googleService = null;
var yelpUrl = "http://api.yelp.com/v2/business/";

//Create the google map and service to query places
function initializeGoogleMap() {
    var mapOptions = {
        center: { lat: 43.074653, lng: -89.3841669},
        zoom: 16
    };
    googleMap = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
    googleService = new google.maps.places.PlacesService(googleMap);
}

//Location object that will store information like name, google Place Id, and Yelp Id
//Contains functions to pan map to location as well as manage Map Markers
var Location = function(location) {
    var self = this;
    self.name = location.name;
    self.placeId = location.placeId;
    self.yelpId = location.yelpId;
    self.placeResult = null;
    self.placeContent = null;
    self.marker = null;

    //Pan the map to the location and launch the infor window
    self.goToLocation = function() {
      googleMap.panTo(self.placeResult.geometry.location);
      infoWindow.setContent(self.placeContent);
      infoWindow.open(googleMap, self.marker);
    };

    //Populate the Map Marker and content with information from Google and Yelp
    self.createMarker = function() {
      googleService.getDetails({ placeId: self.placeId }, function(place, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            self.placeResult = place;
            self.marker = new google.maps.Marker({
                position: self.placeResult.geometry.location,
                animation: google.maps.Animation.DROP,
                map: googleMap
            });

            self.placeContent = '<h3>' + place.name + '</h3>' + '<br />' + place.formatted_address + '<br /><a href="' + place.website + '">' + place.website + "</a><br />" + place.formatted_phone_number;
            google.maps.event.addListener(self.marker, 'click', self.goToLocation);

            //Append the Yelp Content to Google's content.
            //This function is passed into the Yelp call to be run on the
            //success callback
            var updateContent = function(yelpContent) {
              self.placeContent = self.placeContent.concat(yelpContent);
            };
            updateContentFromYelp(self.yelpId, updateContent);
        }
      });
    };

    self.displayMarker = function() {
      if (self.marker !== null) {
        self.marker.setVisible(true);
      }
    };

    self.hideMarker = function() {
        self.marker.setVisible(false);
    };
};


//View Model to manage UI
var FinderViewModel = function() {
    var self = this;
    self.locations = ko.observableArray();
    initializeGoogleMap();

    self.searchTerm = ko.observable("");

    //This will apply the search filter as a term is entered
    self.locationsShown = ko.dependentObservable(function() {
        var matched = [];
        var filter = self.searchTerm().toLowerCase();
        var tempLocation;

        for (var index = 0; index < self.locations().length; index++) {
            tempLocation = self.locations()[index];
            if (tempLocation.name.toLowerCase().indexOf(filter) > -1) {
                matched.push(tempLocation);
                tempLocation.displayMarker();
            } else {
                tempLocation.hideMarker();
            }
        }

        return matched;
    }, self);

    for (var marker in markers) {
        var location = new Location(markers[marker]);
        location.createMarker(location);
        self.locations.push(location);
    }
};

var markers = [
    {
      name: "Overture Center for the Arts",
      placeId: "ChIJC5DyPjhTBogR1LYgsq9pQ4s",
      yelpId: "overture-center-for-the-arts-madison"
    },
    {
      name: "Madison Children's Museum",
      placeId: "ChIJf0C9UkdTBogRQ6v1ecrB8Yk",
      yelpId: "madison-childrens-museum-madison"
    },
    {
      name: "Wisconsin State Capitol",
      placeId: "ChIJ5YH4falWBogR5Lpub1B0OVA",
      yelpId: "wisconsin-state-capitol-madison-2"
    },
    {
      name: "Monona Terrace",
      placeId: "ChIJUSHZaT5TBogR3ebbcrfKO-w",
      yelpId: "monona-terrace-community-and-convention-center-madison-2"
    },
    {
      name: "Great Dane Pub",
      placeId: "ChIJr-uC2z9TBogRCgiw8nS1-Zo",
      yelpId: "great-dane-pub-and-brewing-co-madison"
    }
];


//Set up the info window to be used and create the view model
var infoWindow = new google.maps.InfoWindow();
var viewModel = new FinderViewModel();
ko.applyBindings(viewModel);

//The following code is all used to deal with pulling data from Yelp.
//This was a bit of a challenge since Yelp requires oAuth to be used.
//I had to scour the web to find a mechanism for doing this.
//I pulled a lot from here....
//https://github.com/levbrie/mighty_marks/blob/master/yelp-search-sample.html
var auth = {

  consumerKey: "dxdIoeCRH2mQuK-9nC5zww",
  consumerSecret: "cg5pEc3UCFfZOg_kv4tM8RWk4TA",
  accessToken: "TBS8S5EzSAFLgMYjjdijyoEQOKfS9snY",
  accessTokenSecret: "nZxyNuPqE4H-ABxGYMZg5a38slY",
  serviceProvider: {
    signatureMethod: "HMAC-SHA1"
  }
};

var accessor = {
  consumerSecret: auth.consumerSecret,
  tokenSecret: auth.accessTokenSecret
};
parameters = [];
parameters.push(['callback', 'cb']);
parameters.push(['oauth_consumer_key', auth.consumerKey]);
parameters.push(['oauth_consumer_secret', auth.consumerSecret]);
parameters.push(['oauth_token', auth.accessToken]);
parameters.push(['oauth_signature_method', 'HMAC-SHA1']);
var message = {
  'action': yelpUrl,
  'method': 'GET',
  'parameters': parameters
};

//Query yelp for business information, then apply it to the marker content
//that will display in the info window
function updateContentFromYelp(name, updateContent) {
  message.action = yelpUrl + name;
  OAuth.setTimestampAndNonce(message);
  OAuth.SignatureMethod.sign(message, accessor);
  var parameterMap = OAuth.getParameterMap(message.parameters);
  parameterMap.oauth_signature = OAuth.percentEncode(parameterMap.oauth_signature);
  $.ajax({
    'url': yelpUrl + name,
    'data': parameterMap,
    'cache': true,
    'dataType': 'jsonp',
    'success': function(data) {
      updateContent(createYelpWindowHtml(data));
    }
  });
}

function createYelpWindowHtml(biz) {
        var text = '<br><br><div class="marker"><h4>Yelp Information</h4>';
        // div start
        text += '<div class="businessinfo">';
        // name/url
        text += '<a href="'+biz.url+'" target="_blank">'+biz.name+'</a><br/>';
        // stars
        text += '<img class="ratingsimage" src="'+biz.rating_img_url_small+'"/>&nbsp;based&nbsp;on&nbsp;';
        // reviews
        text += biz.review_count + '&nbsp;reviews<br/><br />';
        // categories
        text += formatCategories(biz.categories);
        // div end
        text += '</div><img class="businessimage" src="'+biz.image_url+'"/></div>';
        return text;
    }

/*
 * Formats the categories HTML
 */
function formatCategories(cats) {
  var s = 'Categories: ';
  for(var i=0; i<cats.length; i++) {
      s+= cats[i];
      if(i != cats.length-1) s += ', ';
  }
  s += '<br/>';
  return s;
}
