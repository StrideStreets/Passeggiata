import VectorTileSource from 'ol/source/VectorTile.js';
import XYZ from 'ol/source/XYZ.js';
import MVT from 'ol/format/MVT.js';
import { Fill, Stroke, Style, Circle } from 'ol/style.js';
import Feature from 'ol/Feature.js';
import VectorSource from 'ol/source/Vector.js';
import GeoJSON from 'ol/format/GeoJSON.js';

import type Layer from 'ol/layer/Layer';
import type Source from 'ol/source/Source';
import VectorTileLayer from 'ol/layer/VectorTile';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import { SERVER_ROOT_PATH } from '../../store';
import { layerIdGen } from '$lib/utils';

//import LayerGroup from 'ol/layer/Group.js';
const base_tile_path = SERVER_ROOT_PATH;

const groups = {};

const layers: { [k: string]: Layer } = {};

const styles: { [k: string]: Style } = {};

const sources: { [k: string]: Source } = {};

const layerIdMapper: { [k: number]: Layer } = {};

//TODO: Parameterize layer creation by hashed layer IDs
//Define vector tile layer sources
sources.geojsonHolder = new VectorSource({
	format: new GeoJSON()
});

sources.edges = new VectorTileSource({
	format: new MVT({ featureClass: Feature }),
	url: `${base_tile_path}/layers/public/ways/{z}/{x}/{y}.mvt`
});

sources.nodes = new VectorTileSource({
	format: new MVT({ featureClass: Feature }),
	url: `${base_tile_path}/layers/public/ways_vertices_pgr/{z}/{x}/{y}.mvt`
});

sources.nyccsl = new VectorTileSource({
	format: new MVT({ featureClass: Feature }),
	url: `${base_tile_path}/layers/public/nyccsl/{z}/{x}/{y}.mvt`,
	attributions:
		'Street centerlines by NYC OTI via <a href="https://data.cityofnewyork.us/City-Government/NYC-Street-Centerline-CSCL-/exjm-f27b">NYC OpenData</a>'
});

sources.nyccsl_nodes = new VectorTileSource({
	format: new MVT({ featureClass: Feature }),
	url: `${base_tile_path}/layers/nyccsl_topo/node/{z}/{x}/{y}.mvt`
});

sources.nyccsl_edges = new VectorTileSource({
	format: new MVT({ featureClass: Feature }),
	url: `${base_tile_path}/layers/nyccsl_topo/edge_data/{z}/{x}/{y}.mvt`,
	attributions:
		'Street centerlines by NYC OTI via <a href="https://data.cityofnewyork.us/City-Government/NYC-Street-Centerline-CSCL-/exjm-f27b">NYC OpenData</a>'
});

sources.stamenTerrain = new XYZ({
	url: 'https://stamen-tiles.a.ssl.fastly.net/terrain/{z}/{x}/{y}.jpg',
	attributions: `Base map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>.`
});

//Define vector tile layer styles

const default_linestyle = new Style({
	stroke: new Stroke({
		color: 'green',
		width: 3
	})
});

const selected_linestyle = new Style({
	stroke: new Stroke({
		color: 'yellow',
		width: 4
	})
});

const default_nodestyle = new Style({
	image: new Circle({
		stroke: new Stroke({
			color: 'grey',
			width: 0.25
		}),
		fill: new Fill({
			color: 'blue'
		}),
		radius: 3
	})
});

const selected_nodestyle = new Style({
	image: new Circle({
		stroke: new Stroke({
			color: 'grey',
			width: 1
		}),
		fill: new Fill({
			color: 'yellow'
		}),
		radius: 3
	})
});

styles.edges = default_linestyle;

styles.nodes = default_nodestyle;

styles.nyccsl = default_linestyle;

styles.selectedLine = selected_linestyle;

styles.selectedNode = selected_nodestyle;

styles.loadedLine = new Style({
	stroke: new Stroke({
		color: 'purple',
		width: 4
	})
});

layers.edges = new VectorTileLayer({
	title: 'OSM Edges',
	source: sources.edges,
	style: styles.edges,
	minZoom: 14
});
layers.nodes = new VectorTileLayer({
	title: 'OSM Nodes',
	source: sources.nodes,
	style: styles.nodes,
	minZoom: 14
});
layers.nyccsl_edges = new VectorTileLayer({
	title: 'NYC Streetlines',
	source: sources.nyccsl_edges,
	style: styles.nyccsl,
	minZoom: 14
});
layers.nyccsl_nodes = new VectorTileLayer({
	title: 'NYC Streetline Nodes',
	source: sources.nyccsl_nodes,
	style: styles.nodes,
	minZoom: 14
});

layers.stamenTerrain = new TileLayer({
	title: 'Stamen Terrain Base',
	source: sources.stamenTerrain
});

layers.pathHolder = new VectorLayer({
	source: sources.geojsonHolder,
	title: 'Walking Paths',
	style: styles.loadedLine
});

// layers.forEach((l) => {
// 	const id = layerIdGen();
// 	l.setProperties({ id: id });
// 	layerIdMapper[id] = l;
// });

groups.basemaps = [layers.stamenTerrain];
groups.basemaps.forEach((l) => {
	l.setProperties({ selectable: false });
});

//Taking out excess feature layers for tentative deployment
//groups.featureLayers = [layers.nyccsl, layers.edges, layers.nodes];
groups.featureLayers = [layers.nyccsl_edges, layers.nyccsl_nodes];
groups.featureLayers.forEach((l) => {
	l.setProperties({ selectable: true });
});

export { styles, groups, layers, sources, layerIdMapper };
