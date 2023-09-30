import type { Map } from 'ol';
import { click } from 'ol/events/condition';
import Select from 'ol/interaction/Select';
import type { Style } from 'ol/style';
import type { StyleFunction } from 'ol/style/Style';
import { styles } from '$lib/map_components/mapLayerSpecs';
import type Layer from 'ol/layer/Layer';

const selectedLayers: Set<Layer> = new Set();

export function makeSelect(map: Map, style: Style | StyleFunction) {
	const selector = new Select({
		condition: click,
		layers: (l) => {
			return l.get('selectable');
		}
	});
	if (!map) {
		return;
	}
	map.addInteraction(selector);
	selector.on('select', (e) => {
		const currentSelectedLayers: Set<Layer> = new Set();
		selector.getFeatures().forEach((f) => {
			f.setStyle(f.getGeometry()?.getType() == 'Point' ? styles.selectedNode : styles.selectedLine);
			currentSelectedLayers.add(selector.getLayer(f));
		});

		e.deselected.forEach((f) => {
			f.setStyle();
		});

		selectedLayers.forEach((l) => {
			if (!currentSelectedLayers.has(l)) {
				l.changed();
				selectedLayers.delete(l);
			}
		});

		currentSelectedLayers.forEach((l) => {
			l.changed();
			selectedLayers.add(l);
		});
		console.log(e);
		console.log(selector.getFeatures());
	});
}
