import React from 'react'
import { number } from 'prop-types'

export default function CheckMarkIcon ({
  width,
  height,
  callback
}) {
  return <img
    onClick={callback}
    width={width}
    height={height}
    src='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBkPSJNMCAxMWMyLjc2MS41NzUgNi4zMTIgMS42ODggOSAzLjQzOCAzLjE1Ny00LjIzIDguODI4LTguMTg3IDE1LTExLjQzOC01Ljg2MSA1Ljc3NS0xMC43MTEgMTIuMzI4LTE0IDE4LjkxNy0yLjY1MS0zLjc2Ni01LjU0Ny03LjI3MS0xMC0xMC45MTd6Ii8+PC9zdmc+'
    alt='Close Icon' />
}

CheckMarkIcon.propTypes = {
  width: number,
  height: number,
  callback: () => {}
}
