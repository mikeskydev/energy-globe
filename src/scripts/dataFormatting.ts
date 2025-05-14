
async function formatData(): Promise<JSON> {
    // Energy data
    let energyData = await fetch("src/res/owid-energy-data.json").then(data => data.json());
    energyData = Object.keys(energyData).filter(obj => energyData[obj]["iso_code"] !== undefined).reduce((res, key) => (res[key] = energyData[key], res), {} );
    console.log(energyData);
    return energyData;
}

export default formatData;