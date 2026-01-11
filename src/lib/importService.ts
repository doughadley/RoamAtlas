
import { Flight, Accommodation, Train, CarRental } from '@/types';

interface ParsedFlight extends Omit<Flight, 'id' | 'tripId'> {
    // Partial flight data
}

interface ParsedTransport extends Omit<Train, 'id' | 'tripId'> {
    // Partial transport data
}

interface ParsedCarRental extends Omit<CarRental, 'id' | 'tripId'> {
    // Partial car rental data
}

export function parseFlightText(text: string): ParsedFlight[] {
    if (text.includes('United Airlines') || text.includes('UA')) {
        return parseUnited(text);
    }
    if (text.includes('SWISS') || text.includes('LX') || text.includes('swiss.com')) {
        return parseSwiss(text);
    }
    return [];
}

export function parseTransportText(text: string): ParsedTransport[] {
    if (text.includes('FlixBus') || text.includes('flixital') || text.includes('Operated by FlixBus')) {
        return parseFlixBus(text);
    }
    return [];
}

export function parseCarRentalText(text: string): ParsedCarRental[] {
    if (text.includes('Priceline') || text.includes('priceline.com')) {
        return parsePriceline(text);
    }
    return [];
}

function parsePriceline(text: string): ParsedCarRental[] {
    const rentals: ParsedCarRental[] = [];

    // Extract Confirmation Number
    let confirmationNumber = '';
    const confirmMatch = text.match(/Confirmation Number[:\s\n]+([A-Z0-9]+)/i);
    if (confirmMatch) {
        confirmationNumber = confirmMatch[1];
    }

    // Extract Trip Number as fallback
    if (!confirmationNumber) {
        const tripMatch = text.match(/(?:Trip Number|trip number)[:\s\n]+([0-9-]+)/i);
        if (tripMatch) {
            confirmationNumber = tripMatch[1];
        }
    }

    // Extract Car Type (e.g., "Compact Car")
    const carTypeMatch = text.match(/(Compact|Economy|Mid-?size|Standard|Full-?size|SUV|Minivan|Luxury|Premium)\s*(?:Car|SUV|Van)?/i);
    const carType = carTypeMatch ? carTypeMatch[0] : 'Rental Car';

    // Extract Date Range: "Jun 30 - Jul 7 • Pick-up: 1:30PM"
    const dateRangeMatch = text.match(/([A-Za-z]{3})\s+(\d{1,2})\s*-\s*([A-Za-z]{3})\s+(\d{1,2})\s*[•·]\s*Pick-?up[:\s]*(\d{1,2}:\d{2}\s*[AP]M)/i);

    let pickupDateTime = '';
    let dropoffDateTime = '';

    if (dateRangeMatch) {
        const pickupMonth = dateRangeMatch[1];
        const pickupDay = dateRangeMatch[2];
        const dropoffMonth = dateRangeMatch[3];
        const dropoffDay = dateRangeMatch[4];
        const pickupTime = dateRangeMatch[5];

        // Find year from context (look for 2026 or similar)
        const yearMatch = text.match(/20\d{2}/);
        const year = yearMatch ? yearMatch[0] : new Date().getFullYear().toString();

        // Convert to ISO format
        const pickupDate = new Date(`${pickupMonth} ${pickupDay}, ${year}`);
        const dropoffDate = new Date(`${dropoffMonth} ${dropoffDay}, ${year}`);

        // If dropoff month is before pickup month, it's next year
        if (dropoffDate < pickupDate) {
            dropoffDate.setFullYear(dropoffDate.getFullYear() + 1);
        }

        // Parse pickup time
        const timeNorm = normalizeTime(pickupTime);

        pickupDateTime = `${pickupDate.getFullYear()}-${(pickupDate.getMonth() + 1).toString().padStart(2, '0')}-${pickupDate.getDate().toString().padStart(2, '0')}T${timeNorm}:00`;
        dropoffDateTime = `${dropoffDate.getFullYear()}-${(dropoffDate.getMonth() + 1).toString().padStart(2, '0')}-${dropoffDate.getDate().toString().padStart(2, '0')}T${timeNorm}:00`;
    }

    // Extract Total Cost
    let costAmount = 0;
    const totalMatch = text.match(/Total (?:cost|charged)[:\s\n]*\$?([\d,]+\.?\d{0,2})/i);
    if (totalMatch) {
        costAmount = parseFloat(totalMatch[1].replace(',', ''));
    }

    // For Priceline, location is usually not in the receipt - leave empty for user to fill
    rentals.push({
        company: 'Priceline - ' + carType,
        pickupLocation: '',
        dropoffLocation: '',
        pickupDateTime: pickupDateTime || new Date().toISOString(),
        dropoffDateTime: dropoffDateTime || new Date().toISOString(),
        confirmationNumber,
        costAmount,
        costCurrency: 'USD'
    });

    return rentals;
}

function parseFlixBus(text: string): ParsedTransport[] {
    const transports: ParsedTransport[] = [];

    // Extract Booking Number
    let confirmationNumber = '';
    const bookingMatch = text.match(/Booking number[:\s]*#?(\d+)/i);
    if (bookingMatch) {
        confirmationNumber = bookingMatch[1];
    }

    // Find unique route segments (avoid duplicates from multi-passenger invoices)
    // Pattern: "MM/DD/YYYY, HH:MM am/pm\n<City>\nMM/DD/YYYY, HH:MM am/pm\n<City>"
    // We look for: date+time, city, date+time, city
    const dateTimeRegex = /(\d{2}\/\d{2}\/\d{4}),?\s+(\d{1,2}:\d{2}\s*[ap]m)/gi;
    const dateTimeMatches = [...text.matchAll(dateTimeRegex)];

    // Find city names (lines that are just a city name)
    // After departure datetime comes origin city, after arrival datetime comes destination
    // FlixBus format: "06/29/2026, 10:10 am\n\nCourmayeur\n\n06/29/2026, 10:45 am\n\nChamonix"

    if (dateTimeMatches.length >= 2) {
        // Take first occurrence as departure, second as arrival
        const depDateStr = dateTimeMatches[0][1]; // "06/29/2026"
        const depTimeStr = dateTimeMatches[0][2]; // "10:10 am"
        const arrDateStr = dateTimeMatches[1][1];
        const arrTimeStr = dateTimeMatches[1][2];

        // Parse dates (US format MM/DD/YYYY)
        const depParts = depDateStr.split('/');
        const arrParts = arrDateStr.split('/');

        const depTimeNorm = normalizeTime(depTimeStr);
        const arrTimeNorm = normalizeTime(arrTimeStr);

        const departureDateTime = `${depParts[2]}-${depParts[0]}-${depParts[1]}T${depTimeNorm}:00`;
        const arrivalDateTime = `${arrParts[2]}-${arrParts[0]}-${arrParts[1]}T${arrTimeNorm}:00`;

        // Extract cities - look for lines between datetime patterns
        // Simplified: Look for city name patterns
        let origin = 'Unknown';
        let destination = 'Unknown';

        // Find text between first and second datetime
        const firstIdx = text.indexOf(dateTimeMatches[0][0]);
        const secondIdx = text.indexOf(dateTimeMatches[1][0]);
        if (firstIdx !== -1 && secondIdx !== -1) {
            const between = text.substring(firstIdx + dateTimeMatches[0][0].length, secondIdx).trim();
            const lines = between.split('\n').map(l => l.trim()).filter(l => l.length > 2 && !l.includes('$') && !l.includes('%'));
            if (lines.length > 0) origin = lines[0];
        }

        // Find text after second datetime
        const afterSecond = text.substring(secondIdx + dateTimeMatches[1][0].length, secondIdx + dateTimeMatches[1][0].length + 100).trim();
        const destLines = afterSecond.split('\n').map(l => l.trim()).filter(l => l.length > 2 && !l.includes('$') && !l.includes('%') && !l.includes('COUNTRY'));
        if (destLines.length > 0) destination = destLines[0];

        // Extract total price - sum all "Total $X.XX" entries
        const totalMatches = [...text.matchAll(/Total[\s\n]+\$?([\d,]+\.?\d*)/gi)];
        let totalCost = 0;
        totalMatches.forEach(m => {
            totalCost += parseFloat(m[1].replace(',', ''));
        });

        transports.push({
            type: 'bus',
            operator: 'FlixBus',
            serviceNumber: '',
            origin,
            destination,
            departureDateTime,
            arrivalDateTime,
            confirmationNumber,
            costAmount: totalCost,
            costCurrency: 'USD'
        });
    }

    return transports;
}

function normalizeTime(timeStr: string): string {
    // "10:10 am" -> "10:10", "2:45 pm" -> "14:45"
    const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(am|pm)/i);
    if (!match) return '12:00';

    let hour = parseInt(match[1]);
    const min = match[2];
    const ampm = match[3].toLowerCase();

    if (ampm === 'pm' && hour < 12) hour += 12;
    if (ampm === 'am' && hour === 12) hour = 0;

    return `${hour.toString().padStart(2, '0')}:${min}`;
}


export function parseAccommodationText(text: string): Partial<Accommodation>[] {
    const results: Partial<Accommodation>[] = [];

    // Booking.com Logic (detect by common keywords)
    if (text.includes('Booking.com') || text.includes('Confirmation number') || text.includes('CONFIRMATION NUMBER') || text.includes('confirmed at') || text.includes('CHECK-IN') || text.includes('Check-in')) {
        const item: Partial<Accommodation> = { costCurrency: 'USD' }; // Default

        // 1. Property Name
        // Match "Your booking at [Name]", "confirmed at [Name]", or look for "Apartment" headers
        const nameMatch = text.match(/(?:Your booking at|confirmed booking at|confirmed at)\s+([^\.]+?)(?:\.|\n|http|1 message)/i);
        if (nameMatch) {
            item.propertyName = nameMatch[1].trim();
        } else {
            // Fallback: Use new logic - Name is often before "Address:"
            const addressIdx = text.search(/Address:/i);
            if (addressIdx !== -1 && addressIdx < 500) {
                // Take text before address
                const rawName = text.substring(0, addressIdx).replace(/--- Page \d+ ---/g, '').trim();
                const lines = rawName.split('\n').map(l => l.trim()).filter(l => l.length > 2);
                if (lines.length > 0) {
                    // The name is likely the last non-empty line before Address, or the first line?
                    // In Hostellerie: Line 1 = Name, Line 2 = Address header.
                    // So we take the last significant line.
                    item.propertyName = lines[lines.length - 1];
                }
            } else {
                const typeMatch = text.match(/(?:Apartment|Hotel|Resort|Villa|Chalet)\s+[^\n]+/i);
                if (typeMatch) item.propertyName = typeMatch[0].trim();
                else item.propertyName = "Imported Stay";
            }
        }

        // Heuristic: If name has commas, it might contain the address
        if (item.propertyName && item.propertyName.includes(',') && !item.address) {
            const parts = item.propertyName.split(',');
            item.propertyName = parts[0].trim(); // "Apartment Chinook"
            item.address = parts.slice(1).join(',').trim(); // "La Praz, Chamonix Mont Blanc"
        }

        // 2. Address
        // Look for "Address:\n74 Avenue..."
        const addressMatch = text.match(/Address:[\s\n]*([^\n]+)/i);
        if (addressMatch) {
            let addr = addressMatch[1].trim();
            // Check if next line continues the address (Booking.com often breaks valid address lines)
            // e.g. "73700 Bourg-Saint-\nMaurice"
            const addrIdx = text.indexOf(addr);
            if (addrIdx !== -1) {
                const nextUnix = text.indexOf('\n', addrIdx + addr.length);
                if (nextUnix !== -1) {
                    const nextLine = text.substring(nextUnix + 1, text.indexOf('\n', nextUnix + 1)).trim();
                    if (nextLine && !nextLine.includes('Phone:') && nextLine.length < 50) {
                        addr += ' ' + nextLine;
                    }
                }
            }
            item.address = addr;
        }

        // 3. Dates - Robust Scan (Look ahead up to 300 chars)
        // Format: "Check-in ... Mon, Oct 29 2025" or "Wed, Oct 29, 2025"
        // Regex components:
        //  - Day Name (Optional): (?:Mon|Tue|...)\b,?\s*
        //  - Month: (?:Jan|Feb|...)
        //  - Day Num: \d{1,2}
        //  - Year (Optional/Required?): \d{4}
        const dateRegex = /((?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)\w*,?\s*)?(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2}(?:st|nd|rd|th)?,?\s+\d{4}/i;

        // Find Check-in match
        // Find Check-in match (Iterate all occurrences to find the one with a date)
        const checkInMatches = [...text.matchAll(/Check\s*-?\s*in/gi)];
        for (const match of checkInMatches) {
            if (item.checkInDateTime) break; // Stop if already found

            const idx = match.index!;
            const context = text.substring(idx, idx + 300);

            // Try standard line scan (re-add 'i' flag to regex for safety)
            let dateMatch = context.match(new RegExp(dateRegex, 'i'));

            // Try Vertical Scan: CHECK-IN ... 26 ... JUNE
            if (!dateMatch) {
                // Format: CHECK-IN\n26\nJUNE
                const verticalMatch = context.match(/CHECK-IN[\s\S]{0,50}?(\d{1,2})[\s\S]{0,20}?([A-Za-z]{3,})/i);
                if (verticalMatch) {
                    const day = verticalMatch[1];
                    const month = verticalMatch[2];
                    // Find year in doc (scan whole doc for 202x)
                    const yearMatch = text.match(/20\d{2}/);
                    const year = yearMatch ? yearMatch[0] : new Date().getFullYear();
                    dateMatch = [`${month} ${day}, ${year}`];
                }
            }

            if (dateMatch) {
                item.checkInDateTime = parseDateText(dateMatch[0]) + 'T15:00:00';
            }
        }

        // Find Check-out match
        const checkOutMatches = [...text.matchAll(/Check\s*-?\s*out/gi)];
        for (const match of checkOutMatches) {
            if (item.checkOutDateTime) break;

            const idx = match.index!;
            const context = text.substring(idx, idx + 300);

            let dateMatch = context.match(new RegExp(dateRegex, 'i'));

            // Vertical Scan for Check-out
            if (!dateMatch) {
                const verticalMatch = context.match(/CHECK-OUT[\s\S]{0,50}?(\d{1,2})[\s\S]{0,20}?([A-Za-z]{3,})/i);
                if (verticalMatch) {
                    const day = verticalMatch[1];
                    const month = verticalMatch[2];
                    const yearMatch = text.match(/20\d{2}/);
                    const year = yearMatch ? yearMatch[0] : new Date().getFullYear();
                    dateMatch = [`${month} ${day}, ${year}`];
                }
            }

            if (dateMatch) {
                item.checkOutDateTime = parseDateText(dateMatch[0]) + 'T11:00:00';
            }
        }

        // Fallback: If no dates found contextually, look for ANY future dates
        if (!item.checkInDateTime) {
            const allDates = [...text.matchAll(new RegExp(dateRegex, 'ig'))].map(m => m[0]);
            if (allDates.length >= 2) {
                // Heuristic: Take first two dates found.
                // Sort by date? Or just trust file order?
                // File order in email usually: Header Date, then Check-in, then Check-out.
                // But Header Date is usually "Wed, Oct 29".
                // If we found "Wed, Oct 29, 2025".
                // Let's blindly pick 1st as Check-in, 2nd as Check-out if nothing else found.
                // It's better than nothing.
                item.checkInDateTime = parseDateText(allDates[0]) + 'T15:00:00';
                item.checkOutDateTime = parseDateText(allDates[1]) + 'T11:00:00';
            } else if (allDates.length === 1) {
                // Formatting: "Wed, Oct 29, 2025"
                // Assuming this is Check-in.
                item.checkInDateTime = parseDateText(allDates[0]) + 'T15:00:00';

                // Set Check-out to +1 day?
                const d = new Date(item.checkInDateTime);
                d.setDate(d.getDate() + 1);
                item.checkOutDateTime = d.toISOString().split('T')[0] + 'T11:00:00';
            }
        }

        // 4. Confirmation
        const confirmMatch = text.match(/(?:Confirmation number|Booking reference|Confirmation)[:\s\n]+([\d\.]+)/i);
        if (confirmMatch) {
            item.confirmationNumber = confirmMatch[1].replace(/\./g, '');
        }

        // 5. Price
        // Try precise "Final Price" scan first - handle structure like:
        // "Final Price\n(taxes included)\n\napprox.\n\n$302"
        const maxPriceMatch = text.match(/(?:Final Price|Total Price|Total Amount)[\s\S]{0,200}?(?:approx\.[\s\S]{0,30}?)?\$\s*([\d,]+\.?\d{0,2})/i);
        if (maxPriceMatch) {
            item.costAmount = parseFloat(maxPriceMatch[1].replace(',', ''));
        } else {
            // Fallback to generic scan
            const priceMatch = text.match(/(?:Total price|Price|Total)[\s\S]{0,100}(?:US)?\$?\s*([\d,]+\.?\d{0,2})/i);
            if (priceMatch) {
                item.costAmount = parseFloat(priceMatch[1].replace(',', ''));
            }
        }

        // Return if we have at least a Name or Confirmation
        if (item.propertyName || item.confirmationNumber || item.checkInDateTime) {
            results.push(item);
        }
    }

    return results;
}

function parseDateText(dateStr: string): string {
    // Convert "Mon 20 Jul 2026" to "2026-07-20"
    try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return new Date().toISOString().split('T')[0];

        const year = d.getFullYear();
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        const day = d.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    } catch {
        return new Date().toISOString().split('T')[0];
    }
}

function parseSwiss(text: string): ParsedFlight[] {
    const flights: ParsedFlight[] = [];

    // Extract Booking Code
    let confirmationNumber = '';
    const bookingCodeMatch = text.match(/Booking code[:\s]*([A-Z0-9]{6})/i);
    if (bookingCodeMatch) {
        confirmationNumber = bookingCodeMatch[1];
    }

    // Extract Price (prefer USD)
    let costAmount = 0;
    const usdPriceMatch = text.match(/(?:Converted final price|USD)[\s]*USD?\s*([\d,]+\.\d{2})/i);
    if (usdPriceMatch) {
        costAmount = parseFloat(usdPriceMatch[1].replace(',', ''));
    } else {
        const chfPriceMatch = text.match(/Final price[\s]*CHF\s*([\d,]+\.\d{2})/i);
        if (chfPriceMatch) {
            costAmount = parseFloat(chfPriceMatch[1].replace(',', ''));
        }
    }

    // Extract Flight Segments
    // Format: "LX2092" or "LX 2092"
    const flightMatches = [...text.matchAll(/LX\s*(\d{3,4})/gi)];

    // Extract Itinerary details
    // Format: "30.06.2026 - 12:05" (European date)
    // Looking for patterns like "GVA LIS Geneva Lisbon"
    const routeMatch = text.match(/([A-Z]{3})\s+([A-Z]{3})\s+([A-Za-z\s]+?)\s+([A-Za-z\s]+?)\s+(?:Manage booking|Duration)/i);

    // Date/Time extraction - European format DD.MM.YYYY
    const dateTimeMatches = [...text.matchAll(/(\d{2})\.(\d{2})\.(\d{4})\s*-?\s*(\d{2}:\d{2})/g)];

    if (flightMatches.length > 0 && dateTimeMatches.length >= 2) {
        const flightNumber = 'LX' + flightMatches[0][1];

        // Parse departure
        const depMatch = dateTimeMatches[0];
        const depDay = depMatch[1];
        const depMonth = depMatch[2];
        const depYear = depMatch[3];
        const depTime = depMatch[4];
        const departureDateTime = `${depYear}-${depMonth}-${depDay}T${depTime}:00`;

        // Parse arrival (second date/time occurrence)
        const arrMatch = dateTimeMatches[1];
        const arrDay = arrMatch[1];
        const arrMonth = arrMatch[2];
        const arrYear = arrMatch[3];
        const arrTime = arrMatch[4];
        const arrivalDateTime = `${arrYear}-${arrMonth}-${arrDay}T${arrTime}:00`;

        // Extract airports from route match or look for patterns
        let origin = 'GVA';
        let destination = 'LIS';

        if (routeMatch) {
            origin = routeMatch[1];
            destination = routeMatch[2];
        } else {
            // Fallback: Look for airport codes near city names
            const originMatch = text.match(/([A-Z]{3})\s*Geneva/i);
            const destMatch = text.match(/([A-Z]{3})\s*Lisbon/i);
            if (originMatch) origin = originMatch[1];
            if (destMatch) destination = destMatch[1];
        }

        flights.push({
            airline: 'SWISS',
            flightNumber,
            origin,
            destination,
            departureDateTime,
            arrivalDateTime,
            confirmationNumber,
            costAmount,
            costCurrency: 'USD'
        });
    } else if (flightMatches.length > 0) {
        // Fallback: At least create a flight with what we have
        const flightNumber = 'LX' + flightMatches[0][1];

        // Try simpler date extraction
        const simpleDateMatch = text.match(/(\d{2})\.(\d{2})\.(\d{4})/);
        let departureDateTime = new Date().toISOString();

        if (simpleDateMatch) {
            const day = simpleDateMatch[1];
            const month = simpleDateMatch[2];
            const year = simpleDateMatch[3];
            departureDateTime = `${year}-${month}-${day}T12:00:00`;
        }

        flights.push({
            airline: 'SWISS',
            flightNumber,
            origin: 'GVA',
            destination: 'LIS',
            departureDateTime,
            arrivalDateTime: departureDateTime,
            confirmationNumber,
            costAmount,
            costCurrency: 'USD'
        });
    }

    return flights;
}

function parseUnited(text: string): ParsedFlight[] {
    const flights: ParsedFlight[] = [];
    const lines = text.split('\n').map(l => l.trim()).filter(l => l);

    // Extract Confirmation Number
    let confirmationNumber = '';
    const confirmMatch = text.match(/Confirmation Number:\s*([A-Z0-9]{6})/i);
    if (confirmMatch) {
        confirmationNumber = confirmMatch[1];
    } else {
        // Try looking for standalone line after "Confirmation Number:"
        const confirmIndex = lines.findIndex(l => l.includes('Confirmation Number:'));
        if (confirmIndex !== -1 && lines[confirmIndex + 1]) {
            // Check if next line looks like a confirmation code (6 chars)
            if (/^[A-Z0-9]{6}$/.test(lines[confirmIndex + 1])) {
                confirmationNumber = lines[confirmIndex + 1];
            }
        }
    }

    // Iterate through lines to find flight segments
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Match "Flight X of Y UAxxxx"
        const flightMatch = line.match(/Flight \d+ of \d+\s+(UA\d+)/);
        if (flightMatch) {
            const flightNumber = flightMatch[1];
            const airline = 'United Airlines';

            // Assume next lines follow structure:
            // 1. Dates: "Sat, Jun 20, 2026 Sat, Jun 20, 2026"
            // 2. Times: "07:45 AM 01:33 PM"
            // 3. Airports: "Denver, CO, US (DEN) Newark, NJ/New York, NY, US (EWR)"

            let dateLine = lines[i + 1] || '';
            let timeLine = lines[i + 2] || '';
            let airportLine = lines[i + 3] || '';

            // Sometimes there's extra info like Class which is on the SAME line as Flight num in the text provided
            // "Flight 1 of 4 UA2640 Class: United Economy (YN)" -> Handled by regex above

            // Validation of subsequent lines
            // Date line should contain dates
            if (!dateLine.includes(',')) {
                // Try skipping a line if there's garbage?
                // But generally text copy-paste is consistent
            }

            const dates = dateLine.match(/([A-Z][a-z]{2}, [A-Z][a-z]{2} \d{1,2}, \d{4})/g);
            const times = timeLine.match(/(\d{2}:\d{2} [AP]M)/g);
            const airportCodes = airportLine.match(/\(([A-Z]{3})\)/g);

            if (dates && times && airportCodes && dates.length >= 2 && times.length >= 2 && airportCodes.length >= 2) {
                const originDateStr = dates[0];
                const destDateStr = dates[1];
                const originTimeStr = times[0];
                const destTimeStr = times[1];

                // Extract codes like (DEN) -> DEN
                const originCode = airportCodes[0].replace(/[()]/g, '');
                const destCode = airportCodes[1].replace(/[()]/g, '');

                // Construct ISO strings
                const departureDateTime = parseDateTime(originDateStr, originTimeStr);
                const arrivalDateTime = parseDateTime(destDateStr, destTimeStr);

                flights.push({
                    airline,
                    flightNumber,
                    origin: originCode,
                    destination: destCode,
                    departureDateTime,
                    arrivalDateTime,
                    confirmationNumber,
                    costAmount: 0,
                    costCurrency: 'USD'
                });
            }
        }
    }

    // Cost Parsing
    try {
        let totalUSD = 0;

        // Match "Total: ... USD" lines
        // Examples: 
        // "Total: 280,000 miles + 151.26 USD"
        // "Total: 169.99 USD"
        const totalMatches = text.match(/Total:\s*(?:.*?[\+\s])?([\d,]+\.\d{2})\s*USD/gi);

        if (totalMatches) {
            totalMatches.forEach(match => {
                const priceMatch = match.match(/([\d,]+\.\d{2})\s*USD/i);
                if (priceMatch) {
                    const val = parseFloat(priceMatch[1].replace(/,/g, ''));
                    totalUSD += val;
                }
            });
        }

        // Also check if text has "Airfare: ... USD" if Total isn't found, but Total is safer for Receipt.

        // Distribute total cost average across flights
        if (flights.length > 0 && totalUSD > 0) {
            const avgCost = parseFloat((totalUSD / flights.length).toFixed(2));
            flights.forEach((f, index) => {
                // Handle rounding diff on last item
                if (index === flights.length - 1) {
                    f.costAmount = parseFloat((totalUSD - (avgCost * (flights.length - 1))).toFixed(2));
                } else {
                    f.costAmount = avgCost;
                }
            });
        }
    } catch (e) {
        console.error('Error parsing costs', e);
    }

    return flights;
}

function parseDateTime(dateStr: string, timeStr: string): string {
    // dateStr: "Sat, Jun 20, 2026"
    // timeStr: "07:45 AM"
    try {
        const d = new Date(`${dateStr} ${timeStr}`);
        // Adjust for timezone? We don't know timezone, so keep local as if it's ISO without Z for now?
        // App expects ISO string.
        // If we treat it as local, `d.toISOString()` will convert to UTC based on browser time.
        // We want to preserve the "Wall Time" usually.
        // But `dataService` likely just stores string.
        // Ideally we store "YYYY-MM-DDTHH:mm:00".

        const year = d.getFullYear();
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        const day = d.getDate().toString().padStart(2, '0');
        const hours = d.getHours().toString().padStart(2, '0');
        const minutes = d.getMinutes().toString().padStart(2, '0');

        return `${year}-${month}-${day}T${hours}:${minutes}:00`;
    } catch (e) {
        console.error('Date parse error', e);
        return new Date().toISOString();
    }
}
