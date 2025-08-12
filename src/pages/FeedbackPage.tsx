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

import { ArrowLeft, MessageSquare, Loader2, X } from 'lucide-react';
import { t } from '@/lib/i18n';
import { supabase } from '@/integrations/supabase/client';
import type { TablesInsert } from '@/integrations/supabase/types';
import { useLanguage } from '@/contexts/LanguageContext';

type Category = 'bug' | 'idea' | 'request' | 'other';

const contactRegex = /@|\+?\d{8,}/;

const Schema = z
  .object({
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

  const form = useForm<FormValues>({
    resolver: zodResolver(Schema),
    mode: 'onChange',
    defaultValues: {
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
      const payload: TablesInsert<'feedback'> = {
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
      <div className="relative z-10 flex-1 px-4 pb-8">
        <div className="max-w-md mx-auto">
          {/* Back inside container */}
          <div className="mb-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="brawl-nav-button"
            >
              <ArrowLeft size={20} aria-hidden="true" />
              <span className="sr-only">{t('action.return_home')}</span>
            </Button>
          </div>
          {/* Title */}
          <div className="flex items-center justify-center gap-3 sm:gap-3 mb-6 sm:mb-4">
            {language === 'he' ? (
              <>
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
                  <MessageSquare size={24} className="text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-extrabold text-brawl-yellow text-center drop-shadow-glow tracking-wide">
                    {t('feedback.title')}
                  </h1>
                  <p className="mt-4 sm:mt-6 text-sm text-white/80 leading-tight text-center">{t('feedback.subtitle')}</p>
                </div>
              </>
            ) : (
              <>
                <div>
                  <h1 className="text-4xl font-extrabold text-brawl-yellow text-center drop-shadow-glow tracking-wide">
                    {t('feedback.title')}
                  </h1>
                  <p className="mt-4 sm:mt-6 text-sm text-white/80 leading-tight text-center">{t('feedback.subtitle')}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
                  <MessageSquare size={24} className="text-white" />
                </div>
              </>
            )}
          </div>

          {/* Form */}
          <div className="brawl-card">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="space-y-6 sm:space-y-4">
                {/* Honeypot */}
                <div className="absolute -z-10 opacity-0 pointer-events-none h-0 w-0 overflow-hidden">
                  <label htmlFor="website">Website</label>
                  <input id="website" type="text" tabIndex={-1} aria-hidden="true" {...form.register('website')} />
                </div>

                {/* Category chips (required) */}
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="w-full">
                          <div className="flex items-center gap-2 mb-1">
                            <span aria-hidden="true" className="text-amber-400 text-sm">*</span>
                            <div className="flex-1">
                              <ToggleGroup
                                type="single"
                                value={field.value}
                                onValueChange={(v) => v && field.onChange(v)}
                                className="w-full grid grid-cols-4 gap-1.5 sm:gap-2"
                                aria-label={t('feedback.aria.select_category')}
                                aria-required="true"
                              >
                                {(['bug','idea','request','other'] as Category[]).map((c) => (
                                  <ToggleGroupItem
                                    key={c}
                                    value={c}
                                    className="w-full aspect-square p-2 rounded-xl border-2 bg-black/60 text-white border-white/20 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 data-[state=on]:bg-black/70 data-[state=on]:text-brawl-yellow data-[state=on]:border-brawl-yellow flex items-center justify-center text-sm"
                                    aria-label={t(`feedback.category.${c}`)}
                                  >
                                    <span>{t(`feedback.category.${c}`)}</span>
                                  </ToggleGroupItem>
                                ))}
                              </ToggleGroup>
                            </div>
                          </div>
                        </div>
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
                          <span aria-hidden="true" className="absolute top-2 left-2 text-amber-400 text-sm">*</span>
                          <Textarea
                            {...field}
                            rows={6}
                            maxLength={2000}
                            placeholder={t('feedback.message.placeholder')}
                            className="focus:outline-none focus:ring-2 focus:ring-yellow-400"
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
                  <div className="flex items-center gap-2">
                    <FormLabel>{t('feedback.images.label')}</FormLabel>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={ALLOWED_TYPES.join(',')}
                    multiple
                    className="hidden"
                    onChange={(e) => onPickFiles(e.target.files)}
                  />
                  <div className={`mt-3 sm:mt-2 flex flex-wrap gap-2 ${language === 'he' ? 'flex-row-reverse justify-end' : 'justify-start'}`}>
                    {previews.map((src, idx) => (
                      <div key={idx} className="relative w-36 h-36 min-w-[120px] min-h-[120px] rounded-lg overflow-hidden border border-white/10">
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
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => {
                          if (files.length >= MAX_FILES) {
                            setImageRuleError(true);
                            return;
                          }
                          fileInputRef.current?.click();
                        }}
                        aria-label="Add image"
                        className="aspect-square w-36 h-36 min-w-[120px] min-h-[120px] rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      >
                        {language === 'he' ? '+ תמונה' : '+ image'}
                      </Button>
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

                {/* Submit */}
                <div className="pt-4 sm:pt-2 flex flex-col items-center gap-4 sm:gap-3">
                  <Button type="submit" className="w-2/5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white" disabled={!form.formState.isValid || submitting || isRateLimited}>
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
    </div>
  );
};

export default FeedbackPage;