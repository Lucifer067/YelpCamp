mapboxgl.accessToken = mapToken;
var map = new mapboxgl.Map({
container: 'map', // container ID
style: 'mapbox://styles/mapbox/outdoors-v11', // style URL
center: campgroundData.geometry.coordinates, // starting position [lng, lat]
zoom: 12 // starting zoom
});

map.addControl(new mapboxgl.NavigationControl());

new mapboxgl.Marker()
    .setLngLat(campgroundData.geometry.coordinates)
    .setPopup(
        new mapboxgl.Popup({offset: 25})
        .setHTML(`<h3>${campgroundData.title}</h3><p>${campgroundData.location}</p>`)
        .setMaxWidth("300px")
    )
    .addTo(map);