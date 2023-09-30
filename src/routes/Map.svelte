<script lang="ts">
	import Map from 'ol/Map';
	import View from 'ol/View';
	import { fromLonLat } from 'ol/proj';
	import type Layer from 'ol/layer/Layer';
	import { layers, styles } from '$lib/map_components/mapLayerSpecs.js';
	import { makeSelect } from './Controls/selector';
	import { makeLayerSwitcher } from './Controls/layerSwitcher';
	import { onMount } from 'svelte';

	export let center: number[];
	export let zoom: number;
	export let map: Map | undefined;

	let viewDiv = 'map-container';
	let mapLayers: Layer[];

	const setupMap = (_id: string) => {
		center = [-73.9358, 40.6739];
		zoom = 13;
		map = new Map({
			target: _id,
			layers: [layers.stamenTerrain, layers.nyccsl_edges, layers.nyccsl_nodes],
			view: new View({
				center: fromLonLat(center),
				zoom
			})
		});

		makeSelect(map, (f) => {
			if (
				f.getGeometry()!.getType() == 'LineString' ||
				f.getGeometry()!.getType() == 'MultiLineString'
			) {
				return styles.selectedLine.clone();
			} else {
				return styles.selectedNode.clone();
			}
		});

		makeLayerSwitcher(map, '#layer-selector');
	};

	onMount(() => {
		setupMap(viewDiv);
	});
</script>

<div id={viewDiv} class="map" />
