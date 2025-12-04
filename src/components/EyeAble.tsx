import React from 'react'

export default function EyeAble({ src }: { src: string }) {
  return (
    <>
      <script async src={src}></script>
      <script
        async
        src="https://cdn.eye-able.com/public/js/eyeAble.js"
      ></script>
    </>
  )
}
