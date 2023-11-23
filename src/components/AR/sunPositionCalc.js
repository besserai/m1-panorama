const SunCalc = require('suncalc');
const tzlookup = require("tz-lookup");
const getTimezoneOffset = require("get-timezone-offset")


const defaultLocation = { "latitude": 52.5170365, "longitude": 13.3888599 }

export const getSunPos = (location = defaultLocation, date = new Date()) => {
    const timzone_offset = getTimezoneOffset(tzlookup(location.latitude, location.longitude))
    date.setMinutes(date.getMinutes() + timzone_offset)
    const calc = SunCalc.getPosition(date, location.latitude, location.longitude)
    let altitude = (calc.altitude * 90) / (Math.PI / 2);
    let azimuth = (calc.azimuth * 180) / Math.PI + 180;
    return { "altitude": altitude, "azimuth": azimuth }
}

export const calcSunPathForDate = (location, date = Date.UTC(1970, 1, 1), timeStepsInHrs = 1) => {
    let timeSteps = Array.from({ length: 24 / timeStepsInHrs }, (value, index) => index * timeStepsInHrs);
    const sunPathForDate = [];
    for (let timeStep of timeSteps) {
        sunPathForDate.push(getSunPos(date + (timeStep * 3600000), location));
    }
    return sunPathForDate;
}

export const calcAllSunPathsForLoc = (location, dateStepsInMonts = 3) => {
    let monthSteps = Array.from({ length: 12 / dateStepsInMonts }, (value, index) => 3 + index * dateStepsInMonts);
    const allSunPathsForLoc = [];
    for (let month of monthSteps) {
        allSunPathsForLoc.push({
            label: `Month: ${month}`,
            data: calcSunPathForDate(location, Date.UTC(1970, month - 1, 21)),
            borderColor: `rgb(${250 - 20 * Math.abs(month - 6)}, ${200}, ${0 + 50 * Math.abs(month - 6)})`,
        })
    }
    return allSunPathsForLoc;
}