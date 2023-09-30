<script lang="ts">
	import OpenlayersMap from './Map.svelte';
	import Sidebar from './Sidebar.svelte';
	import type { Map } from 'ol';
	const astoria = [-123.8, 46.2];
	const zoom = 12;
	let map: Map;
</script>

<Sidebar bind:map />
<OpenlayersMap center={astoria} {zoom} bind:map />
