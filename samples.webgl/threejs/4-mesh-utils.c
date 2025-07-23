#include <jsbridge.h>
#include <math.h>

export int animationStep(
            float* particlePositions, float* particleVelocities, uint32* particleConnections, float* positions, float* colors,
            int particleCount, bool limitConnections, int maxConnections, float minDistance, float r) {

  int vertexpos = 0;
  int colorpos = 0;
  int numConnected = 0;
  float rHalf = r / 2;

  for ( int i = 0; i < particleCount; ++i )
      particleConnections[i] = 0;

  for ( int i = 0; i < particleCount; ++i ) {

      int ix = i * 3;
      int iy = ix + 1;
      int iz = ix + 2;

      particlePositions[ ix ] += particleVelocities[ix];
      particlePositions[ iy ] += particleVelocities[iy];
      particlePositions[ iz ] += particleVelocities[iz];

      if ( particlePositions[ ix ] < - rHalf || particlePositions[ ix ] > rHalf )
          particleVelocities[ ix ] = - particleVelocities[ ix ];
      if ( particlePositions[ iy ] < - rHalf || particlePositions[ iy ] > rHalf )
          particleVelocities[ iy ] = - particleVelocities[ iy ];
      if ( particlePositions[ iz ] < - rHalf || particlePositions[ iz ] > rHalf )
          particleVelocities[ iz ] = - particleVelocities[iz];

      if ( limitConnections && particleConnections[i] >= maxConnections )
          continue;

      // Check collision
      for ( int j = i + 1; j < particleCount; j ++ ) {

          if ( limitConnections && particleConnections[j] >= maxConnections )
              continue;

          int jx = j * 3;
          int jy = jx + 1;
          int jz = jx + 2;

          float dx = particlePositions[ ix ] - particlePositions[ jx ];
          float dy = particlePositions[ iy ] - particlePositions[ jy ];
          float dz = particlePositions[ iz ] - particlePositions[ jz ];
          float dist = sqrtf( dx * dx + dy * dy + dz * dz );

          if ( dist < minDistance ) {

              particleConnections[i] ++;
              particleConnections[j] ++;

              float alpha = 1.0 - dist / minDistance;

              positions[ vertexpos ++ ] = particlePositions[ ix ];
              positions[ vertexpos ++ ] = particlePositions[ iy ];
              positions[ vertexpos ++ ] = particlePositions[ iz ];

              positions[ vertexpos ++ ] = particlePositions[ jx ];
              positions[ vertexpos ++ ] = particlePositions[ jy ];
              positions[ vertexpos ++ ] = particlePositions[ jz ];

              colors[ colorpos ++ ] = alpha;
              colors[ colorpos ++ ] = alpha;
              colors[ colorpos ++ ] = alpha;

              colors[ colorpos ++ ] = alpha;
              colors[ colorpos ++ ] = alpha;
              colors[ colorpos ++ ] = alpha;

              numConnected ++;

          }

      }

  }
  return numConnected;
}