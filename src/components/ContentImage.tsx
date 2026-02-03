'use client'

import React, { useEffect, useState } from 'react'
import { getImageMeta } from '../lib'
import { getSiteId } from '../utils'
import { cx } from 'class-variance-authority'
import Spinner from './Spinner'

export default function ContentImage({
  src,
  site_id,
  alt = null,
  width = 1920,
  height = null,
  className = '',
  loading = 'lazy',
  sizes = [480, 768, 1024, 1440, 1920, 2560],
  default_breakpoints = '(max-width: 480px) 100vw, (max-width: 768px) 90vw, (max-width: 1024px) 80vw, (max-width: 1440px) 70vw, (max-width: 1920px) 60vw, 1920px',
}: {
  src: string
  alt?: string | null
  site_id?: string
  width?: number | null
  height?: number | null
  className?: string
  loading?: 'lazy' | 'eager'
  sizes?: number[]
  default_breakpoints?: string
}) {
  const active_site_id = site_id || getSiteId() || 'default'
  const [has_error, setHasError] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [meta, setMeta] = useState<
    Awaited<ReturnType<typeof getImageMeta>> | null | false
  >(null)
  const [file_path, setFilePath] = useState<string | null>(null)
  const [src_set, setSrcSet] = useState<string | undefined>(undefined)
  const [breakpoints, setBreakpoints] = useState<string>(default_breakpoints)
  const [aspect_ratio, setAspectRatio] = useState<string | number>('auto')

  useEffect(() => {
    if (src.startsWith('http')) {
      setBreakpoints('100vw')
      setSrcSet(src)
      setFilePath(src)
      return
    }

    const fetchMeta = async () => {
      const file_name = src.split('/').pop() || src
      try {
        const result = await getImageMeta(
          file_name,
          active_site_id,
          active_site_id !== 'preview',
        )
        setMeta(result || false)
      } catch {
        setMeta(false)
      }
    }

    fetchMeta()
  }, [src, active_site_id])

  useEffect(() => {
    if (meta) {
      const image_aspect_ratio = meta.width / meta.height
      setAspectRatio(image_aspect_ratio)
    }
  }, [meta])

  useEffect(() => {
    if (meta) {
      const image_width = width || meta.width
      const image_height =
        height ||
        Math.round(
          image_width / (typeof aspect_ratio === 'number' ? aspect_ratio : 1),
        )

      setSrcSet(
        sizes
          .map(
            size =>
              `/images/${encodeURIComponent(meta.file_name as string)}?w=${size} ${size}w`,
          )
          .join(', '),
      )

      setFilePath(
        `/images/${encodeURIComponent(meta.file_name as string)}?w=${image_width}&h=${image_height}&site_id=${active_site_id}`,
      )
    }
  }, [meta, width, height, aspect_ratio, active_site_id])

  if (has_error || (meta === false && file_path === null)) {
    return (
      <span className="flex h-full w-full items-center justify-center">
        <span className="rounded border-2 border-secondary p-3 text-center font-bold text-secondary">
          Unbekanntes Bild: {src} ({active_site_id})
        </span>
      </span>
    )
  }

  if (file_path === null) {
    return (
      <span className="flex h-full w-full items-center justify-center">
        <Spinner />
      </span>
    )
  }

  return (
    <span
      className="relative block h-full w-full"
      style={{ aspectRatio: aspect_ratio }}
    >
      {!loaded && (
        <span className="absolute inset-0 z-10 flex items-center justify-center bg-white/50">
          <Spinner />
        </span>
      )}

      <picture>
        <source sizes={breakpoints} srcSet={src_set} />
        <img
          alt={alt || (meta && meta.alt) || ''}
          className={cx(
            'absolute inset-0 h-full w-full object-cover transition-opacity duration-700',
            loaded ? 'opacity-100' : 'opacity-0',
            className,
          )}
          loading={loading}
          onError={() => setHasError(true)}
          onLoad={() => setLoaded(true)}
          src={file_path}
        />
      </picture>

      {meta && meta.copyright && loaded && (
        <span className="absolute bottom-0 right-0 z-20 bg-primary px-2 py-1 text-xs text-white">
          © {meta.copyright}
        </span>
      )}
    </span>
  )
}
