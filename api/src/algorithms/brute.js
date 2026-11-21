import { distance } from '../metrics.js';

export function bruteSearch(items, query, k = 5, metric = 'cosine') {
  return items
    .map((item) => ({ id: item.id, distance: distance(item.vector, query, metric) }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, k);
}
