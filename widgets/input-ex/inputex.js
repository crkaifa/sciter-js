
import * as env from "@env";
import * as Util from "./utils/Util.js";
//import * as DefaultProperties from './utils/DefaultProperties.js';

import NumeralFormatter from './utils/NumeralFormatter.js';
import DateFormatter from './utils/DateFormatter.js';
import TimeFormatter from './utils/TimeFormatter.js';
import PhoneFormatter from './utils/PhoneFormatter.js';
import CreditCardDetector from './utils/CreditCardDetector.js';

export class InputEx extends Element {

    lastInputValue = "";
    isBackward = false;

    constructor(props) {
        super();
        if(props) this.properties = this.initProps(props);
    }

    this(props) {
        // reset .value if it changes
        if (this.parentElement && props.value !== this.properties.initValue) {
            this.properties = this.initProps(props);
            this.componentDidMount();
        }
    }

    render() {
        return <input|text />;
    }

    componentDidMount() {
        if(!this.properties) {
            // not a reactor component
            var props = {};
            for(let {name,value} of this.attributes)
                props[name] = value;
            this.properties = this.initProps(props);
            this.properties.initValue = this.value;
        }

        const pps = this.properties;

        pps.maxLength = Util.getMaxLength(pps.blocks);

        this.initFormatter();

        // avoid touch input field if value is null
        // otherwise Firefox will add red box-shadow for <input required />
        if (pps.initValue || (pps.prefix && !pps.noImmediatePrefix)) {
            this.handleInput(pps.initValue,false);
        }
    }

    initFormatter() {}

    initProps(opts) {

        return {

            uppercase : !!opts.uppercase,
            lowercase : !!opts.lowercase,

            prefix : opts.prefix ?? '',
            noImmediatePrefix : !!opts.noImmediatePrefix,
            rawValueTrimPrefix : !!opts.rawValueTrimPrefix,
            copyDelimiter : !!opts.copyDelimiter,

            initValue : (opts.value !== undefined && opts.value !== null) ? opts.value.toString() : '',
            delimiter: opts.delimiter ?? " ",
            delimiterLazyShow : !!opts.delimiterLazyShow,
            delimiters : opts.delimiters ?? [],

            blocks : opts.blocks ?? [],
            maxLength : 0,

            backspace : false,
            result : "",

            onValueChanged : opts.onValueChanged ?? (function () {}),

        };
    }

    ["on keydown"](event) {
        var charCode = event.which || event.keyCode;

        this.lastInputValue = this.value;
        this.isBackward = charCode === 8;
    }

    ["on change"](event) {
        const pps = this.properties;

        var postDelimiter = Util.getPostDelimiter(this.lastInputValue, pps.delimiter, pps.delimiters);

        if (this.isBackward && postDelimiter) {
            pps.postDelimiterBackspace = postDelimiter;
        } else {
            pps.postDelimiterBackspace = false;
        }

        this.handleInput(this.value);
    }

    ["on focus"]() {
        const pps = this.properties;
        this.lastInputValue = this.value;

        if (pps.prefix && pps.noImmediatePrefix && !this.value) {
            this.handleInput(pps.prefix);
        }

        Util.fixPrefixCursor(this, pps.prefix, pps.delimiter, pps.delimiters);
    }

    ["on exec:edit:cut"](e) {
        if (!this.checkFullSelection()) return;
        this.copyClipboardData(e);
        this.handleInput('');
        return true;
    }

    ["on exec:edit:copy"](e) {
        if (!this.checkFullSelection()) return;
        this.copyClipboardData(e);
        return true;
    }

    ["on exec:edit:*"](e) {
        this.isBackward = e.type == "exec:edit:delete-prev";
    }

    // Check if input field is fully selected
    checkFullSelection() {
      try {
        const {selectionStart, selectionEnd} = this.edit;
        return selectionStart === 0 && selectionEnd === this.value.length;
      } catch (ex) {
        // Ignore
      }
      return false;
    }


    copyClipboardData(e) {
        const pps = this.properties,
              inputValue = this.value;
        var textToCopy = '';
        if (!pps.copyDelimiter) {
            textToCopy = Util.stripDelimiters(inputValue, pps.delimiter, pps.delimiters);
        } else {
            textToCopy = inputValue;
        }

        try {
            Clipboard.writeText(textToCopy);
            e.preventDefault();
        } catch (ex) {
            //  empty
        }
    }

    handleInput(value, notify = true) {
        const pps = this.properties;

        // case 1: delete one more character "4"
        // 1234*| -> hit backspace -> 123|
        // case 2: last character is not delimiter which is:
        // 12|34* -> hit backspace -> 1|34*
        // note: no need to apply this for numeral mode
        var postDelimiterAfter = Util.getPostDelimiter(value, pps.delimiter, pps.delimiters);
        if (!pps.numeralFormatter && pps.postDelimiterBackspace && !postDelimiterAfter) {
            value = Util.headStr(value, value.length - pps.postDelimiterBackspace.length);
        }

        // phone formatter
        if (pps.phoneFormatter) {
            if (pps.prefix && (!pps.noImmediatePrefix || value.length)) {
                pps.result = pps.prefix + pps.phoneFormatter.format(value).slice(pps.prefix.length);
            } else {
                pps.result = pps.phoneFormatter.format(value);
            }
            this.updateValueState(notify);

            return;
        }

        // numeral formatter
        if (pps.numeralFormatter) {
            // Do not show prefix when noImmediatePrefix is specified
            // This mostly because we need to show user the native input placeholder
            if (pps.prefix && pps.noImmediatePrefix && value.length === 0) {
                pps.result = '';
            } else {
                pps.result = pps.numeralFormatter.format(value);
            }
            this.updateValueState(notify);

            return;
        }

        // date
        if (pps.dateFormatter) {
            value = pps.dateFormatter.getValidatedDate(value);
        }
        // time
        else if (pps.timeFormatter) {
            value = pps.timeFormatter.getValidatedTime(value);
        }

        // strip delimiters
        value = Util.stripDelimiters(value, pps.delimiter, pps.delimiters);

        // strip prefix
        value = Util.getPrefixStrippedValue(value, pps.prefix, pps.result, pps.delimiter, pps.delimiters, pps.noImmediatePrefix, pps.tailPrefix, pps.signBeforePrefix);

        // strip non-numeric characters
        value = pps.numericOnly ? Util.strip(value, /[^\d]/g) : value;

        // convert case
        value = pps.uppercase ? value.toUpperCase() : value;
        value = pps.lowercase ? value.toLowerCase() : value;

        // prevent from showing prefix when no immediate option enabled with empty input value
        if (pps.prefix) {
            if (pps.tailPrefix) {
                value = value + pps.prefix;
            } else {
                value = pps.prefix + value;
            }


            // no blocks specified, no need to do formatting
            if (pps.blocks.length === 0) {
                pps.result = value;
                this.updateValueState(notify);

                return;
            }
        }

        this.updatePropsByValue(value);

        // strip over length characters
        value = Util.headStr(value, pps.maxLength);

        // apply blocks
        pps.result = Util.getFormattedValue(
            value,
            pps.blocks, pps.delimiter, pps.delimiters, pps.delimiterLazyShow
        );

        this.updateValueState(notify);
    }

    updatePropsByValue() {}

    updateValueState(notify = true) {
        const pps = this.properties;

        var endPos = this.edit.selectionEnd;
        var oldValue = this.value;
        var newValue = pps.result;

        endPos = Util.getNextCursorPosition(endPos, oldValue, newValue, pps.delimiter, pps.delimiters);

        this.value = newValue;

        Util.setSelection(this, endPos, pps.document, false);
        if(notify)
            this.callOnValueChanged();
    }

    callOnValueChanged() {
        const pps = this.properties;

        pps.onValueChanged.call(this, {
            target: {
                value: pps.result,
                rawValue: this.getRawValue()
            }
        });
    }

    setPhoneRegionCode(phoneRegionCode) {
        const pps = this.properties;

        pps.phoneRegionCode = phoneRegionCode;
        this.initPhoneFormatter();
        this.onChange();
    }

    setRawValue(value) {
        const pps = this.properties;

        value = value !== undefined && value !== null ? value.toString() : '';

        if (pps.numeral) {
            value = value.replace('.', pps.numeralDecimalMark);
        }

        pps.postDelimiterBackspace = false;

        this.value = value;
        this.handleInput(value,false);
    }

    getRawValue() {
        const pps = this.properties;
        var rawValue = this.value;

        if (pps.rawValueTrimPrefix) {
            rawValue = Util.getPrefixStrippedValue(rawValue, pps.prefix, pps.prefixLength, pps.result, pps.delimiter, pps.delimiters, pps.noImmediatePrefix, pps.tailPrefix, pps.signBeforePrefix);
        }

        if (pps.numeral) {
            rawValue = pps.numeralFormatter.getRawValue(rawValue);
        } else {
            rawValue = Util.stripDelimiters(rawValue, pps.delimiter, pps.delimiters);
        }

        return rawValue;
    }

    getISOFormatDate() {
        const pps = this.properties;

        return pps.date ? pps.dateFormatter.getISOFormatDate() : '';
    }

    getISOFormatTime() {
        const pps = this.properties;

        return pps.time ? pps.timeFormatter.getISOFormatTime() : '';
    }

    getFormattedValue() {
        return this.value;
    }
}

export class NumeralInput extends InputEx {

    initProps(opts) {
        return Object.assign(super.initProps(opts),{
            // numeral
            numeralIntegerScale : opts.numeralIntegerScale > 0 ? opts.numeralIntegerScale : 0,
            numeralDecimalScale : opts.numeralDecimalScale >= 0 ? opts.numeralDecimalScale : 2,
            numeralDecimalMark : opts.numeralDecimalMark || '.',
            numeralThousandsGroupStyle : opts.numeralThousandsGroupStyle || 'thousand',
            numeralPositiveOnly : !!opts.numeralPositiveOnly,
            stripLeadingZeroes : opts.stripLeadingZeroes ?? true,
            signBeforePrefix : !!opts.signBeforePrefix,
            tailPrefix : !!opts.tailPrefix,
            delimiter: opts.delimiter ?? ",",
            numericOnly: true,
        });
    }

    initFormatter() {
        const pps = this.properties;

        pps.numeralFormatter = new NumeralFormatter(
            pps.numeralDecimalMark,
            pps.numeralIntegerScale,
            pps.numeralDecimalScale,
            pps.numeralThousandsGroupStyle,
            pps.numeralPositiveOnly,
            pps.stripLeadingZeroes,
            pps.prefix,
            pps.signBeforePrefix,
            pps.tailPrefix,
            pps.delimiter
        );
    }
}

export class CurrencyInput extends InputEx {

    initProps(opts) {
        return Object.assign(super.initProps(opts),{
            // numeral
            numeralIntegerScale : opts.numeralIntegerScale > 0 ? opts.numeralIntegerScale : 0,
            numeralDecimalScale : opts.numeralDecimalScale >= 0 ? opts.numeralDecimalScale : 2,
            numeralDecimalMark : opts.numeralDecimalMark ?? '.',
            numeralThousandsGroupStyle : opts.numeralThousandsGroupStyle ?? 'thousand',
            numeralPositiveOnly : !!opts.numeralPositiveOnly,
            stripLeadingZeroes : opts.stripLeadingZeroes ?? true,
            signBeforePrefix : !!opts.signBeforePrefix,
            tailPrefix : !!opts.tailPrefix,
            rawValueTrimPrefix: opts.rawValueTrimPrefix ?? false,
            numericOnly: true,
            delimiter: opts.delimiter ?? ",",
        });
    }

    initFormatter() {
        const pps = this.properties;

        pps.numeralFormatter = new NumeralFormatter(
            pps.numeralDecimalMark,
            pps.numeralIntegerScale,
            pps.numeralDecimalScale,
            pps.numeralThousandsGroupStyle,
            pps.numeralPositiveOnly,
            pps.stripLeadingZeroes,
            pps.prefix,
            pps.signBeforePrefix,
            pps.tailPrefix,
            pps.delimiter
        );
    }
}

export class TimeInput extends InputEx {

    initProps(opts) {
        return Object.assign(super.initProps(opts),{
            timePattern : opts.timePattern ?? ['h', 'm', 's'],
            timeFormat : opts.timeFormat ?? '24',
            timeFormatter : {},
            delimiter: opts.delimiter ?? ':',
            numericOnly: true,
        });
    }

    initFormatter() {
        const pps = this.properties;
        pps.timeFormatter = new TimeFormatter(pps.timePattern, pps.timeFormat);
        pps.blocks = pps.timeFormatter.getBlocks();
        pps.blocksLength = pps.blocks.length;
        pps.maxLength = Util.getMaxLength(pps.blocks);
    }

}

export class DateInput extends InputEx {

    initProps(opts) {
        return Object.assign(super.initProps(opts),{
            datePattern : opts.datePattern ?? ['d', 'm', 'Y'],
            dateMin : opts.dateMin ?? '',
            dateMax : opts.dateMax ?? '',
            dateFormatter : {},
            delimiter: opts.delimiter ?? '-',
            numericOnly: true,
        });
    }

    initFormatter() {
        const pps = this.properties;
        pps.dateFormatter = new DateFormatter(pps.datePattern, pps.dateMin, pps.dateMax);
        pps.blocks = pps.dateFormatter.getBlocks();
        pps.blocksLength = pps.blocks.length;
        pps.maxLength = Util.getMaxLength(pps.blocks);
    }
}

export class PhoneInput extends InputEx {

    initProps(opts) {
        return Object.assign(super.initProps(opts),{
            phoneRegionCode : opts.phoneRegionCode ?? env.country(),
            phoneFormatter : {},
        });
    }    

    initFormatter() {
        const pps = this.properties;

        try {
            pps.phoneFormatter = new PhoneFormatter(
                pps.phoneRegionCode,
                pps.delimiter
            );
        } catch (ex) {
            throw new Error('Please include phone-type-formatter.{country}.js lib');
        }
    }
}

export class CreditCardInput extends InputEx {

    initProps(opts) {
        return Object.assign(super.initProps(opts),{
            creditCardStrictMode : !!opts.creditCardStrictMode,
            creditCardType : opts.creditCardType ?? "",
            onCreditCardTypeChanged : opts.onCreditCardTypeChanged || (function () {}),
            prefix : "",
            numericOnly: true,
        });
    }

    //initFormatter() {
    //}

    updatePropsByValue(value) {
        const pps = this.properties;
        var creditCardInfo;

        // At least one of the first 4 characters has changed
        if (Util.headStr(pps.result, 4) === Util.headStr(value, 4)) {
            return;
        }

        creditCardInfo = CreditCardDetector(value, pps.creditCardStrictMode);

        pps.blocks = creditCardInfo.blocks;
        pps.maxLength = Util.getMaxLength(pps.blocks);

        // credit card type changed
        if (pps.creditCardType !== creditCardInfo.type) {
            pps.creditCardType = creditCardInfo.type;

            pps.onCreditCardTypeChanged.call(this, pps.creditCardType);
        }
    }
}
