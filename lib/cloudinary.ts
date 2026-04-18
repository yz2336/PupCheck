import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function uploadImage(
  dataUrl: string,
  folder = "pupcheck"
): Promise<string> {
  const result = await cloudinary.uploader.upload(dataUrl, {
    folder,
    resource_type: "image",
    transformation: [{ width: 1600, height: 1600, crop: "limit" }],
  });
  return result.secure_url;
}

export default cloudinary;
