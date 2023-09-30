<script lang="ts">
	import GeoJSON from 'ol/format/GeoJSON';
	import Select from 'ol/interaction/Select';
	import { uuidv4 } from '$lib/utils';
	import type { Map, Feature } from 'ol';
	import type VectorSource from 'ol/source/Vector';
	import { layers } from '$lib/map_components/mapLayerSpecs';
	import { ROOT_PATH } from '../../store';

	export let map: Map | undefined = undefined;

	let unit: 'mins' | 'miles' | undefined;
	let distance: string = '0';

	//Check if selection consists of one and only one node
	const checkSelectionForNode = (): Feature | null => {
		if (!map) return null;
		const currentSelection: Select | undefined = map
			.getInteractions()
			.getArray()
			.filter((el) => el instanceof Select)[0];

		if (!currentSelection) return null;

		console.dir(currentSelection);

		const featureArr = currentSelection.getFeatures();

		if (!featureArr.getLength() || featureArr.getLength() > 1 || !featureArr.item(0)) {
			return null;
		}

		if (featureArr.item(0).getGeometry()!.getType() !== 'Point') {
			return null;
		}
		return featureArr.item(0);
	};

	//Handler for calculating path from freshly selected node
	const getPathFromNode = async () => {
		const nodeOrNull = checkSelectionForNode();
		if (!nodeOrNull) {
			window.alert('Please select a single node from which to calculate path.');
			return;
		}
		const json = new GeoJSON().writeFeature(nodeOrNull!);

		let walkingPaths = await fetch(`${ROOT_PATH}/routes`, {
			method: 'POST',
			body: JSON.stringify({ geom: json, unit, dist: distance }),
			headers: { 'Content-Type': 'application/json' }
		})
			.then((resp) => resp.json())
			.then((resp) => {
				let features: Feature[] = [];
				console.log(resp);
				//newWalkingPaths.concat(new GeoJSON().readFeatures(resp));
				resp.features.forEach((el) => {
					console.log(el);
					const features = new GeoJSON().readFeatures(el);
					console.log(features);
					features.forEach((f) => {
						f.setId(uuidv4());
						features.push(f);
					});
				});
				return features;
			});

		const geojsonSource = layers.walkingPaths.getSource() as VectorSource;
		if (!geojsonSource.isEmpty()) {
			geojsonSource.clear();
		}

		geojsonSource.addFeatures(walkingPaths);

		if (!map!.getAllLayers().some((el) => el === layers.walkingPaths)) {
			map!.addLayer(layers.walkingPaths);
		}
	};
</script>

<div id="walk-path-gen" class="control-pane">
	<div class="title">Generate Walking Path</div>
	<form action="" id="addressInputForm">
		<input
			type="number"
			id="dist-time-input"
			max={unit === 'mins' ? 120 : 15}
			step={unit === 'mins' ? 5 : 0.5}
			bind:value={distance}
		/>
		<select id="unit-selection" required bind:value={unit}>
			<option value="mins">Minutes</option>
			<option value="miles">Miles</option>
		</select>
	</form>
	<div class="button-row">
		<button class="fill-to-fit" disabled={!true} on:click={getPathFromNode}>
			Find Paths from Selected Node
		</button>
	</div>
</div>
