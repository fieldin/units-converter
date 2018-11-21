var Converter = (function() {
    var c = {};
    var pr = {
        value:null, //value to convert
        baseUnit:false, //base unit of value
        baseUnitNumerator:false,
        baseUnitDenominator:false,
    
        numeratorValue:null,
        denominatorValue:null,
    
        //object to hold unit conversion functions
        units:{}
    };

    c.resetDefaultConfig = function() {
        c.config = {
            warn:false
        };
    };

    if(!c.config) {
        c.resetDefaultConfig();
    }

    c.convert = function(value, from_unit, to_unit, decimals, round) {
        var converter = this;
        converter.from(value,from_unit);
        return converter.to(to_unit,decimals,round);
    };

    /**
     * Set from conversion value / unit
     *
     * @param    {number} value -  a numeric value to base conversions on
     * @param    {string} unit (optional) - the unit symbol for the start value
     * @return   none
     */
    c.from = function(val, unit, type) {
        if(!val && val !== 0) {
            return printError('no value given');
        }

        if(typeof val === 'string') {
            printWarning('given value ' + val + ' is string, attempting to convert to number');
            value = parseFloat(val);
        } else {
            value = val;
        }

        if(!unit) {
            pr.value = value;
        } else {
            if(unit.indexOf('/') !== -1) {
                //this is a relation
                var relation = unit.split('/');
                var numerator = relation[0];
                var denominator = relation[1];

                var numerator_multiplier = 1;
                var matches = numerator.match(/(\d+)?(\D+.*)/);
                if(matches && matches.length && matches[1] !== "0") {
                    numerator_multiplier = (matches[1] === undefined ? 1 : +matches[1]);
                    numerator = matches[2];
                } else {
                    return printError('Unit Does Not Exist: ' + numerator);
                }

                var denominator_multiplier = 1;
                matches = denominator.match(/(\d+)?(\D+.*)/);
                if(matches && matches.length && matches[1] !== "0") {
                    denominator_multiplier = (matches[1] === undefined ? 1 : +matches[1]);
                    denominator = matches[2];
                } else {
                    printError('Unit Does Not Exist: ' + denominator);
                }

                c.from(value*numerator_multiplier, numerator, 'Numerator');
                c.from(1*denominator_multiplier, denominator, 'Denominator');
            } else {
                //regular unit, check that we have it
                if(pr.units[unit]) {
                    var _unit = pr.units[unit];
                    if(type){
                        pr['baseUnit' + type] = _unit.base;
                        pr[type.toLowerCase() + 'Value'] = pr.convertToBase(value,_unit);
                    } else {
                        pr.baseUnit = _unit.base;
                        pr.value = pr.convertToBase(value, _unit);
                    }
                } else {
                    return printError('Unit Does Not Exist: ' + unit);
                }
            }
        }
    }
    
    /**
     * Convert from value to new unit
     *
     * @param    {string[]} unit -  the unit symbol (or array of symblos) for the conversion unit
     * @param    {int} decimals (optional, default-null) - the decimal precision of the conversion result
     * @param    {boolean} round (optional, default-false) - round or floor the conversion result
     * @returns   {double}
     */
    c.to = function(unit, decimals, round) {
        if(round === undefined) {
            round = false;
        }

        // check if 'from' value is set
        if(!pr.value && pr.value !== 0 && !pr.numeratorValue && pr.numeratorValue !== 0 && !pr.denominatorValue && pr.denominatorValue !== 0) {
            return printError('From Value Not Set');
        }

        if(!unit) {
            return printError('\'To\' Unit Not Set');
        }
        
        if(typeof unit !== 'string') {
            return pr.toMany(unit, decimals, round);
        } else {
            if(unit.indexOf('/') !== -1) {
                //this is a relation
                var relation = unit.split('/');
                var numerator = relation[0];
                var denominator = relation[1];

                var numerator_multiplier = 1;
                var matches = numerator.match(/(\d+)?(\D+.*)/);
                if(matches && matches.length && matches[1] !== "0") {
                    numerator_multiplier = (matches[1] === undefined ? 1 : +matches[1]);
                    numerator = matches[2];
                } else {
                    return printError('Unit Does Not Exist: ' + numerator);
                }
                pr.value = pr.numeratorValue;
                pr.baseUnit = pr.baseUnitNumerator;
                var numerator_res = pr.toSimple(numerator, decimals, round) * numerator_multiplier;

                var denominator_multiplier = 1;
                matches = denominator.match(/(\d+)?(\D+.*)/);
                if(matches && matches.length && matches[1] !== "0") {
                    denominator_multiplier = (matches[1] === undefined ? 1 : +matches[1]);
                    denominator = matches[2];
                } else {
                    printError('Unit Does Not Exist: ' + denominator);
                }
                pr.value = pr.denominatorValue;
                pr.baseUnit = pr.baseUnitDenominator;
                var denominator_res = pr.toSimple(denominator, decimals, round) / denominator_multiplier;

                if(denominator_res <= 0){
                    denominator_res = 1;
                }

                var result = numerator_res / denominator_res;

                if(decimals || decimals === 0) {
                    var dec = Math.pow(10, decimals);
                    if(round) {
                        //round to the specified number of decimals
                        result = Math.round(result * dec) / dec;
                    } else {
                        //truncate to the nearest number of decimals
                        result = Math.floor(result * dec) / dec;
                    }
                }

                return result;
            } else {
                return pr.toSimple(unit, decimals, round);
            }
        }
    }

    /**
     * Convert from value to new unit
     *
     * @param    {string[]} unit -  the unit symbol (or array of symblos) for the conversion unit
     * @param    {int} decimals (optional, default-null) - the decimal precision of the conversion result
     * @param    {boolean} round (optional, default-false) - round or floor the conversion result
     * @returns   {double}
     */
    pr.toSimple = function(unit, decimals, round) {
        if(round === undefined) {
            round = false;
        }

        // check if 'from' value is set
        if(!pr.value && pr.value !== 0 && !pr.numeratorValue && pr.numeratorValue !== 0 && !pr.denominatorValue && pr.denominatorValue !== 0) {
            return printError('From Value Not Set');
        }

        if(!unit) {
            return printError('\'To\' Unit Not Set');
        }
        
        if(typeof unit !== 'string') {
            return pr.toMany(unit, decimals, round);
        } else {
            //regular unit, check that we have it
            if(pr.units[unit]) {
                var _unit = pr.units[unit];

                var result = 0;

                if(pr.baseUnit) {
                    if(_unit.base != pr.baseUnit) {
                        return printError('Cannot Convert Between Units of Different Types: base ' + pr.baseUnit + ' to base ' + _unit.base);
                    }
                } else {
                    pr.baseUnit = _unit.base;
                }
                
                if(typeof _unit.conversion === 'function') {
                    result = _unit.conversion(pr.value, true);
                } else {
                    result = pr.value / _unit.conversion;
                }

                if(decimals || decimals === 0) {
                    var dec = Math.pow(10, decimals);
                    if(round) {
                        //round to the specified number of decimals
                        result = Math.round(result * dec) / dec;
                    } else {
                        //truncate to the nearest number of decimals
                        result = Math.floor(result * dec) / dec;
                    }
                }

                return result;
            } else {
                return printError('Unit Does Not Exist: ' + unit);
            }
        }
    }

    /**
     * Itterate through multiple unit conversions
     *
     * @param    {string[]} unit -  the array of symblos for the conversion units
     * @param    {int} decimals (optional, default-null) - the decimal precision of the conversion result
     * @param    {boolean} round (optional, default-true) - round or floor the conversion result
     * @return   {object} - results of the coversions
     */
    pr.toMany = function(unitList, decimals, round) {
        if(!unitList || typeof unitList === undefined) {
            unitList = [];
        }
        
        var resultList = {};

        for(var i = 0; i < unitList.length; i++) {
            var unit = unitList[i];

            resultList[unit] = c.to(unit, decimals, round);
        }

        return resultList;
    }

    /**
     * Convert from value to all compatable units
     *
     * @param    {int} decimals (optional, default-null) - the decimal precision of the conversion result
     * @param    {boolean} round (optional, default-false) - round or floor the conversion result
     * @return   {object} - results of conversion to all units with matching base units
     */
    c.toAll = function(decimal, round) {
        //ensure the from value has been set correctly
        if(!pr.value && pr.value !== 0) {
            return printError('From Value Not Set');
        }

        //ensure the base unit has been set correctly
        if(pr.baseUnit) {
            var unitList = [];

            //build array of units that share the same base unit.
            for(var key in pr.units) {
                var unit = pr.units[key];
                if(unit.base == pr.baseUnit) {
                    unitList.push(key);
                }
            }

            return pr.toMany(unitList, decimals, round);
        } else {
            return printError('No From Unit Set');
        }
    }

    /**
     * Convert from value to its base unit
     *
     * @param    {number} value - from value
     * @param    {object} unit - unit from object units
     * @return   {number} - converted value
     */
    pr.convertToBase = function(value, unit) {
        if (typeof unit.conversion === 'function') {
            // if unit has a conversion function, run value through it
            return unit.conversion(value, false);
        } else {
            return value * unit.conversion;
        }
    }

    /**
     * Add Conversion Unit
     *
     * @param    {string} unit - the symbol for the new unit
     * @param    {string} base - the symbol for the base unit of this unit
     * @param    {number/function()} conversion- the conversion ration or conversion function from this unit to its base unit
     * @return   {boolean} - true - if successfull
     */
    c.addUnit = function(unit, base, conversion) {
        //check that the new unit does not already exist
        if (pr.units[unit]) {
            return printError('Unit Already Exists');
        } else {
            //make sure the base unit for the new unit exists or that the new unit is a base unit itself
            if (!pr.units[base] && base != unit) {
                return printError('Base Unit Does Not Exist');
            } else {
                //add unit to units array
                pr.units[unit] = {
                    base:base,
                    conversion:conversion
                };
                return true;
            }
        }
    }


    /**
     * Remove Conversion Unit
     *
     * @param    {string} unit - the symbol for the unit to be removed
     * @return   {boolean} - true - if successfull
     */
    c.removeUnit = function(unit) {
        //check unit exists
        if (pr.units[unit]) {
            //if unit is base unit remove all dependant units
            if (pr.units[unit].base == unit) {
                for(var key in pr.units) {
                    if(pr.units[key].base == unit) {
                        delete pr.units[key];
                    }
                }
            } else {
                //remove unit
                delete pr.units[unit];
            }

            return true;
        } else {
            return printError('Unit Does Not Exist');
        }
    }

    /**
     * List all available conversion units for given unit
     *
     * @param    {string} unit - the symbol to search for available conversion units
     * @return   {array} - list of all available conversion units
     */
    c.getUnits = function(unit) {
        //check that unit exists
        if (pr.units[unit]) {
            //find base unit
            var baseUnit = pr.units[unit].base;

            var unitList = [];
            //find all units that are linked to the base unit
            for(var key in pr.units) {
                if(pr.units[key].base == baseUnit) {
                    unitList.push(key);
                }
            }
            return unitList;
        } else {
            return printError('Unit Does Not Exist');
        }
    }

    /**
     * List all available conversion unit types
     *
     * @return   {array} - list of all available conversion unit types
     */
    c.getUnitTypes = function() {
        var typesList = [];
        //find all unit types
        for(var key in pr.units) {
            if(!pr.inArray(pr.units[key].type,typesList)) {
                typesList.push(pr.units[key].type);
            }
        }
        return typesList;
    }

    /**
     * List all available conversion units for type
     *
     * @param    {string} type - the symbol to search for available conversion units
     * @return   {array} - list of all available conversion units for type
     */
    c.getUnitsForType = function(type) {
        var found = false;
        var _units = [];
        for(var key in pr.units) {
            if(pr.units[key].type == type) {
                found = true;
                break;
            }
        }

        if(!found) {
            return printError("Unrecognized type");
        }

        for(var key in pr.units) {
            if(pr.units[key].type == type) {
                _units.push(key);
            }
        }
        return _units;
    }

    /**
     * Get Base unit for unit
     *
     * @param    {string} type - the symbol to search for available conversion units
     * @return   {array} - list of all available conversion units for type
     */
    c.getUnitBase = function(unit) {
        if(!pr.units[unit]) {
            return printError("Unrecognized Unit");
        }

        return pr.units[unit].base;
    }

    /**
     * Explain unit token
     *
     * @param    {string} unit - the symbol to search for available conversion unit
     * @return   {string} - description of the unit
     */
    c.whatIs = function(unit) {
        if(!pr.units[unit]) {
            return printError("Unrecognized Unit");
        }

        return pr.units[unit].description;
    }
    
    pr.inArray = function(needle, haystack) {
        var length = haystack.length;
        for(var i = 0; i < length; i++) {
            if(haystack[i] == needle) return true;
        }
        return false;
    }
    /**
     * setup units conversion object
     */

    pr.units = {
        // Units Of Length
        'm':  {'base': 'm', 'type':'length', 'description': 'meter - base unit for distance', 'conversion': 1}, //meter - base unit for distance
        'km': {'base': 'm', 'type':'length', 'description': 'kilometer', 'conversion': 1000}, //kilometer
        'dm': {'base': 'm', 'type':'length', 'description': 'decimeter', 'conversion': 0.1}, //decimeter
        'cm': {'base': 'm', 'type':'length', 'description': 'centimeter', 'conversion': 0.01}, //centimeter
        'mm': {'base': 'm', 'type':'length', 'description': 'milimeter', 'conversion': 0.001}, //milimeter
        'μm': {'base': 'm', 'type':'length', 'description': 'micrometer', 'conversion': 0.000001}, //micrometer
        'nm': {'base': 'm', 'type':'length', 'description': 'nanometer', 'conversion': 0.000000001}, //nanometer
        'pm': {'base': 'm', 'type':'length', 'description': 'picometer', 'conversion': 0.000000000001}, //picometer
        'in': {'base': 'm', 'type':'length', 'description': 'inch', 'conversion': 0.0254}, //inch
        'ft': {'base': 'm', 'type':'length', 'description': 'foot', 'conversion': 0.3048}, //foot
        'yd': {'base': 'm', 'type':'length', 'description': 'yard', 'conversion': 0.9144}, //yard
        'mi': {'base': 'm', 'type':'length', 'description': 'mile', 'conversion': 1609.344}, //mile
        'h':  {'base': 'm', 'type':'length', 'description': 'hand', 'conversion': 0.1016}, //hand
        'ly': {'base': 'm', 'type':'length', 'description': 'lightyear', 'conversion': 9460730472580800}, //lightyear
        'au': {'base': 'm', 'type':'length', 'description': 'astronomical unit', 'conversion': 149597870700}, //astronomical unit
        'pc': {'base': 'm', 'type':'length', 'description': 'parsec', 'conversion': 30856775814913672.789139379577965}, //parsec


        // Units Of Area
        'm2':     {'base': 'm2', 'type':'area', 'description': 'meter square - base unit for area', 'conversion': 1}, //meter square - base unit for area
        'km2':    {'base': 'm2', 'type':'area', 'description': 'kilometer square', 'conversion': 1000000}, //kilometer square
        'cm2':    {'base': 'm2', 'type':'area', 'description': 'centimeter square', 'conversion': 0.0001}, //centimeter square
        'mm2':    {'base': 'm2', 'type':'area', 'description': 'milimeter square', 'conversion': 0.000001}, //milimeter square
        'ft2':    {'base': 'm2', 'type':'area', 'description': 'foot square', 'conversion': 0.092903}, //foot square
        'mi2':    {'base': 'm2', 'type':'area', 'description': 'mile square', 'conversion': 2589988.11}, //mile square
        'ac':     {'base': 'm2', 'type':'area', 'description': 'acre', 'conversion': 4046.86}, //acre
        'dunam':  {'base': 'm2', 'type':'area', 'description': 'dunam', 'conversion': 1000}, //dunam
        'ha':     {'base': 'm2', 'type':'area', 'description': 'hectare', 'conversion': 10000}, //hectare

        // Units Of Volume
        'l':      {'base': 'l', 'type':'volume', 'description': 'litre - base unit for volume', 'conversion': 1}, //litre - base unit for volume
        //'100l':   {'base': 'l', 'type':'volume', 'description': '100litre', 'conversion': 100}, //100litre
        'ml':     {'base': 'l', 'type':'volume', 'description': 'mililitre', 'conversion': 0.001}, //mililitre
        'cm3':    {'base': 'l', 'type':'volume', 'description': 'cm^3', 'conversion': 0.001}, //cm^3
        'm3':     {'base': 'l', 'type':'volume', 'description': 'meters cubed', 'conversion': 1000}, //meters cubed
        'pt':     {'base': 'l', 'type':'volume', 'description': 'pint', 'conversion': 0.473176}, //pint
        'ipt':    {'base': 'l', 'type':'volume', 'description': 'imperial pint', 'conversion': 0.56826125}, //imperial pint
        'quart':  {'base': 'l', 'type':'volume', 'description': 'quart', 'conversion': 0.946353}, //quart
        'iquart': {'base': 'l', 'type':'volume', 'description': 'imperial quart', 'conversion': 1.13652}, //imperial quart
        'gal':    {'base': 'l', 'type':'volume', 'description': 'gallon', 'conversion': 3.78541}, //gallon
        //'100gal': {'base': 'l', 'type':'volume', 'description': '100gallon', 'conversion': 378.541}, //100gallon
        'igal':   {'base': 'l', 'type':'volume', 'description': 'imperial gallon', 'conversion': 4.54609}, //imperial gallon
        'floz':   {'base': 'l', 'type':'volume', 'description': ' fluid ounce', 'conversion': 0.0295735}, // fluid ounce

        // Units Of Weight
        'kg':     {'base': 'kg', 'type':'weight', 'description': 'kilogram - base unit for weight', 'conversion': 1}, //kilogram - base unit for weight
        'g':      {'base': 'kg', 'type':'weight', 'description': 'gram', 'conversion': 0.001}, //gram
        'gr':     {'base': 'kg', 'type':'weight', 'description': 'gram', 'conversion': 0.001}, //gram
        'mg':     {'base': 'kg', 'type':'weight', 'description': 'miligram', 'conversion': 0.000001}, //miligram
        'N':      {'base': 'kg', 'type':'weight', 'description': 'Newton (based on earth gravity)', 'conversion': 9.80665002863885}, //Newton (based on earth gravity)
        'st':     {'base': 'kg', 'type':'weight', 'description': 'stone', 'conversion': 6.35029}, //stone
        'lb':     {'base': 'kg', 'type':'weight', 'description': 'pound', 'conversion': 0.453592}, //pound
        'oz':     {'base': 'kg', 'type':'weight', 'description': 'ounce', 'conversion': 0.0283495}, //ounce
        't':      {'base': 'kg', 'type':'weight', 'description': 'metric tonne', 'conversion': 1000}, //metric tonne
        'ukt':    {'base': 'kg', 'type':'weight', 'description': 'UK Long Ton', 'conversion': 1016.047}, //UK Long Ton
        'ust':    {'base': 'kg', 'type':'weight', 'description': 'US short Ton', 'conversion': 907.1847}, //US short Ton

        // Units Of Speed
        'mps':    {'base': 'mps', 'type':'speed', 'description': 'meter per seond - base unit for speed', 'conversion': 1}, //meter per seond - base unit for speed
        'ftps':   {'base': 'mps', 'type':'speed', 'description': 'foot per second', 'conversion': 0.3048}, //foot per second
        'kph':    {'base': 'mps', 'type':'speed', 'description': 'kilometer per hour', 'conversion': 0.277778}, //kilometer per hour
        'mph':    {'base': 'mps', 'type':'speed', 'description': 'kilometer per hour', 'conversion': 0.44704}, //kilometer per hour

        // Units Of Rotation
        'deg':    {'base': 'deg', 'type':'rotation', 'description': 'degrees - base unit for rotation', 'conversion': 1}, //degrees - base unit for rotation
        'rad':    {'base': 'deg', 'type':'rotation', 'description': 'radian', 'conversion': 57.2958}, //radian

        // Units Of Temperature
        'k': {'base': 'k', 'type':'temperature', 'description': 'kelvin - base unit for distance', 'conversion': 1}, //kelvin - base unit for distance
        'c': {'base': 'k', 'type':'temperature', 'description': 'celsius', 'conversion': function (val, tofrom) {
            return tofrom ? val - 273.15 : val + 273.15;
        }}, //celsius
        'f': {'base': 'k', 'type':'temperature', 'description': 'Fahrenheit', 'conversion': function (val, tofrom) {
            return tofrom ? (val * 9/5 - 459.67) : ((val + 459.67) * 5/9);
        }}, //Fahrenheit

        // Units Of Pressure
        'pa':     {'base': 'Pa', 'type':'pressure', 'description': 'Pascal - base unit for Pressure',  'conversion': 1}, //Pascal - base unit for Pressure
        'kpa':    {'base': 'Pa', 'type':'pressure', 'description': 'kilopascal',  'conversion': 1000}, //kilopascal
        'mpa':    {'base': 'Pa', 'type':'pressure', 'description': 'megapascal',  'conversion': 1000000}, //megapascal
        'bar':    {'base': 'Pa', 'type':'pressure', 'description': 'bar',  'conversion': 100000}, //bar
        'mbar':   {'base': 'Pa', 'type':'pressure', 'description': 'milibar',  'conversion': 100}, //milibar
        'psi':    {'base': 'Pa', 'type':'pressure', 'description': 'pound-force per square inch',  'conversion': 6894.76}, //pound-force per square inch

        // Units Of Time
        's':      {'base': 's', 'type':'time', 'description': 'second - base unit for time', 'conversion': 1}, //second - base unit for time
        'year':   {'base': 's', 'type':'time', 'description': 'year - standard year', 'conversion': 31536000}, //year - standard year
        'month':  {'base': 's', 'type':'time', 'description': 'month - 31 days', 'conversion': 18748800}, //month - 31 days
        'week':   {'base': 's', 'type':'time', 'description': 'week', 'conversion': 604800}, //week
        'day':    {'base': 's', 'type':'time', 'description': 'day', 'conversion': 86400}, //day
        'hr':     {'base': 's', 'type':'time', 'description': 'hour', 'conversion': 3600}, //hour
        'min':    {'base': 's', 'type':'time', 'description': 'minute', 'conversion': 30}, //minute
        'ms':     {'base': 's', 'type':'time', 'description': 'milisecond', 'conversion': 0.001}, //milisecond
        'μs':     {'base': 's', 'type':'time', 'description': 'microsecond', 'conversion': 0.000001}, //microsecond
        'ns':     {'base': 's', 'type':'time', 'description': 'nanosecond', 'conversion': 0.000000001}, //nanosecond

        // Units Of Power
        'j':      {'base': 'j', 'type':'power', 'description': 'joule - base unit for energy', 'conversion': 1}, //joule - base unit for energy
        'kj':     {'base': 'j', 'type':'power', 'description': 'kilojoule', 'conversion': 1000}, //kilojoule
        'mj':     {'base': 'j', 'type':'power', 'description': 'megajoule', 'conversion': 1000000}, //megajoule
        'cal':    {'base': 'j', 'type':'power', 'description': 'calorie', 'conversion': 4184}, //calorie
        'Nm':     {'base': 'j', 'type':'power', 'description': 'newton meter', 'conversion': 1}, //newton meter
        'ftlb':   {'base': 'j', 'type':'power', 'description': 'foot pound', 'conversion': 1.35582}, //foot pound
        'whr':    {'base': 'j', 'type':'power', 'description': 'watt hour', 'conversion': 3600}, //watt hour
        'kwhr':   {'base': 'j', 'type':'power', 'description': 'kilowatt hour', 'conversion': 3600000}, //kilowatt hour
        'mwhr':   {'base': 'j', 'type':'power', 'description': 'megawatt hour', 'conversion': 3600000000}, //megawatt hour
        'mev':    {'base': 'j', 'type':'power', 'description': 'mega electron volt', 'conversion': 0.00000000000000016}, //mega electron volt
    };

    var printError = function(error) {
        console.error('[Converter] ' + error);
        return false;
    }

    var printWarning = function(warning) {
        if(c.config && c.config.warn){
            console.warn('[Converter] ' + warning);
        }
        return false;
    }

    return c;
})();

// We'll come back and fix you, naive export
// for future me: remember it should work as global on web and as module on react native
if (this.document) {
    window.Converter = Converter;
} else {
    module.exports = Converter;
}
