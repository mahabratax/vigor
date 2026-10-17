import solar from '../../public/farm-objects/solar.webp?inline';
import water from '../../public/farm-objects/water.webp?inline';
import nutrition from '../../public/farm-objects/nutrition.webp?inline';
import climate from '../../public/farm-objects/climate.webp?inline';
import controller from '../../public/farm-objects/controller.webp?inline';
import camera from '../../public/farm-objects/camera.webp?inline';
import sensor from '../../public/farm-objects/sensor.webp?inline';
import leafy from '../../public/farm-objects/plant-leafy.webp?inline';
import tomato from '../../public/farm-objects/plant-tomato.webp?inline';
import pepper from '../../public/farm-objects/plant-pepper.webp?inline';
import type { Device } from '../domain/types';

export const farmObjects = { solar, water, nutrition, climate, controller, camera, sensor };
export type FarmObjectName = keyof typeof farmObjects;
export const plantSprites = { leafy, tomato, pepper, generic: leafy };
export function deviceArtwork(device: Device): FarmObjectName {
  switch (device.type) {
    case 'camera':
      return 'camera';
    case 'sensor':
      return 'sensor';
    case 'nutrition':
      return device.capabilities.includes('dose') ? 'nutrition' : 'sensor';
    case 'environment':
      return 'climate';
    case 'controller':
      return 'controller';
    default:
      return 'water';
  }
}
