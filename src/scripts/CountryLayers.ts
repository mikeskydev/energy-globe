import { Group, DepthModes, Line, LineBasicMaterial, LineLoop, LineSegments, Object3D, Scene, Shape, Sprite, SpriteMaterial, Texture, TextureLoader, LessEqualDepth } from "three";
import GeoJsonGeometry from "three-geojson-geometry";

class CountryLayers extends Object3D {
    data: {};
    spriteTex: Texture
    targetYear: number;
    hotspots: Object3D[] = [];

    constructor(targetYear: number = 2022) {
        super();
        this.targetYear = targetYear;
        this.spriteTex = new TextureLoader().load("src/res/img/pin.png");
        this.formatData().then(() => {
            this.#BuildCountries();
        });
    }

    async formatData() {
        // Filter for only countries and targetYear data
        // TODO: nice slider for all years?
        this.data = await fetch("src/res/data/owid-energy-data.json").then(data => data.json());
        this.data = Object.keys(this.data)
            .filter(obj => {
                if (this.data[obj].iso_code === undefined) return false;
                let found = false;
                this.data[obj].data.forEach(datum => {
                    if (datum.year == this.targetYear) {
                        found = true;
                        return;
                    }
                });
                return found;
            })
            .reduce((dict, key) => {
                // re-key by iso-3 code
                this.data[key].name = key;
                dict[this.data[key].iso_code] = this.data[key];
                return dict;
            }, {});

        // Add borders.
        let borders = await fetch("src/res/data/ne_50m_admin_0_countries.geojson").then(data => data.json());
        borders.features.forEach(feature => {
            let code = feature.properties.ISO_A3;
            if (code) {
                if (this.data[code]) {
                    this.data[code].outline = feature.geometry;
                    this.data[code].iso_2 = feature.properties.ISO_A2;
                }
            }
        })

        // Centroids. Data is missing ISO-3, so we do a lookup using the ISO-2 from borders.
        let centroids = await fetch("src/res/data/countries_center.geojson").then(data => data.json());
        centroids = centroids.features.reduce((dict, key) => {
            const iso = key.properties.ISO;
            const newIso = this.#IsoLookup(this.data, iso);
            if (newIso) dict[newIso] = key;
            return dict;
        }, {});
        
        // Map centroids into main data 
        Object.entries(this.data).forEach(([key, element]) => {
            const centroid = centroids[element["iso_code"]];
            if (centroid) element["centroid"] = centroids[element["iso_code"]]["geometry"];
        });

        this.data = this.data;
    }

    #IsoLookup(data: {}, code: string) : string {
        let found: string;
        Object.entries(data).forEach(([key, val]) => {
            const iso2 = val["iso_2"];
            if (iso2 && (iso2 === code)) {
                found = val["iso_code"];
            }
        })
        return found;
    }

    #BuildCountries() {
        Object.entries(this.data).forEach(([key, countryData]) => {
            
            const outline = countryData["outline"];
            if (outline && (outline.type == "Polygon" || outline.type == "MultiPolygon")) {
                const country = new LineSegments(new GeoJsonGeometry(outline, 2), new LineBasicMaterial());

                const centroid = countryData["centroid"];
                if (centroid && centroid.type == "Point") {
                    // letGeoJson do the calc for us, but steal it's data.
                    const geom = new GeoJsonGeometry(centroid, 2.05);
                    const positionData = geom.attributes.position.array;
    
                    const sprite = new Sprite(new SpriteMaterial({ map: this.spriteTex, color: '#66d19e', depthFunc: LessEqualDepth}));
                    sprite.position.set(positionData[0], positionData[1], positionData[2]);
                    sprite.scale.set(0.05, 0.05, 0.05);

                    sprite.center.set(0.5, 0);
                    sprite.userData["type"] = "hotspot";
                    this.hotspots.push(sprite);

                    country.add(sprite);
                    country.userData["data"] = countryData
                    this.add(country);
                } else {
                    console.warn("No centroid found for", countryData["iso_code"] + ":", countryData["name"]);
                }
            }
            else {
                console.warn("No outline found for", countryData["iso_code"] + ":", countryData["name"]);
            }
        })
    }
}


export default CountryLayers;

// {
//     if (energyData[obj]["iso_code"] === undefined) return false;
//     // energyData[obj].data.forEach(datum => {
//     //     if (datum.year == 2023) {console.log("found");return true};
//     // });
//     return true;
// }