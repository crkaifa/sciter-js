
# Internalization methods supported by Sciter

## `Intl` namespace

These objects are partially supported by Sciter:

* `Intl.NumberFormat`
* `Intl.DateTimeFormat`
* `Intl.Collator`

### Intl.NumberFormat

#### constructor

```js
  new Intl.NumberFormat([lang:string,]options:object)
```
  
where:
* `lang` optional, "xx" or "xx-yy" string - ISO identifier of language and optionally country variant, for example, "de-AT" is German in Austria. Uses document's locale if ommited. 
* `options` is `{ style: "currency" | "decimal"}` object. 

#### format()

```js
numberFormat.format(number): string
```

formats the number according to national rules.

#### groupSeparator()

```js
numberFormat.groupSeparator(): string
```
Returns group (e.g thousands) separator symbol, typically "," or " ".

#### decimalSeparator()

```js
numberFormat.decimalSeparator(): string
```
Returns decimal/fraction separator symbol, typically "." or ",".

#### fractionalDigits()

```js
numberFormat.fractionalDigits(): integer
```
Returns number of fraction digits, typically 2.

#### formatPattern()

```js
numberFormat.formatPattern(): string
```
Returns used formatting pattern, like `#,##0.00`, see [UNICODE spec](https://cldr.unicode.org/translation/number-currency-formats/number-and-currency-patterns).


#### currencySymbol()

```js
numberFormat.currencySymbol(): string
```
Currency symbol, like `$`.

#### currencyInternationalSymbol()

```js
numberFormat.currencyInternationalSymbol(): string
```
Currency symbol in international notation, like `CAD` for Canadian Dollar.


### `Intl.DateTimeFormat`

#### constructor

```js
  new Intl.DateTimeFormat([lang:string,]options:object)
```
  
  where:
  * `lang`, optional, "xx" or "xx-yy" string - ISO identifier of language and optionally country variant, for example, "de-AT" is German in Austria.
  * `options` - an object that may have these fields:
    * `dateStyle` : `"short" | "medium" | "long"`;
    * `timeStyle` : `"short" | "medium" | "long"`.
  
#### format()

```js
dateTimeFormat.format(date: Date): string
```
formats the date according to national rules.

#### monthNames()

```js
dateTimeFormat.monthNames("short" | "medium" | "long"): array<string>
```
returns array of month names in used locale. January is at index `0`.

#### weekdayNames()

```js
dateTimeFormat.weekdayNames("short" | "medium" | "long"): array<string>
```
returns array of week day names in used locale. Sunday is at `0`.

#### weekdayNames()

```js
dateTimeFormat.weekdayNames("short" | "medium" | "long"): array<string>
```
returns array of week day names in used locale. Sunday is at `0`.

#### timeFormatPattern()

```js
dateTimeFormat.timeFormatPattern(): string
```
returns time format pattern, for example: `"h:mm:ss a"`, see [UNICODE spec](https://cldr.unicode.org/translation/date-time/date-time-patterns#basic-time-formats).

#### timeFormatPattern()

```js
dateTimeFormat.dateFormatPattern(): string
```
returns date format pattern, for example: `"MMM d, y"`, see [UNICODE spec](https://cldr.unicode.org/translation/date-time/date-time-patterns#basic-date-formats).

#### monthView()
  
```js
  dateTimeFormat.monthView(year:int, month:int, options:object): string
```  

The method produces HTML that represents a month view similar to `<input type="calendar">`. 

Where: _year_ is full year, _month_ is a number of month between `0` and `11` and _options_ is an object with the fields:

  * `today:Date` - optional, will mark that day by `.today` class;
  * `firstDayOfWeek:int` - optional, first day of week to use;
  * `dayOfWeekFormat:string` - optional, `"short"` | `"medium"` | `"long"` - length of week day name abbreviation;
  * `monthFormat:string` - optional, `"short"` | `"medium"` | `"long"` - length of month name abbreviation;
  * `showWeekDays:bool` - optional, _true_ to show week days row;
  * `showMonth:bool` - optional, _true_ to show month name as a caption;
  * `showYear:bool` - optional, _true_ to show year in the caption;
  * `dayClass: function(day,month,year):string` - optional, function to generate additional classes to day cells. Function shall return dot separated class names like `.first.second`;
  * `dayContent: function(day,month,year):string` - optional, function to generate content of day cells. The function shall return full content of the day cell (inner HTML of `<td.day>`);


### `Intl.Collator`

#### constructor()

```js
new Intl.Collator(lang:string,options:object)
```
  
where:
  * `lang` is "xx" or "xx-yy" string - ISO identifier of language and optionally country variant, for example, "de-AT" is German in Austria.
  * `options` - is `{ sensitivity: "base" | "accent" | "case" | "variant" }` object. . 
  
#### compare()

```js
collator.compare(a:string, b : string): -1 | 0 | +1
```

compares two strings lexicographically. 

## Methods of particular objects

### date.toLocaleDateString()

```js
date.toLocaleDateString([locale:string], [options])
```
Convert date portion of the Date instance to string.

_options_ is an object that may contain: 
```js
{
  timeZone: "UTC", // optional, if provided treats date as UTC
  dateStyle: "short" | "medium" | "long", // optional format date according to system settings,
}
```

### date.toLocaleTimeString()

```js
date.toLocaleTimeString([locale:string], [options])
```

Convert time portion of the Date instance to string.

_options_ is an object that may contain: 
```js
{
  timeZone: "UTC", // optional, if provided treats date as UTC
  timeStyle: "short" | "long", // optional format time according to system settings,
}
```

### number.toLocaleString()

```js
number.toLocaleString([locale:string], [options])
```
Convert number to string.

_options_ is an object that may contain: 
```js
{
  style: "number" | "currency", // optional
}
```
