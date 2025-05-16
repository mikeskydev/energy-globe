import { LineBasicMaterial, LineSegments, Object3D, Sprite, SpriteMaterial, Texture, TextureLoader, LessEqualDepth } from "three";
import GeoJsonGeometry from "three-geojson-geometry";
import DataDisplay from "./DataDisplay";

class CountryLayers extends Object3D {
    data: {};
    spriteTex: Texture
    targetYear: number;
    hotspots: Object3D[] = [];
    dataDisplay: DataDisplay;

    constructor(targetYear: number = 2022, dataDisplay: DataDisplay) {
        super();
        this.targetYear = targetYear;
        this.spriteTex = new TextureLoader().load("src/res/img/pin.png");

        this.dataDisplay = dataDisplay;
        this.add(this.dataDisplay);

        this.formatData().then(() => {
            this.#BuildCountries();
        });

        window.addEventListener("hotspotselect", this);
    }

    handleEvent(ev: CustomEvent) {
        switch(ev.type) {
            case "hotspotselect":
                const data = ev.detail;
        
                const sourceValues = data.userData.data.data;
                const values = {};

                values["name"] = data.userData.data.name;

                values["coal"] = sourceValues.coal_share_elec;
                values["gas"] = sourceValues.gas_share_elec;
                values["oil"] = sourceValues.oil_share_elec;
                values["nuclear"] = sourceValues.nuclear_share_elec;

                values["solar"] = sourceValues.solar_share_elec;
                values["hydro"] = sourceValues.hydro_share_elec;
                values["wind"] = sourceValues.wind_share_elec;
                values["biofuel"] = sourceValues.biofuel_share_elec;
                values["other"] = sourceValues.other_renewables_share_elec;

                const [azimuth, polar] = data.userData.data.centroid.coordinates;
                
                this.dataDisplay.setData(data.position, azimuth, polar, values);
            case "":
                break;
        }
        if (ev.type == "hotspotselect") {
        }

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
                        // collapse data down to specific year
                        this.data[obj].data = datum;
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
                    sprite.renderOrder = 2;
                    sprite.position.set(positionData[0], positionData[1], positionData[2]);
                    sprite.scale.set(0.05, 0.05, 0.05);

                    sprite.center.set(0.5, 0);
                    sprite.userData["type"] = "hotspot";
                    this.hotspots.push(sprite);

                    country.add(sprite);
                    sprite.userData["data"] = countryData
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
