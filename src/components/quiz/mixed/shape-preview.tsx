'use client';

import { useEffect, useState } from 'react';
import { geoMercator, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import type { Topology, GeometryCollection } from 'topojson-specification';
import type { FeatureCollection, Geometry } from 'geojson';
import { COUNTRIES } from '@/data/countries';

const WORLD_TOPO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

// Module-level cache — fetched once, reused for every shape
let topoPromise: Promise<Topology | null> | null = null;
function loadTopo(): Promise<Topology | null> {
  if (!topoPromise) {
    topoPromise = fetch(WORLD_TOPO_URL)
      .then(r => r.json() as Promise<Topology>)
      .catch(() => null);
  }
  return topoPromise;
}

interface ShapePreviewProps {
  alpha3: string;
  width?: number;
  height?: number;
  className?: string;
}

export function ShapePreview({ alpha3, width = 220, height = 160, className }: ShapePreviewProps) {
  const [pathD, setPathD] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setPathD(null);

    const numericStr = COUNTRIES[alpha3]?.numeric;
    if (!numericStr) { setLoading(false); return; }
    const numericId = parseInt(numericStr, 10);

    loadTopo().then((topo) => {
      if (cancelled || !topo) { setLoading(false); return; }

      const obj = (topo.objects as Record<string, GeometryCollection>)['countries'];
      if (!obj) { setLoading(false); return; }

      const collection = feature(topo, obj) as FeatureCollection<Geometry>;
      const country = collection.features.find(f => Number(f.id) === numericId);

      if (!country) { setLoading(false); return; }

      const padding = 16;
      const projection = geoMercator().fitExtent(
        [[padding, padding], [width - padding, height - padding]],
        country,
      );
      const gen = geoPath(projection);
      const d = gen(country);
      if (d && !cancelled) setPathD(d);
      if (!cancelled) setLoading(false);
    });

    return () => { cancelled = true; };
  }, [alpha3, width, height]);

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      style={{ overflow: 'visible' }}
      aria-hidden
    >
      {loading ? (
        <rect x={0} y={0} width={width} height={height} rx={8} fill="currentColor" opacity={0.08} />
      ) : pathD ? (
        <>
          {/* Shadow */}
          <path d={pathD} fill="currentColor" opacity={0.12} transform="translate(3,3)" className="text-black" />
          {/* Shape */}
          <path d={pathD} fill="currentColor" stroke="currentColor" strokeWidth={1.5} strokeOpacity={0.4} className="text-board-green" />
        </>
      ) : (
        <text x={width / 2} y={height / 2} textAnchor="middle" className="fill-board-muted text-xs">?</text>
      )}
    </svg>
  );
}
