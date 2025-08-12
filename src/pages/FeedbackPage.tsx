import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

import { ArrowLeft, MessageSquare, Loader2, X, Plus, Star } from 'lucide-react';
import { t } from '@/lib/i18n';
import { supabase } from '@/integrations/supabase/client';
// import type { TablesInsert } from '@/integrations/supabase/types'; // TODO: Fix Supabase types generation
import { useLanguage } from '@/contexts/LanguageContext';

type Category = 'bug' | 'idea' | 'request' | 'other';

const contactRegex = /@|\+?\d{8,}/;

const Schema = z
  .object({
    rating: z.number().min(1, t('feedback.error.rating_required')).max(5),
    category: z.enum(['bug', 'idea', 'request', 'other'], {
      required_error: t('feedback.error.select_category'),
    }),
    message: z
      .string()
      .min(10, t('feedback.error.message_short'))
      .max(2000, t('feedback.error.message_long')),
    contact: z.string().optional(),
    // Honeypot
    website: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.contact && data.contact.trim().length > 0 && !contactRegex.test(data.contact)) {
      ctx.addIssue({ path: ['contact'], code: 'custom', message: t('feedback.error.contact_invalid') });
    }
  });

type FormValues = z.infer<typeof Schema>;

const WINDOW_MIN_MS = 10 * 60 * 1000; // 10 minutes
const WINDOW_MAX_COUNT = 3;
const RATE_KEY = 'feedback:submits';
const MAX_FILES = 5;
const MAX_SIZE_BYTES = 3 * 1024 * 1024; // 3MB per file
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

function getRecentSubmits(): number[] {
  try {
    const raw = localStorage.getItem(RATE_KEY);
    const arr = raw ? (JSON.parse(raw) as number[]) : [];
    const cutoff = Date.now() - WINDOW_MIN_MS;
    return arr.filter((t) => t >= cutoff);
  } catch {
    return [];
  }
}

function pushSubmitNow() {
  try {
    const arr = getRecentSubmits();
    arr.push(Date.now());
    localStorage.setItem(RATE_KEY, JSON.stringify(arr));
  } catch {}
}

const FeedbackPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const fromHome = (location as any)?.state?.fromHome === true;
  const { language } = useLanguage();

  useEffect(() => {
    if (!fromHome) {
      // Hard guard: only accessible via Home
      navigate('/', { replace: true });
    }
  }, [fromHome, navigate]);

  useEffect(() => {
    // Prevent scrolling on this page
    document.body.style.overflow = 'hidden';
    // Re-enable scrolling when the component unmounts
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(Schema),
    mode: 'onChange',
    defaultValues: {
      rating: 0,
      category: undefined as unknown as Category,
      message: '',
      contact: '',
      website: '',
    },
  });

  const [submitting, setSubmitting] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageRuleError, setImageRuleError] = useState(false);

  const isRateLimited = useMemo(() => getRecentSubmits().length >= WINDOW_MAX_COUNT, []);
  const messageLen = form.watch('message')?.length || 0;

  const onInvalid = (errors: any) => {
    try {
      const first = Object.keys(errors)[0];
      if (!first) return;
      const el: HTMLElement | null = document.querySelector(`[name="${first}"]`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      (el as HTMLInputElement | null)?.focus?.();
    } catch {}
  };

  const onSubmit = async (values: FormValues) => {
    // Honeypot
    if (values.website && values.website.trim().length > 0) {
      toast.success(t('feedback.toast.sent'));
      form.reset();
      return;
    }

    const recent = getRecentSubmits();
    if (recent.length >= WINDOW_MAX_COUNT) {
      toast.error(t('feedback.toast.rate_limit'));
      return;
    }

    setSubmitting(true);
    try {
      // Upload images if any
      let uploadedPaths: string[] = [];
      if (files.length > 0) {
        for (const file of files) {
          const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
          const objectPath = `${Date.now()}-${Math.random().toString(36).slice(2)}-${safeName}`;
          const { data: up, error: upErr } = await supabase.storage.from('feedback').upload(objectPath, file, {
            contentType: file.type,
            upsert: false,
          });
          if (upErr) {
            console.error('Upload error', upErr);
            throw new Error(t('feedback.images.upload_error'));
          }
          if (up?.path) uploadedPaths.push(up.path);
        }
      }
      // Prepare payload (typed)
      const payload: any = { // TODO: Use TablesInsert<'feedback'>
        rating: values.rating,
        category: values.category,
        message: values.message.trim(),
        contact: values.contact?.trim() || null,
        locale: language,
        images: uploadedPaths.length ? uploadedPaths : null,
      };

      // Always include technical context (toggle removed)
      payload.user_agent = typeof navigator !== 'undefined' ? navigator.userAgent : null;
      payload.path = typeof window !== 'undefined' ? window.location?.pathname : null;
      payload.screen = typeof window !== 'undefined' ? `${window.screen?.width}x${window.screen?.height}` : null;
      payload.tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

      const { error } = await supabase.from('feedback').insert(payload);
      if (error) throw error;

      // Analytics (best-effort)
      try {
        // @ts-expect-error optional globals
        window?.gtag?.('event', 'feedback_submit', { category: values.category });
        // @ts-expect-error optional globals
        window?.dataLayer?.push({ event: 'feedback_submit', category: values.category });
      } catch {}

      pushSubmitNow();
      toast.success(t('feedback.toast.sent'));
      form.reset({});
      setFiles([]);
      setPreviews([]);
      navigate('/', { replace: true });
    } catch (err: any) {
      console.error('Feedback submit error', err);
      toast.error(t('feedback.toast.error'));
    } finally {
      setSubmitting(false);
    }
  };

  // Image selection & previews
  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => {
      urls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [files]);

  const onPickFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    const incoming = Array.from(fileList);
    const current = [...files];
    let hadError = false;
    for (const f of incoming) {
      if (!ALLOWED_TYPES.includes(f.type)) {
        hadError = true;
        continue;
      }
      if (f.size > MAX_SIZE_BYTES) {
        hadError = true;
        continue;
      }
      if (current.length >= MAX_FILES) {
        hadError = true;
        break;
      }
      current.push(f);
    }
    setFiles(current);
    setImageRuleError(hadError);
  };

  const removeFile = (idx: number) => {
    setFiles((arr) => arr.filter((_, i) => i !== idx));
  };

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Content */}
      <div className="relative z-10 flex-1 px-4 pb-8 pt-8">
        <div className="max-w-md md:max-w-xl lg:max-w-2xl mx-auto">
          {/* Title row with inline back button and icon */}
          <div className="mb-6 sm:mb-4">
            <div className="relative flex items-center justify-center">
              {/* Back button with Y-axis adjustment */}
              <div className={`absolute ${language === 'he' ? 'right-0 translate-y-2' : 'left-0 translate-y-1'}`}>
                <Button variant="ghost" onClick={() => navigate('/')}>
                  <ArrowLeft size={20} aria-hidden="true" />
                  <span className="sr-only">{t('action.return_home')}</span>
                </Button>
              </div>

              {/* Centered Title and Icon */}
              <div className="flex items-center justify-center gap-2">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tighter text-amber-400 text-center drop-shadow-glow">
                  {t('feedback.title')}
                </h1>
                <MessageSquare
                  className={`text-amber-400 ${language === 'he' ? 'translate-y-2' : 'translate-y-1'} w-9 h-9 md:w-11 md:h-11`}
                />
              </div>
            </div>
            <p className="mt-4 sm:mt-6 text-sm md:text-base lg:text-lg text-white/80 leading-tight text-center">{t('feedback.subtitle')}</p>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="w-full space-y-6 sm:space-y-4">
              {/* Honeypot */}
              <div className="absolute -z-10 opacity-0 pointer-events-none h-0 w-0 overflow-hidden">
                <label htmlFor="website">Website</label>
                <input id="website" type="text" tabIndex={-1} aria-hidden="true" {...form.register('website')} />
              </div>

              {/* Star Rating (required) */}
              <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="flex items-center justify-center gap-3" dir="ltr">
                        <span className="text-sm font-medium text-gray-400 translate-y-1">1</span>
                        <div className="flex items-center gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-8 h-8 sm:w-9 sm:h-9 md:w-11 md:h-11 cursor-pointer transition-colors ${field.value >= star ? 'text-amber-400 fill-amber-400' : 'text-gray-500 hover:text-amber-300'}`}
                              onClick={() => field.onChange(star)}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-medium text-gray-400 translate-y-1">5</span>
                      </div>
                    </FormControl>
                    <FormMessage className="text-center" />
                  </FormItem>
                )}
              />

              {/* Main Form Content Container */}
              <div className="w-[94%] sm:w-full mx-auto p-4 sm:p-6 md:p-8 bg-black/60 rounded-2xl border border-amber-400/80 space-y-6 sm:space-y-5 md:space-y-6">
                {/* Category chips (required) */}
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <ToggleGroup
                          type="single"
                          value={field.value}
                          onValueChange={(v) => v && field.onChange(v)}
                          className="w-full grid grid-cols-4 gap-1.5 sm:gap-2"
                          aria-label={t('feedback.aria.select_category')}
                          aria-required="true"
                        >
                          <ToggleGroupItem value="bug" className="text-xs sm:text-sm md:text-base h-10 md:h-12 bg-gray-800/80 border-gray-700 hover:bg-gray-700/80 text-white data-[state=on]:bg-amber-400 data-[state=on]:text-black data-[state=on]:border-amber-500 font-semibold">{t('feedback.category.bug')}</ToggleGroupItem>
                          <ToggleGroupItem value="idea" className="text-xs sm:text-sm md:text-base h-10 md:h-12 bg-gray-800/80 border-gray-700 hover:bg-gray-700/80 text-white data-[state=on]:bg-amber-400 data-[state=on]:text-black data-[state=on]:border-amber-500 font-semibold">{t('feedback.category.idea')}</ToggleGroupItem>
                          <ToggleGroupItem value="request" className="text-xs sm:text-sm md:text-base h-10 md:h-12 bg-gray-800/80 border-gray-700 hover:bg-gray-700/80 text-white data-[state=on]:bg-amber-400 data-[state=on]:text-black data-[state=on]:border-amber-500 font-semibold">{t('feedback.category.request')}</ToggleGroupItem>
                          <ToggleGroupItem value="other" className="text-xs sm:text-sm md:text-base h-10 md:h-12 bg-gray-800/80 border-gray-700 hover:bg-gray-700/80 text-white data-[state=on]:bg-amber-400 data-[state=on]:text-black data-[state=on]:border-amber-500 font-semibold">{t('feedback.category.other')}</ToggleGroupItem>
                        </ToggleGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Message (required) */}
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="relative">
                          <Textarea
                            {...field}
                            rows={3}
                            maxLength={2000}
                            placeholder={t('feedback.message.placeholder')}
                            className="focus:outline-none focus:ring-2 focus:ring-yellow-400 min-h-[72px]"
                          />
                          <span className="pointer-events-none select-none absolute bottom-2 right-2 text-xs text-white/60">{messageLen}/2000</span>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Images */}
                <div>
                  <FormLabel className="text-base font-semibold">{t('feedback.images.label')}</FormLabel>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={ALLOWED_TYPES.join(',')}
                    multiple
                    className="hidden"
                    onChange={(e) => onPickFiles(e.target.files)}
                  />
                  <div className="mt-3 sm:mt-2 grid grid-cols-3 md:grid-cols-5 gap-2" dir={language === 'he' ? 'rtl' : 'ltr'}>
                    {previews.map((src, idx) => (
                      <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-white/10">
                        <img src={src} alt={t('feedback.images.preview')} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeFile(idx)}
                          aria-label={t('feedback.images.remove')}
                          className="absolute -top-2 -right-2 bg-black/70 hover:bg-black/80 text-white rounded-full p-1 border border-white/20"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                    {files.length < MAX_FILES && (
                      <div
                        role="button"
                        tabIndex={0}
                        aria-label={t('feedback.images.pick')}
                        onClick={() => {
                          if (files.length >= MAX_FILES) {
                            setImageRuleError(true);
                            return;
                          }
                          fileInputRef.current?.click();
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            fileInputRef.current?.click();
                          }
                        }}
                        className="relative aspect-square rounded-lg overflow-hidden border border-white/20 bg-gray-800/80 hover:bg-gray-700/80 flex items-center justify-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      >
                        <div className="flex flex-col items-center justify-center gap-1 text-white">
                          <Plus size={71} strokeWidth={1} />
                          <span className="text-xs">{t('feedback.images.pick')}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  {imageRuleError && (
                    <div className="mt-2 text-xs text-white/70">עד 5 · PNG/JPG/WEBP · 3MB</div>
                  )}
                </div>

                {/* Contact (optional) */}
                <FormField
                  control={form.control}
                  name="contact"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="אימייל או טלפון (לא חובה)"
                          className="focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Submit Button */}
              <div className="pt-4 sm:pt-2 flex flex-col items-center gap-4 sm:gap-3">
                <Button type="submit" className="w-2/5 md:w-1/3 lg:w-1/4 h-11 md:h-12 text-base md:text-lg bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-black font-bold" disabled={!form.formState.isValid || submitting || isRateLimited}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('feedback.sending')}
                    </>
                  ) : (
                    t('feedback.submit')
                  )}
                </Button>
                {isRateLimited && (
                  <span className="text-sm text-red-300">{t('feedback.toast.rate_limit')}</span>
                )}
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default FeedbackPage;