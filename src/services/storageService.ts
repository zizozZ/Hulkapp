/**
 * HULK - 100% Free Image & File Storage via Cloudinary (25GB Free, No Credit Card)
 */
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '';
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '';

export const isCloudinaryConfigured = Boolean(
  CLOUD_NAME &&
    UPLOAD_PRESET &&
    !CLOUD_NAME.includes('your_cloudinary')
);

const uploadToCloudinary = async (file: File, folder: string): Promise<string> => {
  if (!isCloudinaryConfigured) {
    throw new Error(
      'خدمة تخزين الصور المجانية (Cloudinary) غير مفعلة بعد. أضف VITE_CLOUDINARY_CLOUD_NAME و VITE_CLOUDINARY_UPLOAD_PRESET في ملف .env'
    );
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('folder', `hulk_fitness/${folder}`);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`, {
    method: 'POST',
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || 'فشل رفع الملف إلى Cloudinary.');
  }
  return data.secure_url as string;
};

export const uploadUserAvatar = async (userId: string, file: File): Promise<string> => {
  return uploadToCloudinary(file, `avatars/${userId}`);
};

export const uploadPrivateProgressPhoto = async (
  trainerId: string,
  traineeId: string,
  angle: 'front' | 'side' | 'back',
  file: File
): Promise<string> => {
  return uploadToCloudinary(file, `progressPhotos/${trainerId}/${traineeId}/${angle}`);
};

export const uploadChatAttachment = async (
  trainerId: string,
  traineeId: string,
  file: File
): Promise<{ url: string; type: 'image' | 'file'; name: string }> => {
  const url = await uploadToCloudinary(file, `chat/${trainerId}/${traineeId}`);
  const type = file.type.startsWith('image/') ? 'image' : 'file';
  return { url, type, name: file.name };
};

export const uploadExerciseMedia = async (file: File): Promise<string> => {
  return uploadToCloudinary(file, 'exercises');
};
