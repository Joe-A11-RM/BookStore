const ConvertToSec = (stringdate) => {
    const date = new Date(stringdate)
    const seconds = date.getTime() / 1000
    return seconds
}
module.exports = ConvertToSec