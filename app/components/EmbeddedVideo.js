import React from 'react';

const EmbeddedVideo = ({ embedUrl }) => {
  return (
    <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', maxWidth: '100%', background: '#000' }}>
      <iframe
        src={embedUrl}
        style={{ position: 'absolute', top: 20, left: 0, width: '70%', height: '60%' }}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title="Embedded Video"
      ></iframe>
    </div>
  );
};

export default EmbeddedVideo;