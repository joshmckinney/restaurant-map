// Global Variables
var map, rating, apikey;

function ViewModel() {
    var self = this;

    this.searchOption = ko.observable("");
    this.markers = [];

    this.populateInfoWindow = function(marker, infowindow) {

			// Format location for streetview
			var stvw = marker.position;
			var format_stvw = String(stvw).replace(/[() ]/g,"");
      var apikey = "e800644d67a46ef93e492438ab385c0a"
      // Request review from Zomato and populate by ID
      // https://developers.zomato.com/documentation
      $.ajax({
        url: 'https://developers.zomato.com/api/v2.1/restaurant?res_id=' + marker.resid + '&apikey=' + apikey,
        type: 'GET',
        success: function(data){
          document.getElementById("rating").innerHTML = String(JSON.stringify(data.user_rating.aggregate_rating)).replace(/["" ]/g,"");
        },
        error: function(data) {
          document.getElementById("rating").innerHTML = "No ratings found";
        }
      });
			// Update Marker if not open already
			if (infowindow.marker != marker) {
				infowindow.marker = marker;
				infowindow.setContent(
					'<div><strong>' + '<a href="https://www.google.com/maps/place/?q=place_id:' +
					marker.placeid + '" target="_blank">' + marker.title + '</a>' + ' (' + '<span id="rating"></span>' + ')' + '</strong></div>' +
					'<div>' + marker.description + '</div>' +
					'<img src="https://maps.googleapis.com/maps/api/streetview?size=200x200&location=' +
					format_stvw + '&key="></img>' +
					'<div><em>' + marker.address + '<br>' +
          '<span><small>Ratings powered by Zomato</small></span>' + '</em></div>'
				);
				infowindow.open(map, marker);
				infowindow.addListener('closeclick',function(){
					infowindow.setMarker = null;
				});
			}
		}

    // Animate markers
    // https://developers.google.com/maps/documentation/javascript/examples/marker-animations
    this.populateAndBounceMarker = function() {
        self.populateInfoWindow(this, self.largeInfoWindow);
        this.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout((function() {
            this.setAnimation(null);
        }).bind(this), 1500);
    };

    // Initial map view settings and style
    this.initMap = function() {
				map = new google.maps.Map(document.getElementById('map'), {
					center: {lat: 39.1638, lng: -119.7674},
					zoom: 12,
					styles: styledmap
				});

        // Set InfoWindow
        this.largeInfoWindow = new google.maps.InfoWindow();
        for (var i = 0; i < locations.length; i++) {
						this.title = locations[i].title;
						this.description = locations[i].description;
						this.address = locations[i].address;
						this.position = locations[i].location;
						this.placeid = locations[i].placeid;
            this.resid = locations[i].resid;
            // Google Maps marker setup
            this.marker = new google.maps.Marker({
								map: map,
								title: this.title,
								description: this.description,
								address: this.address,
								position: this.position,
								placeid: this.placeid,
                resid: this.resid,
								icon: 'img/nvicon.png',
								animation: google.maps.Animation.DROP,
								id: i
            });
            this.marker.setMap(map);
            this.markers.push(this.marker);
            this.marker.addListener('click', self.populateAndBounceMarker);
        }
    };

    this.initMap();

    // Set data-bind filter and marker visibility
    this.filteredMarker = ko.computed(function() {
        var result = [];
        for (var i = 0; i < this.markers.length; i++) {
            var markerLocation = this.markers[i];
            if (markerLocation.title.toLowerCase().includes(this.searchOption()
                    .toLowerCase())) {
                result.push(markerLocation);
                this.markers[i].setVisible(true);
            } else {
                this.markers[i].setVisible(false);
            }
        }
        return result;
    }, this);
}

// Handle Google Maps if error occurs
mapError = function mapError() {
    alert(
        'Error, Google Maps could not be loaded!'
    );
};

// Initiate map with KO bindings
function initMap() {
    ko.applyBindings(new ViewModel());
}
