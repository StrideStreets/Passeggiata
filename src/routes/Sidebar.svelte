<script lang="ts">
	import type { Map } from 'ol';
	import Geolocator from './Sidebar/geolocator.svelte';
	import Walkpath from './Sidebar/walkpath.svelte';

	export let map: Map | undefined = undefined;
</script>

<div class="locator">
	<div id="project-branding">
		<img src="/logo.png" />
	</div>
	<Geolocator bind:map />
	<Walkpath bind:map />
	<div id="layers-and-legend" class="control-pane">
		<div class="title">Layers</div>
		<div id="layer-selector" />
	</div>
</div>
