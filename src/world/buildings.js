import { CampusFracture } from "../physics/fracture.js";
import { CampusVisuals } from "../rendering/materials.js";
export function createBuildings({ T, world, layout, visuals, rng, $ }) {
  const sideMaterial = new T.MeshStandardMaterial({
    map: visuals.wall,
    bumpMap: visuals.wallBump,
    bumpScale: 0.12,
    roughnessMap: visuals.wallRoughness,
    roughness: 0.85,
    vertexColors: true,
    side: T.DoubleSide,
  });
  const roofMaterial = new T.MeshStandardMaterial({
    map: visuals.roof,
    bumpMap: visuals.roof,
    bumpScale: 0.055,
    roughness: 0.93,
    vertexColors: true,
    side: T.DoubleSide,
  });
  const fracture = CampusFracture(T, rng),
    blocks = [],
    buildings = [];
  function building(spec) {
    const b = { ...spec, ids: [] };
    buildings.push(b);
    for (const segment of b.segments) {
      const yaw = new T.Matrix4().makeRotationY(segment.angle || 0),
        origin = new T.Vector3(segment.x, b.baseY, segment.z);
      const local = {
        x: 0,
        z: 0,
        nx: segment.w / 3.6,
        nz: segment.d / 3.6,
        floors: segment.floors ?? b.floors,
        color: b.color,
      };
      for (const part of fracture.buildingParts(local)) {
        part.building = b;
        part.segment = segment;
        part.origin.applyMatrix4(yaw).add(origin);
        part.p.copy(part.origin);
        for (const vertices of part.surfaces)
          for (let i = 0; i < vertices.length; i += 3) {
            const v = new T.Vector3(
              vertices[i],
              vertices[i + 1],
              vertices[i + 2],
            ).applyMatrix4(yaw);
            vertices[i] = v.x;
            vertices[i + 1] = v.y;
            vertices[i + 2] = v.z;
          }
        part.corners.forEach((v) => v.applyMatrix4(yaw));
        b.ids.push(blocks.length);
        blocks.push(part);
      }
    }
    const label = document.createElement("div");
    label.className = "building-label";
    label.textContent = b.name;
    $("labels-layer").appendChild(label);
    b.label = label;
    if (b.link) label.style.visibility = "hidden";
  }
  for (const b of layout.buildings) building(b);
  for (const link of layout.links)
    building({
      ...link,
      floors: 1,
      color: "#b9d1c8",
      link: true,
      segments: [link],
    });
  const fractured = fracture.batch(blocks, [sideMaterial, roofMaterial]),
    blockMesh = fractured.mesh;
  world.add(blockMesh);
  const architecture = CampusVisuals.architecture(
    T,
    world,
    buildings,
    blocks,
    layout,
  );

  return { blocks, buildings, fractured, blockMesh, architecture };
}
