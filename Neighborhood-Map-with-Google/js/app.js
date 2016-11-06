var map;
var streetViewImage;
var streetViewEndPoint = "https://maps.googleapis.com/maps/api/streetview?size=180x90&location=";

/**
 *function: Initialize google map with mapOptions
 *description:When the window is not wide and high enough,the searchNav will disappear to be resuable on three platforms
 **/
function initMap() {
    var mapOptions = {
        zoom: 15,
        center: { lat: 34.098650, lng: -118.320256 },
        mapTypeControl: false,
        disableDefaultUI: true
    };

    if ($(window).width() <= 1080) {
        mapOptions.zoom = 13;
    }
    if ($(window).width() < 800 || $(window).height() < 595) {
        toggleNav();
    }
    map = new google.maps.Map($("#map")[0], mapOptions);

    //function to set all markers that will be defined later
    setMarkers(markers);

    //function to set all map that will be defined later
    setAllMap();
}

/**
 *function: Set default markers and open new window when get clicked
 *description: Set all markers initially and open info window with corresponding street view when get clicked
 *parameter: Array of location objects to be displayed
 **/
function setMarkers(location) {

    for (i = 0; i < location.length; i++) {
        location[i].holdMarker = new google.maps.Marker({
            position: new google.maps.LatLng(location[i].lat, location[i].lng),
            map: map,
            title: location[i].title,
        });

        //function to place google street view images within info windows
        getStreetView(location[i]);

        //Binds infoWindow content to each marker
        location[i].contentString = '<img src="' + streetViewImage +
            '" alt="Street View Image of ' + location[i].title + '"><br><hr style="margin-bottom: 5px"><strong>' +
            location[i].title + '</strong><br><p>' +
            location[i].street + '<br>' +
            location[i].city + '<br></p><a class="web-links" href="http://' + location[i].url +
            '" target="_blank">' + location[i].url + '</a>';

        var infowindow = new google.maps.InfoWindow({
            content: markers[i].contentString
        });

        //Click marker to view infoWindow
        //zoom in and center location on click
        new google.maps.event.addListener(location[i].holdMarker, 'click', (function(marker, i) {
            return function() {
                infowindow.setContent(location[i].contentString);
                infowindow.open(map, this);
                var windowWidth = $(window).width();
                if (windowWidth <= 1080) {
                    map.setZoom(14);
                } else if (windowWidth > 1080) {
                    map.setZoom(16);
                }
                map.setCenter(marker.getPosition());
                location[i].picBoolTest = true;
                loadData(location[i].title);
            };
        })(location[i].holdMarker, i));

        //Click nav element to view infoWindow
        //zoom in and center location on click
        var searchNav = $('#choice' + i);
        searchNav.click((function(marker, i) {
            return function() {
                infowindow.setContent(location[i].contentString);
                infowindow.open(map, marker);
                map.setZoom(16);
                map.setCenter(marker.getPosition());
                location[i].picBoolTest = true;
                loadData(location[i].title);
            };
        })(location[i].holdMarker, i));
    }
}

/**Define an array of locations to be displayed in the map**/
var markers = [{
    title: 'Hollywood Forever',
    lat: 34.091542,
    lng: -118.317853,
    street: '6000 Santa Monica Blvd',
    city: 'Los Angeles,CA 90038',
    heading: 5,
    id: 'choice0',
    index: 0,
    visible: ko.observable(true),
    boolTest: true
}, {
    title: 'ArcLight Hollywood',
    lat: 34.097551,
    lng: -118.331337,
    street: '6360 Sunset Blvd',
    city: 'Los Angeles,CA 90028',
    heading: 235,
    index: 1,
    id: "choice1",
    visible: ko.observable(true),
    boolTest: true
}, {
    title: 'Hollywood Palladium',
    lat: 34.098650,
    lng: -118.320256,
    street: '6215 Sunset Blvd',
    city: 'Los Angeles,CA 90028',
    heading: 55,
    index: 2,
    id: "choice2",
    visible: ko.observable(true),
    boolTest: true
}, {
    title: "Pantages Theatre",
    lat: 34.101709,
    lng: -118.323955,
    street: '6233 Hollywood Blvd',
    city: 'Los Angeles,CA 90028',
    heading: 170,
    index: 3,
    id: "choice3",
    visible: ko.observable(true),
    boolTest: true
}, {
    title: "AVALON Hollywood",
    lat: 34.102811,
    lng: -118.325629,
    street: '1735 Vine St',
    city: 'Los Angeles,CA 90028',
    heading: 190,
    index: 4,
    id: "choice4",
    visible: ko.observable(true),
    boolTest: true
}];

/**Toggle searchNav according to the window's size**/
var isNavVisible = true;

function toggleNav() {
    if (isNavVisible === true) {
        hideNav();
    } else {
        showNav();
    }
}

//Hide searchNav when the window is not big enough
function hideNav() {
    $("#search-container").hide();
    isNavVisible = false;
}

//Show searchNav when the window is big enough
function showNav() {
    $("#search-container").show();
    isNavVisible = true;
}

//Define knockout viewModel
var viewModel = {
    filter: ko.observable(''),
};

//Filter though all markers to get the one we want
viewModel.filteredMarkers = ko.computed(function() {
    var filter = this.filter().toLowerCase();
    return ko.utils.arrayFilter(markers, function(marker) {
        if (marker.title.toLowerCase().indexOf(filter) >= 0) {
            marker.boolTest = true;
            return marker.visible(true);
        } else {
            marker.boolTest = false;
            setAllMap();
            return marker.visible(false);
        }
    });
}, viewModel);

ko.applyBindings(viewModel);

//Set all map used in viewModel
function setAllMap() {
    for (var i = 0; i < markers.length; i++) {
        if (markers[i].boolTest === true) {
            markers[i].holdMarker.setMap(map);
        } else {
            markers[i].holdMarker.setMap(null);
        }
    }
}

//Get all markers' streetView
function getStreetView(place) {
    streetViewImage = streetViewEndPoint + place.lat + "," + place.lng + "&fov=75&heading=" + place.heading + "&pitch=10";
}

$("#input").keyup(function() {
    setAllMap();
})

//Load New York Times Articles' related to marker's title
function loadData(title) {
    var $body = $('body');
    var $nytHeaderElem = $('#nytimes-header');
    var $nytElem = $('#nytimes-articles');
    $nytElem.text("");
    var title = title;
    var url_ny = "https://api.nytimes.com/svc/search/v2/articlesearch.json";
    url_ny += '?' + $.param({
        'api-key': "c8b5e8870dc242f3a0d7348c11da8ce2",
        'q': title
    });
    $("#nytimes-header").text("New York Times Articles about " + title);
    $.getJSON(url_ny, function(data) {
        console.log(data);
        (data.response.docs).forEach(function(doc) {
            var headline = doc.headline.main;
            var leadParagraph = doc.lead_paragraph;
            var url = doc.web_url;
            var anchor = document.createElement("a");
            var paragraph = document.createElement("p");
            var list = document.createElement("li");
            $(anchor).attr("href", url);
            $(anchor).append(headline);
            $(paragraph).append(leadParagraph);
            list.appendChild(anchor);
            list.appendChild(paragraph);
            $("#nytimes-articles").append(list);
        });
    }).fail(function() {
        $("#nytimes-header").text("Fail to load article about" + title + " from New York Times!");
    });
}
