const TWENTY_FOUR_HOUR_TIME_REGEX = /^([0-1][0-9]|2[0-3])[0-5][0-9]$/;
const TWELVE_HOUR_TIME_REGEX = /^((0?[1-9]|1[0-2]):[0-5][0-9](am|pm))$/;

const getDepartureSanitized = (departureParam: string) : number | null => {
  let departure: number | null = null;

  if (TWENTY_FOUR_HOUR_TIME_REGEX.test(departureParam)) {
    // If the departure time matches the 24-hour format, parse it as an integer
    departure = parseInt(departureParam, 10);
  } else if (TWELVE_HOUR_TIME_REGEX.test(departureParam)) {
    // If the departure time matches the 12-hour format, convert it to 24-hour format
    const [time, meridiem] = departureParam.split(/(?=[ap]m)/i);
    const [hours, minutes] = time.split(':');
    let militaryHours = parseInt(hours, 10);
    if (meridiem.toLowerCase() === 'pm' && militaryHours !== 12) {
      militaryHours += 12;
    } else if (meridiem.toLowerCase() === 'am' && militaryHours === 12) {
      militaryHours = 0;
    }
    departure = militaryHours * 100 + parseInt(minutes, 10);
  }
  return departure;
};

export { getDepartureSanitized };