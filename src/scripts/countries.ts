import { Object3D, Points, PointsMaterial, Line, LineSegments, LineBasicMaterial, Sprite, SpriteMaterial, TextureLoader, BackSide } from 'three';
import GeoJsonGeometry from 'three-geojson-geometry'

class CountryLines extends Object3D {
    constructor() {
        super();

        const spriteTex = new TextureLoader().load("src/res/img/pin.png");

        fetch("src/res/countries.geojson").then(data => data.json()).then(data => {
            data.features.forEach(feature => {
                const type = feature.geometry.type;
                if (type == "Polygon" || type == "MultiPolygon") {
                    this.add(new LineSegments(new GeoJsonGeometry(feature.geometry, 2), new LineBasicMaterial()));
                }
                else {
                    console.warn(feature);
                }
            });
        });
        
        fetch("src/res/countries_center.geojson").then(data => data.json()).then(data => {
            data.features.forEach(feature => {
                const type = feature.geometry.type;
                if (type == "Point") {
                    // letGeoJson do the calc for us, but steal it's data.
                    const geom = new GeoJsonGeometry(feature.geometry, 2.01);
                    const positionData = geom.attributes.position.array;

                    const sprite = new Sprite(new SpriteMaterial({ map: spriteTex, color: '#66d19e', shadowSide: BackSide}));
                    sprite.position.set(positionData[0], positionData[1], positionData[2]);
                    sprite.scale.set(0.1, 0.1, 0.1);
                    sprite.userData["type"] = "hotspot";
                    this.add(sprite);
                }
            });
        });
    }
}

export { CountryLines };