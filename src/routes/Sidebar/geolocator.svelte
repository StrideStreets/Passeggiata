<script lang="ts">
	import type { Map } from 'ol';
	import { fromLonLat } from 'ol/proj';
	import { ROOT_PATH } from '../../store';

	export let map: Map | undefined = undefined;

	let addressQuery = '';

	const geolocationOptions = {
		enableHighAccuracy: true,
		timeout: 1500,
		maximumAge: 0
	};

	const geolocationSuccess = (position) => {
		const [lat, long] = [position.coords.latitude, position.coords.longitude];
		console.log([lat, long]);
		console.log(map);
		map!.getView().setCenter(fromLonLat([long, lat]));
		map!.getView().setZoom(16);
	};

	const geolocationFailure = (err) => {
		console.log(err);
		console.log('Failed to fetch location');
	};

	const getAndSetGeolocation = () => {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				geolocationSuccess,
				geolocationFailure,
				geolocationOptions
			);
		}
	};

	//Setting up call to geocoding API

	const searchAddress = () => {
		if (addressQuery) {
			fetch(`${ROOT_PATH}/geocode/${encodeURIComponent(addressQuery)}`)
				.then((response) => response.json())
				.then((response) => {
					const [long, lat] = [response.longitude, response.latitude];
					if (long && lat) {
						map.getView().setCenter(fromLonLat([long, lat]));
						map.getView().setZoom(16);
					} else {
						console.log('Invalid or missing coordinates on response to geocode request');
					}
				})
				.catch((err) => {
					console.log(err);
				});
		}
	};

	//Establish handler for enter click on button
	const keyDownHandler = (event: KeyboardEvent) => {
		if (!(event.key == 'Enter')) return;
		searchAddress();
	};
</script>

<div id="addr-lookup" class="control-pane">
	<div class="text-box">
		<input
			type="text"
			id="address-input-box"
			placeholder="Enter Adddress"
			bind:value={addressQuery}
		/>
		<button on:click={getAndSetGeolocation}>
			<img src="/gps.png" />
		</button>
	</div>
	<div class="button-row">
		<input
			class="full-width"
			type="submit"
			value={'Search'}
			on:click={searchAddress}
			on:keydown={keyDownHandler}
		/>
	</div>
</div>
