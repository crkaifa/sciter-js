
export function noop() { }

export function strip(value, re) {
    return value.replace(re, '');
}

export function getPostDelimiter(value, delimiter, delimiters) {
    // single delimiter
    if (delimiters.length === 0) {
        return value.slice(-delimiter.length) === delimiter ? delimiter : '';
    }

    // multiple delimiters
    var matchedDelimiter = '';
    delimiters.forEach(function (current) {
        if (value.slice(-current.length) === current) {
            matchedDelimiter = current;
        }
    });

    return matchedDelimiter;
}

export function getDelimiterREByDelimiter(delimiter) {
    return new RegExp(delimiter.replace(/([.?*+^$[\]\\(){}|-])/g, '\\$1'), 'g');
}

export function getNextCursorPosition(prevPos, oldValue, newValue, delimiter, delimiters) {
  // If cursor was at the end of value, just place it back.
  // Because new value could contain additional chars.
  if (oldValue.length === prevPos) {
      return newValue.length;
  }

  return prevPos + this.getPositionOffset(prevPos, oldValue, newValue, delimiter ,delimiters);
}

export function getPositionOffset(prevPos, oldValue, newValue, delimiter, delimiters) {
    var oldRawValue, newRawValue, lengthOffset;

    oldRawValue = stripDelimiters(oldValue.slice(0, prevPos), delimiter, delimiters);
    newRawValue = stripDelimiters(newValue.slice(0, prevPos), delimiter, delimiters);
    lengthOffset = oldRawValue.length - newRawValue.length;

    return (lengthOffset !== 0) ? (lengthOffset / Math.abs(lengthOffset)) : 0;
}

export function stripDelimiters(value, delimiter, delimiters) {
    // single delimiter
    if (delimiters.length === 0) {
        var delimiterRE = delimiter ? getDelimiterREByDelimiter(delimiter) : '';

        return value.replace(delimiterRE, '');
    }

    // multiple delimiters
    delimiters.forEach(function (current) {
        current.split('').forEach(function (letter) {
            value = value.replace(getDelimiterREByDelimiter(letter), '');
        });
    });

    return value;
}

export function headStr(str, length) {
    return str.slice(0, length);
}

export function getMaxLength(blocks) {
    return blocks.reduce(function (previous, current) {
        return previous + current;
    }, 0);
}

// strip prefix
// Before type  |   After type    |     Return value
// PEFIX-...    |   PEFIX-...     |     ''
// PREFIX-123   |   PEFIX-123     |     123
// PREFIX-123   |   PREFIX-23     |     23
// PREFIX-123   |   PREFIX-1234   |     1234
export function getPrefixStrippedValue(value, prefix, prevResult, delimiter, delimiters, noImmediatePrefix, tailPrefix, signBeforePrefix) {

    const prefixLength = prefix.length;

    // No prefix
    if (prefixLength === 0) {
      return value;
    }

    // Value is prefix
    if (value === prefix && value !== '') {
      return '';
    }

    if (signBeforePrefix && (value.slice(0, 1) == '-')) {
        var prev = (prevResult.slice(0, 1) == '-') ? prevResult.slice(1) : prevResult;
        return '-' + getPrefixStrippedValue(value.slice(1), prefix, prev, delimiter, delimiters, noImmediatePrefix, tailPrefix, signBeforePrefix);
    }

    // Pre result prefix string does not match pre-defined prefix
    if (prevResult.slice(0, prefixLength) !== prefix && !tailPrefix) {
        // Check if the first time user entered something
        if (noImmediatePrefix && !prevResult && value) return value;
        return '';
    } else if (prevResult.slice(-prefixLength) !== prefix && tailPrefix) {
        // Check if the first time user entered something
        if (noImmediatePrefix && !prevResult && value) return value;
        return '';
    }

    var prevValue = stripDelimiters(prevResult, delimiter, delimiters);

    // New value has issue, someone typed in between prefix letters
    // Revert to pre value
    if (value.slice(0, prefixLength) !== prefix && !tailPrefix) {
        return prevValue.slice(prefixLength);
    } else if (value.slice(-prefixLength) !== prefix && tailPrefix) {
        return prevValue.slice(0, -prefixLength - 1);
    }

    // No issue, strip prefix for new value
    return tailPrefix ? value.slice(0, -prefixLength) : value.slice(prefixLength);
}

export function getFirstDiffIndex(prev, current) {
    var index = 0;

    while (prev.charAt(index) === current.charAt(index)) {
        if (prev.charAt(index++) === '') {
            return -1;
        }
    }

    return index;
}

export function getFormattedValue(value, blocks, delimiter, delimiters, delimiterLazyShow) {
    var result = '',
        multipleDelimiters = delimiters.length > 0,
        currentDelimiter = '';

    const blocksLength = blocks.length;

    // no options, normal input
    if (blocksLength === 0) {
        return value;
    }

    blocks.forEach(function (length, index) {
        if (value.length > 0) {
            var sub = value.slice(0, length),
                rest = value.slice(length);

            if (multipleDelimiters) {
                currentDelimiter = delimiters[delimiterLazyShow ? (index - 1) : index] || currentDelimiter;
            } else {
                currentDelimiter = delimiter;
            }

            if (delimiterLazyShow) {
                if (index > 0) {
                    result += currentDelimiter;
                }

                result += sub;
            } else {
                result += sub;

                if (sub.length === length && index < blocksLength - 1) {
                    result += currentDelimiter;
                }
            }

            // update remaining string
            value = rest;
        }
    });

    return result;
}

// move cursor to the end
// the first time user focuses on an input with prefix
export function fixPrefixCursor(el, prefix, delimiter, delimiters) {
    if (!el) {
        return;
    }

    var val = el.value,
        appendix = delimiter || (delimiters[0] || ' ');

    if (!el.edit?.selectRange || !prefix || (prefix.length + appendix.length) <= val.length) {
        return;
    }

    var len = val.length * 2;

    // set timeout to avoid blink
    el.post(function () {
        el.edit.selectRange(len, len);
    });
}

export function setSelection(element, position) {
    if (!element.state.focus) {
        return;
    }
    element.edit.selectRange(position, position);
}
