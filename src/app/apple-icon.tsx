import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #4C85F6, #7C5CFF)',
        borderRadius: 36,
      }}
    >
      {/* Document */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: 100,
          height: 130,
          background: 'rgba(255,255,255,0.95)',
          borderRadius: 8,
          padding: '30px 14px 14px',
          gap: 12,
          position: 'relative',
        }}
      >
        {/* Page fold */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: 24,
            height: 24,
            background: 'linear-gradient(135deg, transparent 50%, rgba(76,133,246,0.2) 50%)',
            borderRadius: '0 8px 0 0',
            display: 'flex',
          }}
        />
        {/* Redacted line */}
        <div
          style={{
            width: '100%',
            height: 10,
            background: '#1E293B',
            borderRadius: 3,
            opacity: 0.85,
            display: 'flex',
          }}
        />
        {/* Normal line */}
        <div
          style={{
            width: '75%',
            height: 8,
            background: '#CBD5E1',
            borderRadius: 3,
            display: 'flex',
          }}
        />
        {/* Redacted line */}
        <div
          style={{
            width: '100%',
            height: 10,
            background: '#1E293B',
            borderRadius: 3,
            opacity: 0.85,
            display: 'flex',
          }}
        />
        {/* Normal line */}
        <div
          style={{
            width: '60%',
            height: 8,
            background: '#CBD5E1',
            borderRadius: 3,
            display: 'flex',
          }}
        />
      </div>
    </div>,
    { ...size },
  )
}
