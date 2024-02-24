const cloudinary = require("cloudinary");
const stream = require("stream");

async function handleUpload(buffer, folder) {
  return new Promise((resolve, reject) => {
    const readableStream = new stream.Readable();
    readableStream.push(buffer);
    readableStream.push(null);

    const uploadStream = cloudinary.v2.uploader.upload_stream(
      { resource_type: "auto", folder: folder },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result.secure_url);
        }
      }
    );

    readableStream.pipe(uploadStream);
  });
}


async function uploadSingleImage(buffer, folder) {
  return new Promise((resolve, reject) => {
    const readableStream = new stream.Readable();
    readableStream.push(buffer);
    readableStream.push(null);

    const uploadStream = cloudinary.v2.uploader.upload_stream(
      { resource_type: "auto", folder: folder },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result.secure_url);
        }
      }
    );

    readableStream.pipe(uploadStream);
  });
}

module.exports = {
  handleUpload,
  uploadSingleImage, 
};
