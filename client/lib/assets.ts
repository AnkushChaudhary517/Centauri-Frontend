/**
 * Centauri Assets Configuration
 * Centralized asset paths for the entire application
 *
 * Assets are stored locally in public/assets/{category}/ folders
 * instead of remote CDN URLs for better performance and control
 */

const ASSETS_BASE_PATH = "/assets";

export const ASSETS = {
  // Base backgrounds and containers
  backgrounds: {
    base: `${ASSETS_BASE_PATH}/backgrounds/base.png`,
    base2: `${ASSETS_BASE_PATH}/backgrounds/base_2.png`,
    roundedRectangle6: `${ASSETS_BASE_PATH}/backgrounds/rounded_rectangle_6.png`,
    roundedRectangleAutoSh: `${ASSETS_BASE_PATH}/backgrounds/rounded_rectangle_auto_sh.png`,
    roundedRectangleAutoSh2: `${ASSETS_BASE_PATH}/backgrounds/rounded_rectangle_auto_sh_2.png`,
  },

  // Ellipse/circle decorative elements
  ellipses: {
    ellipse1Copy: `${ASSETS_BASE_PATH}/ellipses/ellipse_1_copy.png`,
    ellipse1Copy7: `${ASSETS_BASE_PATH}/ellipses/ellipse_1_copy_7.png`,
    ellipse1Copy72: `${ASSETS_BASE_PATH}/ellipses/ellipse_1_copy_7_2.png`,
    ellipse1Copy8: `${ASSETS_BASE_PATH}/ellipses/ellipse_1_copy_8.png`,
    ellipse1Copy9: `${ASSETS_BASE_PATH}/ellipses/ellipse_1_copy_9.png`,
    ellipse1Copy92: `${ASSETS_BASE_PATH}/ellipses/ellipse_1_copy_9_2.png`,
    ellipse2: `${ASSETS_BASE_PATH}/ellipses/ellipse_2.png`,
    ellipse2Copy2: `${ASSETS_BASE_PATH}/ellipses/ellipse_2_copy_2.png`,
  },

  // Path/line decorative elements
  paths: {
    path: `${ASSETS_BASE_PATH}/paths/path.png`,
    path2: `${ASSETS_BASE_PATH}/paths/path_2.png`,
    path3: `${ASSETS_BASE_PATH}/paths/path_3.png`,
    pathCopy: `${ASSETS_BASE_PATH}/paths/path_copy.png`,
    pathCopy2: `${ASSETS_BASE_PATH}/paths/path_copy_2.png`,
    pathCopy22: `${ASSETS_BASE_PATH}/paths/path_copy_2_2.png`,
    pathCopy23: `${ASSETS_BASE_PATH}/paths/path_copy_2_3.png`,
    pathCopy3: `${ASSETS_BASE_PATH}/paths/path_copy_3.png`,
    pathCopy4: `${ASSETS_BASE_PATH}/paths/path_copy_4.png`,
  },

  // Point and pointer elements
  pointers: {
    point: `${ASSETS_BASE_PATH}/pointers/point.png`,
    pointer: `${ASSETS_BASE_PATH}/pointers/pointer.png`,
    pointer2: `${ASSETS_BASE_PATH}/pointers/pointer_2.png`,
  },

  // Shape decorative elements
  shapes: {
    shape1: `${ASSETS_BASE_PATH}/shapes/shape_1.png`,
    shape2: `${ASSETS_BASE_PATH}/shapes/shape_2.png`,
    shape22: `${ASSETS_BASE_PATH}/shapes/shape_2_2.png`,
    shape27: `${ASSETS_BASE_PATH}/shapes/shape_2_7.png`,
    shape325: `${ASSETS_BASE_PATH}/shapes/shape_32_5.png`,
    shape37: `${ASSETS_BASE_PATH}/shapes/shape_37.png`,
    shape372: `${ASSETS_BASE_PATH}/shapes/shape_37_2.png`,
    shape38: `${ASSETS_BASE_PATH}/shapes/shape_38.png`,
    shape39: `${ASSETS_BASE_PATH}/shapes/shape_39.png`,
    shape43: `${ASSETS_BASE_PATH}/shapes/shape_43.png`,
    shape43Copy: `${ASSETS_BASE_PATH}/shapes/shape_43_copy.png`,
    shape43Copy2: `${ASSETS_BASE_PATH}/shapes/shape_43_copy_2.png`,
  },

  // UI elements
  ui: {
    search: `${ASSETS_BASE_PATH}/ui/search.png`,
    tooltip: `${ASSETS_BASE_PATH}/ui/tooltip.png`,
  },

  // Vector/smart object elements
  vectors: {
    vectorSmartObject: `${ASSETS_BASE_PATH}/vectors/vector_smart_object.png`,
    vectorSmartObject3: `${ASSETS_BASE_PATH}/vectors/vector_smart_object_3.png`,
    vectorSmartObject4: `${ASSETS_BASE_PATH}/vectors/vector_smart_object_4.png`,
    vectorSmartObject5: `${ASSETS_BASE_PATH}/vectors/vector_smart_object_5.png`,
    vectorSmartObjectCopy: `${ASSETS_BASE_PATH}/vectors/vector_smart_object_copy.png`,
    vectorSmartObjectCopyU1: `${ASSETS_BASE_PATH}/vectors/vector_smart_object_copy_.png`,
    vectorSmartObjectCopyU2: `${ASSETS_BASE_PATH}/vectors/vector_smart_object_copy__2.png`,
    vectorSmartObjectCopyU3: `${ASSETS_BASE_PATH}/vectors/vector_smart_object_copy__3.png`,
    vectorSmartObjectCopyU4: `${ASSETS_BASE_PATH}/vectors/vector_smart_object_copy__4.png`,
  },

  // ChatGPT images for HowItWorks
  chatgptImages: {
    chatgptImageDec182025: `${ASSETS_BASE_PATH}/chatgpt/chatgpt_image_dec_18_2025.png`,
    chatgptImageDec1802252: `${ASSETS_BASE_PATH}/chatgpt/chatgpt_image_dec_18_2025_2.png`,
    chatgptImageDec1802253: `${ASSETS_BASE_PATH}/chatgpt/chatgpt_image_dec_18_2025_3.png`,
    chatgptImageDec1802254: `${ASSETS_BASE_PATH}/chatgpt/chatgpt_image_dec_18_2025_4.png`,
  },

  // Layer elements
  layers: {
    layer6: `${ASSETS_BASE_PATH}/layers/layer_6.png`,
    layer7: `${ASSETS_BASE_PATH}/layers/layer_7.png`,
  },
};

// Type-safe asset getter function
export function getAsset(path: string, fallback: string = ""): string {
  const keys = path.split(".");
  let value: any = ASSETS;

  for (const key of keys) {
    value = value?.[key];
  }

  return value || fallback;
}
