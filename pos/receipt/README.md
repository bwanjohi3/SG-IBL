/**
 * @brief Print a char or a control code.
 *
 * This is a base function for text printing.
 * The printer use ESC/POS like printing method.
 *
 * @param c char or control code
 * @code
	control codes:
		09								tabulator (8 spaces)

		0A								print line

		1B '!' mode				set text printing mode
											mode:
												bit0:	0:font12x24, 1:font8x16
												bit1: not used
												bit2: not used
												bit3:	bold
												bit4: double height
												bit5: double width
												bit6:	not used
												bit7:	italic

		1B ' ' space			set space between letters
											space: 0..64

		1B '3' space			set space between text lines
											space: 0..64
											The value include a height of the font.

		1B 'E' mode				set double height
											mode:	0:disable, 1:enable

		1B 'G' mode				set double height
											analog of 1B 'E' command.

		1B 'I' mode				set italic
											mode:	0:disable, 1:enable

		1B 'a' mode				set alignment
											mode:	0:left, 1:center, 2:right

		1B 'u' tbl				set code table
											tbl:	code table number (ISO 8859)
												0:	Latin1 (West European)
												1:	Latin2 (East European)
												2:	Latin3 (South European)
												3:	Latin4 (North European)
												4:	Cyrillic
												5:	Arabic
												6:	Greek
												7:	Hebrew
												8:	Latin5 (Turkish)
												9:	Latin6 (Nordic)
												15:	UTF8

		1B 'B' font				select font
											font:	0:font12x24, 1:font8x16, 2:font24x24 simplified chinese

 * @endcode
 * @return @ref error_codes

const NOR = "\x1B\x21\x02";//CLEAR STYLE
const BOL = "\x1B\x21\x08";//BOLD
const DBX = "\x1B\x21\x20";//# Double width text
const DBY = "\x1B\x21\x10";//# Double height text
const DXY = "\x1B\x21\x30";//# Double height & Width
const ITA = "\x1B\x21\x80";
const ALL = "\x1B\x61\x00";//LEFT - DEFAULT
const ALC = "\x1B\x61\x01";//CENTER
const ALR = "\x1B\x61\x02";//RIGHT
const UTF8P = "\x1B\x75\x0F";