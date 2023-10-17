<script lang="ts">
	import GeoJSON from 'ol/format/GeoJSON';
	import Select from 'ol/interaction/Select';
	import { uuidv4 } from '$lib/utils';
	import type { Map, Feature } from 'ol';
	import type VectorSource from 'ol/source/Vector';
	import { layers } from '$lib/map_components/mapLayerSpecs';
	import { SERVER_ROOT_PATH, ROUTING_LAYER_PATH } from '../../store';
	import LayerSwitcher from 'ol-layerswitcher';

	export let map: Map | undefined = undefined;

	let unit: 'mins' | 'miles';
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
		if (!map) return null;
		const nodeOrNull = checkSelectionForNode();
		if (!nodeOrNull) {
			window.alert('Please select a single node from which to calculate path.');
			return;
		}
		const json = new GeoJSON().writeFeature(nodeOrNull!);

		let walkingPaths = await fetch(
			`${SERVER_ROOT_PATH}${ROUTING_LAYER_PATH}?` +
				new URLSearchParams({ units: unit, dist: distance }),
			{
				method: 'POST',
				body: JSON.stringify(json),
				headers: { 'Content-Type': 'application/json' }
			}
		)
			.then((resp) => resp.json())
			.then((resp) => {
				let featureList: Feature[] = [];
				console.log(resp);
				//newWalkingPaths.concat(new GeoJSON().readFeatures(resp));
				resp.forEach((el) => {
					console.log(el);
					const features = new GeoJSON().readFeatures(el);
					console.log(features);
					features.forEach((f) => {
						f.setId(uuidv4());
						featureList.push(f);
					});
				});
				return featureList;
			})
			.catch((m) => {
				console.log(m);
				window.alert(
					'No valid circuit found from provided node. Please try a different (nearby) starting point.'
				);
				return;
			});

		const geojsonSource = layers.pathHolder.getSource() as VectorSource;
		if (!geojsonSource.isEmpty()) {
			geojsonSource.clear();
		}
		console.dir(walkingPaths);
		geojsonSource.addFeatures(walkingPaths);

		if (!map.getAllLayers().some((el) => el === layers.pathHolder)) {
			console.dir(map.getAllLayers());
			layers.pathHolder.set('selectable', true);
			map.addLayer(layers.pathHolder);
			console.dir(map.getAllLayers());
		}

		layers.pathHolder.setSource(geojsonSource);

		console.dir(layers.pathHolder.getSource());
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
