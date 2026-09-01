// @ts-nocheck -- geometry assembly is kept byte-for-byte close to the source model.
import * as THREE from 'three';
import { glassesConfig } from './glassesConfig';
import { glassesGeometryData, glassesGeometryMeta } from './glassesGeometryData';

function geometryFromData(data, origin = [0, 0, 0]) {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(data.positions, 3));
  geometry.setIndex(data.indices);
  geometry.translate(-origin[0], -origin[1], -origin[2]);
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  return geometry;
}

function meshFromData(data, material, origin) {
  const mesh = new THREE.Mesh(geometryFromData(data, origin), material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}


export function createModel({ materials, config = glassesConfig }: any = {}) {
  if (!materials) throw new Error('Glasses model requires a material library.');
  const root = new THREE.Group();
  root.name = config.id;
  root.rotation.fromArray(config.rootRotation);
  const frameMaterial = materials.translucentFramePlastic.clone();
  // Keep the same PBR response while avoiding transparent front/back pass
  // reordering on this thin, double-sided shell during camera orbit.
  frameMaterial.forceSinglePass = true;
  const parts = [];
  const groups = { frame: [], optics: [], temples: [], hardware: [] };
  const nodes = {};

  function register(part, name, home, explodeAmount, groupName) {
    part.name = name;
    part.userData.partName = name;
    part.userData.home = home.clone();
    part.userData.explodeAmount = explodeAmount;
    part.position.copy(home);
    parts.push(part);
    groups[groupName].push(part);
    nodes[name] = part;
    root.add(part);
    return part;
  }

  register(meshFromData(glassesGeometryData.frame, frameMaterial), 'frame', new THREE.Vector3(), 1, 'frame');
  const bridgeHome = new THREE.Vector3(0, 0.08, 0.08);
  register(meshFromData(glassesGeometryData.bridge, frameMaterial, bridgeHome.toArray()), 'bridge', bridgeHome, 1.18, 'frame');

  for (const [name, x] of [['leftLens', -1.78], ['rightLens', 1.78]]) {
    const home = new THREE.Vector3(x, 0, 0.02);
    const lens = meshFromData(glassesGeometryData[name], materials.amberOpticalLens, home.toArray());
    lens.renderOrder = 3;
    register(lens, name, home, 1.3, 'optics');
  }

  const leftHome = new THREE.Vector3(...config.hinges.left.position);
  const rightHome = new THREE.Vector3(...config.hinges.right.position);
  register(new THREE.Group(), 'leftHinge', leftHome, 1.42, 'hardware');
  register(new THREE.Group(), 'rightHinge', rightHome, 1.42, 'hardware');

  const leftTemplePivot = new THREE.Group();
  const rightTemplePivot = new THREE.Group();
  const leftTemple = meshFromData(glassesGeometryData.leftTemple, frameMaterial, leftHome.toArray());
  const rightTemple = meshFromData(glassesGeometryData.rightTemple, frameMaterial, rightHome.toArray());
  leftTemple.name = 'leftTempleMesh';
  rightTemple.name = 'rightTempleMesh';
  leftTemplePivot.add(leftTemple);
  rightTemplePivot.add(rightTemple);
  register(leftTemplePivot, 'leftTemple', leftHome, 1.68, 'temples');
  register(rightTemplePivot, 'rightTemple', rightHome, 1.68, 'temples');
  Object.assign(nodes, { leftTemplePivot, rightTemplePivot, leftTemple, rightTemple });

  let state = config.defaultState;
  let transition = null;
  let disposed = false;
  const angles = { left: config.hinges.left.openAngle, right: config.hinges.right.openAngle };
  const applyAngles = () => {
    leftTemplePivot.rotation.y = angles.left;
    rightTemplePivot.rotation.y = angles.right;
  };

  function setState(nextState, options = {}) {
    if (!config.supportedStates.includes(nextState)) throw new Error(`Unsupported glasses state: ${nextState}`);
    const key = nextState === 'folded' ? 'foldedAngle' : 'openAngle';
    const target = { left: config.hinges.left[key], right: config.hinges.right[key] };
    state = nextState;
    const duration = options.immediate ? 0 : Math.max(0, options.duration ?? config.animation.duration);
    transition = duration ? { elapsed: 0, duration, from: { ...angles }, to: target } : null;
    if (!duration) Object.assign(angles, target);
    applyAngles();
    return state;
  }

  function update(deltaSeconds) {
    if (!transition || disposed) return;
    transition.elapsed = Math.min(transition.elapsed + deltaSeconds, transition.duration);
    const t = transition.elapsed / transition.duration;
    const eased = t * t * (3 - 2 * t);
    angles.left = THREE.MathUtils.lerp(transition.from.left, transition.to.left, eased);
    angles.right = THREE.MathUtils.lerp(transition.from.right, transition.to.right, eased);
    applyAngles();
    if (t === 1) transition = null;
  }

  applyAngles();
  root.userData.sculptRuntime = {
    nodes, destructionGroups: groups, actionStates: config.supportedStates,
    sourceGeometry: glassesGeometryMeta,
  };

  function dispose() {
    disposed = true;
    transition = null;
    root.traverse((object) => object.geometry?.dispose());
    frameMaterial.dispose();
  }

  return {
    root, parts, groups, bounds: new THREE.Box3().setFromObject(root),
    focusPoint: new THREE.Vector3().fromArray(config.focusPoint),
    supportedStates: [...config.supportedStates], setState, getState: () => state,
    update, dispose,
  };
}
