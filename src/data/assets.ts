import logo from '../../public/assets/vigor-forest.webp?inline';
import camera from '../../public/assets/camera-trap.webp?inline';
import evidence from '../../public/assets/inspection-evidence.webp?inline';
import inspection from '../../public/assets/inspection-work.webp?inline';
import greenhouseReference from '../../public/assets/greenhouse-reference.webp?inline';

/** Small, original design crops embedded with their image MIME type. This avoids
 * relative preview paths and hosts that serve WebP as application/octet-stream. */
export const assets = {
  logo,
  camera,
  evidence,
  inspection,
  greenhouseReference,
  cameraVideo: null as string | null,
  greenhouseModel: null as string | null,
};
