import { useEffect, useState, useRef } from 'react';
import { FaCloudArrowUp, FaTrash } from 'react-icons/fa6';
import { facilityService } from '@/services/facilityService';
import { parseApiError } from '@/services/api';
import { useToast } from '@/context/ToastContext';
import { Spinner } from '@/components/ui/Loading';

const MAX_SIZE_MB = 5;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const Uploader = ({ label, type, onUploaded }) => {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const toast = useToast();

  const handleFile = async (file) => {
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error('Please upload a JPEG, PNG, or WEBP image.');
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`Image must be smaller than ${MAX_SIZE_MB}MB.`);
      return;
    }
    setUploading(true);
    try {
      const base64 = await fileToBase64(file);
      const res = await facilityService.uploadImage({ imageBase64: base64, type });
      onUploaded(res.data);
      toast.success('Photo uploaded.');
    } catch (err) {
      toast.error(parseApiError(err).message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      disabled={uploading}
      className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[var(--color-line)] py-8 text-sm font-medium text-[var(--color-ink-soft)] hover:border-[var(--color-teal-600)] hover:text-[var(--color-teal-700)]"
    >
      {uploading ? <Spinner size={18} /> : <FaCloudArrowUp size={20} />}
      {uploading ? 'Uploading…' : label}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </button>
  );
};

export const PhotosPage = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    facilityService.myListing().then((res) => setImages(res.data.images || [])).finally(() => setLoading(false));
  }, []);

  const remove = async (publicId) => {
    try {
      const res = await facilityService.deleteImage(publicId);
      setImages(res.data);
      toast.success('Photo removed.');
    } catch (err) {
      toast.error(parseApiError(err).message);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-[var(--color-teal-600)]">
        <Spinner size={24} />
      </div>
    );
  }

  const logo = images.find((i) => i.type === 'logo');
  const cover = images.find((i) => i.type === 'cover');
  const gallery = images.filter((i) => i.type === 'gallery');

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="mb-1 text-2xl font-semibold text-[var(--color-ink)]">Photos</h1>
        <p className="text-sm text-[var(--color-ink-soft)]">JPEG, PNG, or WEBP — max {MAX_SIZE_MB}MB per image.</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <h3 className="mb-2 text-sm font-semibold text-[var(--color-ink)]">Logo</h3>
          {logo ? (
            <div className="group relative h-40 overflow-hidden rounded-xl border border-[var(--color-line)]">
              <img src={logo.url} alt="Logo" className="h-full w-full object-cover" />
              <button onClick={() => remove(logo.publicId)} className="absolute right-2 top-2 rounded-full bg-white/90 p-2 text-[var(--color-red-600)] opacity-0 group-hover:opacity-100">
                <FaTrash size={13} />
              </button>
            </div>
          ) : (
            <Uploader label="Upload logo" type="logo" onUploaded={setImages} />
          )}
        </div>
        <div>
          <h3 className="mb-2 text-sm font-semibold text-[var(--color-ink)]">Cover Image</h3>
          {cover ? (
            <div className="group relative h-40 overflow-hidden rounded-xl border border-[var(--color-line)]">
              <img src={cover.url} alt="Cover" className="h-full w-full object-cover" />
              <button onClick={() => remove(cover.publicId)} className="absolute right-2 top-2 rounded-full bg-white/90 p-2 text-[var(--color-red-600)] opacity-0 group-hover:opacity-100">
                <FaTrash size={13} />
              </button>
            </div>
          ) : (
            <Uploader label="Upload cover image" type="cover" onUploaded={setImages} />
          )}
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-[var(--color-ink)]">Facility Photos</h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {gallery.map((img) => (
            <div key={img.publicId} className="group relative h-32 overflow-hidden rounded-xl border border-[var(--color-line)]">
              <img src={img.url} alt="" className="h-full w-full object-cover" />
              <button onClick={() => remove(img.publicId)} className="absolute right-1.5 top-1.5 rounded-full bg-white/90 p-1.5 text-[var(--color-red-600)] opacity-0 group-hover:opacity-100">
                <FaTrash size={12} />
              </button>
            </div>
          ))}
          <Uploader label="Add photo" type="gallery" onUploaded={setImages} />
        </div>
      </div>
    </div>
  );
};
