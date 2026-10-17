import greenhouse from '../../public/illustrations/greenhouse.webp?inline';
import irrigation from '../../public/illustrations/irrigation.webp?inline';
import inspection from '../../public/illustrations/inspection.webp?inline';
import harvest from '../../public/illustrations/harvest.webp?inline';
import resources from '../../public/illustrations/resources.webp?inline';

// Small delivery assets carry their MIME type, including on embedded Site previews.
// The larger entry illustration is loaded only by the separate login module.
export const illustrations = { greenhouse, irrigation, inspection, harvest, resources };
export type IllustrationName = keyof typeof illustrations;
