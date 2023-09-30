import type { Map } from 'ol';
import LayerSwitcher from 'ol-layerswitcher/dist/ol-layerswitcher';

export function makeLayerSwitcher(map: Map, targetId: string) {
	const layerSelector: HTMLElement | null = document.querySelector(targetId);
	if (!layerSelector) return;
	LayerSwitcher.renderPanel(map, layerSelector, {});
}
