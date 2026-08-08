// Define quais colliders precisam ser reinseridos quando a grade espacial é
// reconstruída. O cellSize é informado diretamente em setSpatialCollisionSystem().
export const SPATIAL_HASH_REBUILD_TYPE = Object.freeze({
  ALL: 0,
  EVERY_FRAME_ONLY: 1,
});
