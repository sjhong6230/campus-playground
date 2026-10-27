export function createNuclearProp(T, world, p) {
  const group = new T.Group(),
    body = new T.Mesh(
      new T.SphereGeometry(1, 20, 14),
      new T.MeshStandardMaterial({
        color: "#353e3d",
        metalness: 0.35,
        roughness: 0.5,
      }),
    );
  body.scale.set(1.6, 4.8, 1.6);
  group.add(body);
  const band = new T.Mesh(
    new T.CylinderGeometry(1.62, 1.62, 1.15, 20),
    new T.MeshStandardMaterial({ color: "#e4b648", roughness: 0.6 }),
  );
  group.add(band);
  for (let i = 0; i < 4; i++) {
    const fin = new T.Mesh(
      new T.BoxGeometry(0.2, 2.4, 2.8),
      new T.MeshStandardMaterial({
        color: "#58615b",
        metalness: 0.2,
        roughness: 0.6,
      }),
    );
    fin.position.y = 3.5;
    fin.rotation.y = (i * Math.PI) / 2;
    group.add(fin);
  }
  group.position.set(p.x, 105, p.z);
  group.scale.setScalar(1.3);
  group.traverse((o) => {
    if (o.isMesh) o.castShadow = true;
  });
  world.add(group);
  return group;
}
