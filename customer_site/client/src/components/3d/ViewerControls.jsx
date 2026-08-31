import React from 'react';
import { RotateCw, ZoomIn, ZoomOut, RefreshCw, Eye, Move } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';

export default function ViewerControls() {
  const { autoRotate, setAutoRotate, cameraPreset, setCameraPreset, zoomLevel, setZoomLevel, resetViewer } = useUIStore();

  const handleZoomIn = () => {
    if (zoomLevel < 1.8) setZoomLevel(zoomLevel + 0.2);
  };

  const handleZoomOut = () => {
    if (zoomLevel > 0.6) setZoomLevel(zoomLevel - 0.2);
  };

  return (
    <div style={{
      position: 'absolute',
      bottom: '24px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 10,
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      background: 'rgba(18, 18, 24, 0.75)',
      backdropFilter: 'blur(16px)',
      padding: '8px 16px',
      borderRadius: '40px',
      border: '1px solid rgba(255, 255, 255, 0.12)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
      maxWidth: '90vw',
      overflowX: 'auto'
    }}>
      {/* Preset view buttons */}
      <button
        onClick={() => setCameraPreset('front')}
        style={{
          background: cameraPreset === 'front' ? '#d4af37' : 'rgba(255, 255, 255, 0.05)',
          color: cameraPreset === 'front' ? '#000' : '#fff',
          border: 'none',
          padding: '6px 14px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: 600,
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          transition: 'all 0.2s'
        }}
      >
        Front
      </button>

      <button
        onClick={() => setCameraPreset('side')}
        style={{
          background: cameraPreset === 'side' ? '#d4af37' : 'rgba(255, 255, 255, 0.05)',
          color: cameraPreset === 'side' ? '#000' : '#fff',
          border: 'none',
          padding: '6px 14px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: 600,
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          transition: 'all 0.2s'
        }}
      >
        Side
      </button>

      <button
        onClick={() => setCameraPreset('back')}
        style={{
          background: cameraPreset === 'back' ? '#d4af37' : 'rgba(255, 255, 255, 0.05)',
          color: cameraPreset === 'back' ? '#000' : '#fff',
          border: 'none',
          padding: '6px 14px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: 600,
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          transition: 'all 0.2s'
        }}
      >
        Back
      </button>

      <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.15)', margin: '0 4px' }} />

      {/* Auto rotate toggle */}
      <button
        onClick={() => setAutoRotate(!autoRotate)}
        title="Toggle 360° Auto Rotate"
        style={{
          background: autoRotate ? 'rgba(212, 175, 55, 0.2)' : 'transparent',
          color: autoRotate ? '#d4af37' : '#aaa',
          border: 'none',
          padding: '6px',
          borderRadius: '50%',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <RotateCw size={18} style={{ transform: autoRotate ? 'rotate(180deg)' : 'none', transition: 'transform 0.5s' }} />
      </button>

      {/* Zoom In */}
      <button
        onClick={handleZoomIn}
        title="Zoom In"
        style={{ background: 'transparent', color: '#aaa', border: 'none', padding: '6px', cursor: 'pointer' }}
      >
        <ZoomIn size={18} />
      </button>

      {/* Zoom Out */}
      <button
        onClick={handleZoomOut}
        title="Zoom Out"
        style={{ background: 'transparent', color: '#aaa', border: 'none', padding: '6px', cursor: 'pointer' }}
      >
        <ZoomOut size={18} />
      </button>

      {/* Reset View */}
      <button
        onClick={resetViewer}
        title="Reset View"
        style={{ background: 'transparent', color: '#aaa', border: 'none', padding: '6px', cursor: 'pointer' }}
      >
        <RefreshCw size={16} />
      </button>
    </div>
  );
}
