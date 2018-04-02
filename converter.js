var Convertor = (function() {
    /**
     * setup units conversion array
     */
    var units = {
        "m": {
            "base": "m",
            "conversion": 1
        },
        "km": {
            "base": "m",
            "conversion": 1000
        },
        "dm": {
            "base": "m",
            "conversion": 0.1
        },
        "cm": {
            "base": "m",
            "conversion": 0.01
        },
        "mm": {
            "base": "m",
            "conversion": 0.001
        },
        "μm": {
            "base": "m",
            "conversion": 1.0E-6
        },
        "nm": {
            "base": "m",
            "conversion": 1.0E-9
        },
        "pm": {
            "base": "m",
            "conversion": 1.0E-12
        },
        "in": {
            "base": "m",
            "conversion": 0.0254
        },
        "ft": {
            "base": "m",
            "conversion": 0.3048
        },
        "yd": {
            "base": "m",
            "conversion": 0.9144
        },
        "mi": {
            "base": "m",
            "conversion": 1609.344
        },
        "h": {
            "base": "m",
            "conversion": 0.1016
        },
        "ly": {
            "base": "m",
            "conversion": 9460730472580800
        },
        "au": {
            "base": "m",
            "conversion": 149597870700
        },
        "pc": {
            "base": "m",
            "conversion": 3.0856775814914E+16
        },
        "m2": {
            "base": "m2",
            "conversion": 1
        },
        "km2": {
            "base": "m2",
            "conversion": 1000000
        },
        "cm2": {
            "base": "m2",
            "conversion": 0.0001
        },
        "mm2": {
            "base": "m2",
            "conversion": 1.0E-6
        },
        "ft2": {
            "base": "m2",
            "conversion": 0.092903
        },
        "mi2": {
            "base": "m2",
            "conversion": 2589988.11
        },
        "ac": {
            "base": "m2",
            "conversion": 4046.86
        },
        "dunam": {
            "base": "m2",
            "conversion": 1000
        },
        "ha": {
            "base": "m2",
            "conversion": 10000
        },
        "l": {
            "base": "l",
            "conversion": 1
        },
        "ml": {
            "base": "l",
            "conversion": 0.001
        },
        "cm3": {
            "base": "l",
            "conversion": 0.001
        },
        "m3": {
            "base": "l",
            "conversion": 1000
        },
        "pt": {
            "base": "l",
            "conversion": 0.473176
        },
        "ipt": {
            "base": "l",
            "conversion": 0.56826125
        },
        "quart": {
            "base": "l",
            "conversion": 0.946353
        },
        "iquart": {
            "base": "l",
            "conversion": 1.13652
        },
        "gal": {
            "base": "l",
            "conversion": 3.78541
        },
        "igal": {
            "base": "l",
            "conversion": 4.54609
        },
        "floz": {
            "base": "l",
            "conversion": 0.0295735
        },
        "lpd": {
            "base": "lpd",
            "conversion": 1
        },
        "mlpd": {
            "base": "lpd",
            "conversion": 0.001
        },
        "m3pd": {
            "base": "lpd",
            "conversion": 1000
        },
        "lpha": {
            "base": "lpd",
            "conversion": 0.1
        },
        "ptpac": {
            "base": "lpd",
            "conversion": 0.116924
        },
        "flozpac": {
            "base": "lpd",
            "conversion": 0.00730777
        },
        "quartpac": {
            "base": "lpd",
            "conversion": 0.233848919
        },
        "galpac": {
            "base": "lpd",
            "conversion": 0.935396
        },
        "kg": {
            "base": "kg",
            "conversion": 1
        },
        "g": {
            "base": "kg",
            "conversion": 0.001
        },
        "gr": {
            "base": "kg",
            "conversion": 0.001
        },
        "mg": {
            "base": "kg",
            "conversion": 1.0E-6
        },
        "N": {
            "base": "kg",
            "conversion": 9.8066500286389
        },
        "st": {
            "base": "kg",
            "conversion": 6.35029
        },
        "lb": {
            "base": "kg",
            "conversion": 0.453592
        },
        "oz": {
            "base": "kg",
            "conversion": 0.0283495
        },
        "t": {
            "base": "kg",
            "conversion": 1000
        },
        "ukt": {
            "base": "kg",
            "conversion": 1016.047
        },
        "ust": {
            "base": "kg",
            "conversion": 907.1847
        },
        "kgpd": {
            "base": "kgpd",
            "conversion": 1
        },
        "grpd": {
            "base": "kgpd",
            "conversion": 0.001
        },
        "kgpha": {
            "base": "kgpd",
            "conversion": 0.1
        },
        "grpha": {
            "base": "kgpd",
            "conversion": 0.0001
        },
        "lbpac": {
            "base": "kgpd",
            "conversion": 0.112085
        },
        "ozpac": {
            "base": "kgpd",
            "conversion": 1 / 142.74866
        },
        "mps": {
            "base": "mps",
            "conversion": 1
        },
        "ftps": {
            "base": "mps",
            "conversion": 0.3048
        },
        "kph": {
            "base": "mps",
            "conversion": 0.277778
        },
        "mph": {
            "base": "mps",
            "conversion": 0.44704
        },
        "deg": {
            "base": "deg",
            "conversion": 1
        },
        "rad": {
            "base": "deg",
            "conversion": 57.2958
        },
        "k": {
            "base": "k",
            "conversion": 1
        },
        "c": {
            "base": "k",
            "conversion": function(val, tofrom) {
                return tofrom ? val - 273.15 : val + 273.15;
            }
        },
        "f": {
            "base": "k",
            "conversion": function(val, tofrom) {
                return tofrom ? val * 9 / 5 - 459.67 : (val + 459.67) * 5 / 9;
            }
        },
        "pa": {
            "base": "Pa",
            "conversion": 1
        },
        "kpa": {
            "base": "Pa",
            "conversion": 1000
        },
        "mpa": {
            "base": "Pa",
            "conversion": 1000000
        },
        "bar": {
            "base": "Pa",
            "conversion": 100000
        },
        "mbar": {
            "base": "Pa",
            "conversion": 100
        },
        "psi": {
            "base": "Pa",
            "conversion": 6894.76
        },
        "s": {
            "base": "s",
            "conversion": 1
        },
        "year": {
            "base": "s",
            "conversion": 31536000
        },
        "month": {
            "base": "s",
            "conversion": 18748800
        },
        "week": {
            "base": "s",
            "conversion": 604800
        },
        "day": {
            "base": "s",
            "conversion": 86400
        },
        "hr": {
            "base": "s",
            "conversion": 3600
        },
        "min": {
            "base": "s",
            "conversion": 30
        },
        "ms": {
            "base": "s",
            "conversion": 0.001
        },
        "μs": {
            "base": "s",
            "conversion": 1.0E-6
        },
        "ns": {
            "base": "s",
            "conversion": 1.0E-9
        },
        "j": {
            "base": "j",
            "conversion": 1
        },
        "kj": {
            "base": "j",
            "conversion": 1000
        },
        "mj": {
            "base": "j",
            "conversion": 1000000
        },
        "cal": {
            "base": "j",
            "conversion": 4184
        },
        "Nm": {
            "base": "j",
            "conversion": 1
        },
        "ftlb": {
            "base": "j",
            "conversion": 1.35582
        },
        "whr": {
            "base": "j",
            "conversion": 3600
        },
        "kwhr": {
            "base": "j",
            "conversion": 3600000
        },
        "mwhr": {
            "base": "j",
            "conversion": 3600000000
        },
        "mev": {
            "base": "j",
            "conversion": 1.6E-16
        },
        "tablets": {
            "base": "tablets",
            "conversion": 1
        }
    };

    return {};
})();
