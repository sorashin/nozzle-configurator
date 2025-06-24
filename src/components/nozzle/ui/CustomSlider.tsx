import React, { useRef, useEffect } from 'react'

interface CustomSliderProps {
  min: number
  max: number
  step: number
  value: number
  onChange: (value: number) => void
  className?: string
}

const CustomSlider: React.FC<CustomSliderProps> = ({
  min,
  max,
  step,
  value,
  onChange,
  className = ""
}) => {
  const sliderRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (sliderRef.current) {
      const progress = ((value - min) / (max - min)) * 100
      sliderRef.current.style.setProperty('--progress', `${progress}%`)
    }
  }, [value, min, max])

  return (
    <input
      ref={sliderRef}
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className={`custom-slider ${className}`}
      style={{
        '--progress': `${((value - min) / (max - min)) * 100}%`
      } as React.CSSProperties}
    />
  )
}

export default CustomSlider