import { useState, useEffect, useMemo, type FormEvent } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { Save, ArrowLeft, AlertCircle } from 'lucide-react';
import {
  useAdminVehicle,
  useCreateVehicle,
  useUpdateVehicle,
  useUploadVehicleImage,
} from '../../hooks/useAdminVehicles';
import ImageUpload from '../../components/admin/ImageUpload';

// ---------------------------------------------------------------
// VehicleFormPage — add or edit a vehicle.
// Dual purpose: create new (no :id) or edit existing (:id in URL).
// ---------------------------------------------------------------

const EXPERIENCE_TAGS = [
  'Boss Move',
  'Wedding Day',
  'Statement',
  'Content Ready',
  'Date Night',
  'Weekend Takeover',
];

interface FormState {
  name: string;
  slug: string;
  headline: string;
  description: string;
  daily_price_dollars: string; // string for controlled input; convert to cents on save
  experience_tags: string[];
  images: string[];
  is_active: boolean;
}

const INITIAL_FORM: FormState = {
  name: '',
  slug: '',
  headline: '',
  description: '',
  daily_price_dollars: '',
  experience_tags: [],
  images: [],
  is_active: true,
};

interface FormErrors {
  name?: string;
  slug?: string;
  daily_price_dollars?: string;
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export default function VehicleFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;

  const { data: existingVehicle, isLoading: loadingVehicle } = useAdminVehicle(
    id ?? '',
  );
  const createVehicle = useCreateVehicle();
  const updateVehicle = useUpdateVehicle();
  const uploadImage = useUploadVehicleImage();

  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Pre-fill form when editing
  useEffect(() => {
    if (isEditing && existingVehicle) {
      setForm({
        name: existingVehicle.name,
        slug: existingVehicle.slug,
        headline: existingVehicle.headline,
        description: existingVehicle.description,
        daily_price_dollars: (existingVehicle.daily_price_cents / 100).toString(),
        experience_tags: [...existingVehicle.experience_tags],
        images: [...existingVehicle.images],
        is_active: existingVehicle.is_active,
      });
      setSlugManuallyEdited(true); // Don't auto-generate slug for existing vehicles
    }
  }, [isEditing, existingVehicle]);

  // Auto-generate slug from name
  const handleNameChange = (name: string) => {
    setForm((prev) => ({
      ...prev,
      name,
      slug: slugManuallyEdited ? prev.slug : generateSlug(name),
    }));
  };

  const handleSlugChange = (slug: string) => {
    setSlugManuallyEdited(true);
    setForm((prev) => ({ ...prev, slug: generateSlug(slug) }));
  };

  const handleTagToggle = (tag: string) => {
    setForm((prev) => ({
      ...prev,
      experience_tags: prev.experience_tags.includes(tag)
        ? prev.experience_tags.filter((t) => t !== tag)
        : [...prev.experience_tags, tag],
    }));
  };

  // Validation
  const validate = (): FormErrors => {
    const errs: FormErrors = {};
    if (!form.name.trim()) errs.name = 'Name is required.';
    if (!form.slug.trim()) errs.slug = 'Slug is required.';
    if (!form.daily_price_dollars.trim()) {
      errs.daily_price_dollars = 'Price is required.';
    } else {
      const price = parseFloat(form.daily_price_dollars);
      if (isNaN(price) || price <= 0) {
        errs.daily_price_dollars = 'Price must be a positive number.';
      }
    }
    return errs;
  };

  // Handle image upload
  const handleImageUpload = async (file: File): Promise<string> => {
    const result = await uploadImage.mutateAsync({
      file,
      vehicleId: id ?? 'new',
    });
    return result.url;
  };

  // Submit
  const isSubmitting = createVehicle.isPending || updateVehicle.isPending;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    const formErrors = validate();
    setErrors(formErrors);
    if (Object.keys(formErrors).length > 0) return;

    const priceCents = Math.round(parseFloat(form.daily_price_dollars) * 100);

    const vehicleData = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      headline: form.headline.trim(),
      description: form.description.trim(),
      daily_price_cents: priceCents,
      experience_tags: form.experience_tags,
      images: form.images,
      is_active: form.is_active,
      rental_count: 0,
    };

    try {
      if (isEditing && id) {
        const { rental_count: _, ...updates } = vehicleData;
        await updateVehicle.mutateAsync({ id, updates });
      } else {
        await createVehicle.mutateAsync(vehicleData);
      }
      navigate('/admin/vehicles');
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'Failed to save vehicle.',
      );
    }
  };

  // Title
  const pageTitle = isEditing ? 'Edit Vehicle' : 'Add Vehicle';
  const pageSubtitle = isEditing
    ? `Editing ${existingVehicle?.name ?? '...'}`
    : 'Add a new vehicle to your fleet';

  // Loading state for edit mode
  const isFormReady = useMemo(
    () => !isEditing || (!loadingVehicle && existingVehicle !== undefined),
    [isEditing, loadingVehicle, existingVehicle],
  );

  if (isEditing && loadingVehicle) {
    return (
      <div className="max-w-3xl space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-white/5 rounded w-1/3" />
          <div className="h-4 bg-white/5 rounded w-1/4" />
          <div className="h-12 bg-white/5 rounded" />
          <div className="h-12 bg-white/5 rounded" />
          <div className="h-32 bg-white/5 rounded" />
        </div>
      </div>
    );
  }

  if (isEditing && !loadingVehicle && !existingVehicle) {
    return (
      <div className="max-w-3xl space-y-6">
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-red-300 text-sm font-medium">Vehicle not found</p>
            <p className="text-red-300/60 text-sm mt-1">
              The vehicle you are trying to edit does not exist.
            </p>
          </div>
        </div>
        <Link
          to="/admin/vehicles"
          className="inline-flex items-center gap-2 text-white/50 hover:text-white text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to vehicles
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div>
        <Link
          to="/admin/vehicles"
          className="inline-flex items-center gap-1.5 text-white/40 hover:text-white text-sm transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to vehicles
        </Link>
        <h1 className="museo-headline text-white text-2xl lg:text-3xl">
          {pageTitle}
        </h1>
        <p className="museo-body text-white/40 mt-1 text-sm">{pageSubtitle}</p>
      </div>

      {/* Submit error */}
      {submitError && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
          <p className="text-red-300 text-sm">{submitError}</p>
        </div>
      )}

      {/* Form */}
      {isFormReady && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name + Slug */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="name"
                className="museo-label text-white/50 block mb-2"
              >
                Name <span className="text-red-400">*</span>
              </label>
              <input
                id="name"
                type="text"
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Rolls-Royce Ghost"
                className={`w-full bg-white/5 border rounded-lg px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:ring-1 transition-colors ${
                  errors.name
                    ? 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20'
                    : 'border-white/10 focus:border-[#D4AF37]/50 focus:ring-[#D4AF37]/20'
                }`}
              />
              {errors.name && (
                <p className="text-red-400 text-xs mt-1">{errors.name}</p>
              )}
            </div>
            <div>
              <label
                htmlFor="slug"
                className="museo-label text-white/50 block mb-2"
              >
                Slug <span className="text-red-400">*</span>
              </label>
              <input
                id="slug"
                type="text"
                value={form.slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="rolls-royce-ghost"
                className={`w-full bg-white/5 border rounded-lg px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:ring-1 transition-colors ${
                  errors.slug
                    ? 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20'
                    : 'border-white/10 focus:border-[#D4AF37]/50 focus:ring-[#D4AF37]/20'
                }`}
              />
              {errors.slug && (
                <p className="text-red-400 text-xs mt-1">{errors.slug}</p>
              )}
              {!slugManuallyEdited && form.name && (
                <p className="text-white/20 text-xs mt-1">
                  Auto-generated from name
                </p>
              )}
            </div>
          </div>

          {/* Headline */}
          <div>
            <label
              htmlFor="headline"
              className="museo-label text-white/50 block mb-2"
            >
              Headline
            </label>
            <input
              id="headline"
              type="text"
              value={form.headline}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, headline: e.target.value }))
              }
              placeholder="Move in Silence. Let the Car Do the Talking."
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/20 transition-colors"
            />
            <p className="text-white/20 text-xs mt-1">
              Identity tagline displayed on fleet cards
            </p>
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="museo-label text-white/50 block mb-2"
            >
              Description
            </label>
            <textarea
              id="description"
              value={form.description}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, description: e.target.value }))
              }
              placeholder="Describe the vehicle experience, features, and what makes it special..."
              rows={5}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/20 transition-colors resize-y"
            />
          </div>

          {/* Daily Price */}
          <div className="max-w-xs">
            <label
              htmlFor="price"
              className="museo-label text-white/50 block mb-2"
            >
              Daily Price (USD) <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">
                $
              </span>
              <input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={form.daily_price_dollars}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    daily_price_dollars: e.target.value,
                  }))
                }
                placeholder="1200.00"
                className={`w-full bg-white/5 border rounded-lg pl-8 pr-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:ring-1 transition-colors ${
                  errors.daily_price_dollars
                    ? 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20'
                    : 'border-white/10 focus:border-[#D4AF37]/50 focus:ring-[#D4AF37]/20'
                }`}
              />
            </div>
            {errors.daily_price_dollars && (
              <p className="text-red-400 text-xs mt-1">
                {errors.daily_price_dollars}
              </p>
            )}
            <p className="text-white/20 text-xs mt-1">
              Stored as cents ({form.daily_price_dollars
                ? `${Math.round(parseFloat(form.daily_price_dollars || '0') * 100)} cents`
                : '0 cents'})
            </p>
          </div>

          {/* Experience Tags */}
          <div>
            <span className="museo-label text-white/50 block mb-3">
              Experience Tags
            </span>
            <div className="flex flex-wrap gap-2">
              {EXPERIENCE_TAGS.map((tag) => {
                const selected = form.experience_tags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleTagToggle(tag)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selected
                        ? 'bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30'
                        : 'bg-white/5 text-white/40 border border-white/10 hover:text-white/60 hover:border-white/20'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Images */}
          <div>
            <span className="museo-label text-white/50 block mb-3">
              Images
            </span>
            <ImageUpload
              images={form.images}
              onImagesChange={(images) =>
                setForm((prev) => ({ ...prev, images }))
              }
              onUpload={handleImageUpload}
            />
          </div>

          {/* Is Active toggle */}
          <div className="flex items-center justify-between bg-white/[0.03] border border-white/5 rounded-xl px-5 py-4">
            <div>
              <span className="text-white text-sm font-medium block">
                Active
              </span>
              <span className="text-white/30 text-xs">
                Inactive vehicles are hidden from the public fleet page
              </span>
            </div>
            <button
              type="button"
              onClick={() =>
                setForm((prev) => ({ ...prev, is_active: !prev.is_active }))
              }
              className={`relative w-12 h-6 rounded-full transition-colors ${
                form.is_active ? 'bg-[#D4AF37]' : 'bg-white/10'
              }`}
              role="switch"
              aria-checked={form.is_active}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  form.is_active ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4 border-t border-white/5">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 bg-[#D4AF37] hover:bg-[#C4A030] disabled:opacity-50 disabled:cursor-not-allowed text-[#050505] font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#050505]/30 border-t-[#050505] rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {isEditing ? 'Save Changes' : 'Create Vehicle'}
                </>
              )}
            </button>
            <Link
              to="/admin/vehicles"
              className="inline-flex items-center gap-2 text-white/40 hover:text-white px-4 py-3 transition-colors text-sm"
            >
              Cancel
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
