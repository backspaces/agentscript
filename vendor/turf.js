function feature(geom, properties, options) {
  if (options === void 0) {
    options = {};
  }
  var feat = { type: "Feature" };
  if (options.id === 0 || options.id) {
    feat.id = options.id;
  }
  if (options.bbox) {
    feat.bbox = options.bbox;
  }
  feat.properties = properties || {};
  feat.geometry = geom;
  return feat;
}
function point(coordinates, properties, options) {
  if (options === void 0) {
    options = {};
  }
  if (!coordinates) {
    throw new Error("coordinates is required");
  }
  if (!Array.isArray(coordinates)) {
    throw new Error("coordinates must be an Array");
  }
  if (coordinates.length < 2) {
    throw new Error("coordinates must be at least 2 numbers long");
  }
  if (!isNumber(coordinates[0]) || !isNumber(coordinates[1])) {
    throw new Error("coordinates must contain numbers");
  }
  var geom = {
    type: "Point",
    coordinates };
  return feature(geom, properties, options);
}
function polygon(coordinates, properties, options) {
  if (options === void 0) {
    options = {};
  }
  for (var _i = 0, coordinates_1 = coordinates; _i < coordinates_1.length; _i++) {
    var ring = coordinates_1[_i];
    if (ring.length < 4) {
      throw new Error("Each LinearRing of a Polygon must have 4 or more Positions.");
    }
    for (var j = 0; j < ring[ring.length - 1].length; j++) {
      if (ring[ring.length - 1][j] !== ring[0][j]) {
        throw new Error("First and last Position are not equivalent.");
      }
    }
  }
  var geom = {
    type: "Polygon",
    coordinates };
  return feature(geom, properties, options);
}
function lineString(coordinates, properties, options) {
  if (options === void 0) {
    options = {};
  }
  if (coordinates.length < 2) {
    throw new Error("coordinates must be an array of two or more positions");
  }
  var geom = {
    type: "LineString",
    coordinates };
  return feature(geom, properties, options);
}
function featureCollection(features, options) {
  if (options === void 0) {
    options = {};
  }
  var fc = { type: "FeatureCollection" };
  if (options.id) {
    fc.id = options.id;
  }
  if (options.bbox) {
    fc.bbox = options.bbox;
  }
  fc.features = features;
  return fc;
}
function multiLineString(coordinates, properties, options) {
  if (options === void 0) {
    options = {};
  }
  var geom = {
    type: "MultiLineString",
    coordinates };
  return feature(geom, properties, options);
}
function multiPoint(coordinates, properties, options) {
  if (options === void 0) {
    options = {};
  }
  var geom = {
    type: "MultiPoint",
    coordinates };
  return feature(geom, properties, options);
}
function multiPolygon(coordinates, properties, options) {
  if (options === void 0) {
    options = {};
  }
  var geom = {
    type: "MultiPolygon",
    coordinates };
  return feature(geom, properties, options);
}
function geometryCollection(geometries, properties, options) {
  if (options === void 0) {
    options = {};
  }
  var geom = {
    type: "GeometryCollection",
    geometries };
  return feature(geom, properties, options);
}
function isNumber(num) {
  return !isNaN(num) && num !== null && !Array.isArray(num);
}

function bboxPolygon(bbox, options) {
  if (options === void 0) {
    options = {};
  }
  var west = Number(bbox[0]);
  var south = Number(bbox[1]);
  var east = Number(bbox[2]);
  var north = Number(bbox[3]);
  if (bbox.length === 6) {
    throw new Error("@turf/bbox-polygon does not support BBox with 6 positions");
  }
  var lowLeft = [west, south];
  var topLeft = [west, north];
  var topRight = [east, north];
  var lowRight = [east, south];
  return polygon([[lowLeft, lowRight, topRight, topLeft, lowLeft]], options.properties, { bbox, id: options.id });
}

function getCoord(coord) {
  if (!coord) {
    throw new Error("coord is required");
  }
  if (!Array.isArray(coord)) {
    if (coord.type === "Feature" && coord.geometry !== null && coord.geometry.type === "Point") {
      return coord.geometry.coordinates;
    }
    if (coord.type === "Point") {
      return coord.coordinates;
    }
  }
  if (Array.isArray(coord) && coord.length >= 2 && !Array.isArray(coord[0]) && !Array.isArray(coord[1])) {
    return coord;
  }
  throw new Error("coord must be GeoJSON Point or an Array of numbers");
}
function getGeom(geojson) {
  if (geojson.type === "Feature") {
    return geojson.geometry;
  }
  return geojson;
}

function booleanPointInPolygon(point, polygon, options) {
  if (options === void 0) {
    options = {};
  }
  if (!point) {
    throw new Error("point is required");
  }
  if (!polygon) {
    throw new Error("polygon is required");
  }
  var pt = getCoord(point);
  var geom = getGeom(polygon);
  var type = geom.type;
  var bbox = polygon.bbox;
  var polys = geom.coordinates;
  if (bbox && inBBox(pt, bbox) === false) {
    return false;
  }
  if (type === "Polygon") {
    polys = [polys];
  }
  var insidePoly = false;
  for (var i = 0; i < polys.length && !insidePoly; i++) {
    if (inRing(pt, polys[i][0], options.ignoreBoundary)) {
      var inHole = false;
      var k = 1;
      while (k < polys[i].length && !inHole) {
        if (inRing(pt, polys[i][k], !options.ignoreBoundary)) {
          inHole = true;
        }
        k++;
      }
      if (!inHole) {
        insidePoly = true;
      }
    }
  }
  return insidePoly;
}
function inRing(pt, ring, ignoreBoundary) {
  var isInside = false;
  if (ring[0][0] === ring[ring.length - 1][0] && ring[0][1] === ring[ring.length - 1][1]) {
    ring = ring.slice(0, ring.length - 1);
  }
  for (var i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    var xi = ring[i][0];
    var yi = ring[i][1];
    var xj = ring[j][0];
    var yj = ring[j][1];
    var onBoundary = pt[1] * (xi - xj) + yi * (xj - pt[0]) + yj * (pt[0] - xi) === 0 && (xi - pt[0]) * (xj - pt[0]) <= 0 && (yi - pt[1]) * (yj - pt[1]) <= 0;
    if (onBoundary) {
      return !ignoreBoundary;
    }
    var intersect = yi > pt[1] !== yj > pt[1] && pt[0] < (xj - xi) * (pt[1] - yi) / (yj - yi) + xi;
    if (intersect) {
      isInside = !isInside;
    }
  }
  return isInside;
}
function inBBox(pt, bbox) {
  return bbox[0] <= pt[0] && bbox[1] <= pt[1] && bbox[2] >= pt[0] && bbox[3] >= pt[1];
}

export { bboxPolygon, booleanPointInPolygon, feature, featureCollection, geometryCollection, getCoord, getGeom, lineString, multiLineString, multiPoint, multiPolygon, point, polygon };
