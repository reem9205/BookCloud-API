// Importing moment for potential future date manipulation, if required
const moment = require("moment");

// Image class representing an image entity in the system
class Image {
    /**
     * Constructor to initialize an Image object.
     * @param {number} image_Id - Unique ID of the image
     * @param {Buffer|string} image_front - Binary or encoded data for the front image
     * @param {Buffer|string} image_side - Binary or encoded data for the side image
     */
    constructor(image_Id, image_front, image_side) {
        this.image_Id = image_Id;
        this.image_front = image_front;
        this.image_side = image_side;
    }

    /**
     * Static method to create an Image instance from a database row.
     * @param {object} row - The database row containing Image data
     * @returns {Image} - New Image instance
     */
    static fromRow(row) {
        return new Image(
            row.image_Id,        // Unique ID of the image from the database
            row.image_front,     // Binary or encoded data for the front image
            row.image_side       // Binary or encoded data for the side image
        );
    }
}

// Exporting the Image class for use in other modules
module.exports = Image;
