import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

var d3 = require("d3");
var streets = require("assets/sfmaps/streets.json");

@Component({
  selector: 'app-sf-map',
  templateUrl: './sf-map.component.html',
  styleUrls: ['./sf-map.component.css']
})

export class SfMapComponent implements OnInit {

	projection;
	svg;
	route = 'N'
	availableRoutes = ['N', 6];

	constructor(private http: HttpClient) { }

	ngOnInit() {
		this.svg = d3.select('.sf-map')
			.append('svg')
			.attr('height', 800) // Height and width is only ever used once
			.attr('width', 900); // therefore judgement call to let it be hardcoded here.

		try {
			this.renderMap();
			this.renderVehicleLocations();
			this.renderRoutes();
			this.updateVehicleRoutes();
		} catch (e) {
			console.log(e);
		} finally {}
	}

	renderMap() {
		const centerOfCity = d3.geoCentroid(streets);
		this.projection = d3.geoMercator()
		  .scale(240000)
		  .center(centerOfCity);

		var path = d3.geoPath().projection(this.projection);
		d3.selectAll('path').attr('d', path);

		this.svg.append('g')
			.attr('id', 'streets')
			.selectAll('path')
			.data(streets.features)
			.enter()
			.append('path')
			.attr('class', 'tract')
			.attr('d', path)
			.attr('stroke', 'darkgray')
			.attr('fill', 'black')
			.attr('stroke-opacity', 0.65)
			// Appending title here for tool tip
			// with the value of it's street name
			.append('title')
			.text(data => data.properties.STREETNAME);

	}

	renderVehicleLocations() {
		const currentTime = Math.round(new Date().getTime()/1000.0); // Current timestamp

		// Always build the url with the current timestamp and this.route (default N)
		var vehicleLocationsUrl = "http://webservices.nextbus.com/service/publicJSONFeed?command=vehicleLocations&a=sf-muni&r=" + this.route +"&t=" + currentTime;

		// Remove all vehicles everytime we render their locations
		d3.selectAll("#vehicles").remove();

		this.http.get(vehicleLocationsUrl).subscribe(data => {

			if (!data.hasOwnProperty("vehicle")) {
				throw new SfMuniException("No vehicles found at " + currentTime);
			}

			// Insert the vehicle group before streets
			var vehicles = this.svg.insert("g", "#streets")
				.attr("id", "vehicles");

			vehicles.selectAll("circle")
				.data(data['vehicle'])
				.enter()
				.append('circle')
				.attr('class', 'vehicle')
				.attr('cx', data => this.projection([data.lon, data.lat])[0])
				.attr('cy', data => this.projection([data.lon, data.lat])[1])
				.attr('r', 3)
				.attr('fill', 'orange');
		});
	}

	renderRoutes() {

		// Concate next bus api with this.route (default N)
		var routesUrl = 'http://webservices.nextbus.com/service/publicJSONFeed?command=routeConfig&a=sf-muni&r=' + this.route;
		this.http.get(routesUrl).subscribe(data => {

			// If either data.route or data.route.stop is not available
			// We'll short the code here and throw the exception
			if (! data.hasOwnProperty('route') || ! data["route"].hasOwnProperty("stop")) {
				throw new SfMuniException("No Routes Available");
			}

			// Remove all stops every time we render routes
			d3.selectAll("#stops").remove();

			const routeStops = data['route']['stop'];

			// Insert the stops group before streets
			var  stops = this.svg.insert('g', '#streets')
				.attr('id', 'stops');

			var plots = stops.selectAll('circle')
				.data(routeStops)
				.enter()
				.append('circle')
				.attr('class', 'stop');

			plots.attr('cx', data => this.projection([data.lon, data.lat])[0])
				.attr('cy', data => this.projection([data.lon, data.lat])[1])
				.attr('r', 3)
				.attr('fill', '#5cf186');
	  });
	}

	updateVehicleRoutes() {

		// Update the vehicles location every 15 seconds
		const timeInterval = 15000;
		setInterval(() => {
			this.renderVehicleLocations();
		}, timeInterval);
	}

	showRoutes(route) {
		// Sanitary checking to make sure we only show routes that
		// were decided on
		if (this.availableRoutes.indexOf(route) < 0) {
			throw new SfMuniException("Route selected unavailable");
		}

		this.route = route;
		this.renderRoutes();
		this.renderVehicleLocations();
	}
}

// Exception class specifically for SF Muni Challenge
function SfMuniException(message) {
	this.message = message;
	this.name = 'SfMuniException';
}
