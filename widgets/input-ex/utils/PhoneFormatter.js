

const FNS = {};
let   PRC = "";

export default class PhoneFormatter {

    constructor(phoneRegionCode, delimiter) {

        //PhoneFormatter

        if(!FNS[phoneRegionCode]?.AsYouTypeFormatter) {
            let r = fetch(__DIR__ + "../phone-types/phone-type-formatter." + phoneRegionCode.toLowerCase() + ".js", {sync:true});
            if(!r.ok) r = fetch(__DIR__ + "../phone-types/phone-type-formatter.us.js", {sync:true});
            let t = r.text();
            eval(t).call(FNS[phoneRegionCode] = {});
        }

        const formatter = new FNS[phoneRegionCode].AsYouTypeFormatter(phoneRegionCode);
        PRC = phoneRegionCode;

        this.delimiter = (delimiter || delimiter === '') ? delimiter : ' ';
        this.delimiterRE = delimiter ? new RegExp('\\' + delimiter, 'g') : '';

        this.formatter = formatter;
   }

    setFormatter(formatter) {
        this.formatter = formatter;
    }

    format(phoneNumber) {

        this.formatter.clear();

        // only keep number and +
        phoneNumber = phoneNumber.replace(/[^\d+]/g, '');

        // strip non-leading +
        phoneNumber = phoneNumber.replace(/^\+/, 'B').replace(/\+/g, '').replace('B', '+');

        // strip delimiter
        phoneNumber = phoneNumber.replace(this.delimiterRE, '');

        var result = '', current, validated = false;

        for (var i = 0, iMax = phoneNumber.length; i < iMax; i++) {
            current = this.formatter.inputDigit(phoneNumber.charAt(i));

            // has ()- or space inside
            if (/[\s()-]/g.test(current)) {
                result = current;

                validated = true;
            } else {
                if (!validated) {
                    result = current;
                }
                // else: over length input
                // it turns to invalid number again
            }
        }

        // strip ()
        // e.g. US: 7161234567 returns (716) 123-4567
        result = result.replace(/[()]/g, '');
        // replace library delimiter with user customized delimiter
        result = result.replace(/[\s-]/g, this.delimiter);

        return result;
    }
}
