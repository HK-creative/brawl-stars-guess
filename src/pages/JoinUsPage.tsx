import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { ArrowLeft, Users, MessageCircle, Youtube, Instagram, Info, Crown, GraduationCap, Loader2, User as UserIcon, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { t } from '@/lib/i18n';
import RotatingBackground from '@/components/layout/RotatingBackground';

type Role = 'Community Member' | 'Club Owner' | 'Instructor';

const phoneRegex = /^\+?\d{10,15}$/;

const Schema = z.object({
  role: z.enum(['Community Member', 'Club Owner', 'Instructor'], { required_error: t('join.error.select_role') }),
  name: z.string().min(2, t('join.error.name_short')).max(80, t('join.error.name_long')),
  contact: z
    .string()
    .min(5, t('join.error.enter_contact'))
    .refine((v) => v.includes('@') ? z.string().email().safeParse(v).success : phoneRegex.test(v), {
      message: t('join.error.invalid_contact'),
    }),
  trophies: z.number().min(0).max(100000),
  age: z.union([z.string(), z.number()]).optional().transform((v) => {
    if (v === undefined || v === '') return undefined as number | undefined;
    const n = typeof v === 'string' ? parseInt(v, 10) : v;
    return Number.isFinite(n) ? n : undefined;
  }).refine((v) => v === undefined || (v >= 6 && v <= 30), { message: t('join.error.age_range') }).optional(),
  clubName: z.string().optional(),
  clubMembers: z.union([z.string(), z.number()]).optional().transform((v) => {
    if (v === undefined || v === '') return undefined as number | undefined;
    const n = typeof v === 'string' ? parseInt(v, 10) : v;
    return Number.isFinite(n) ? n : undefined;
  }).optional(),
  // Honeypot
  website: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.role === 'Instructor') {
    if (data.age === undefined || Number.isNaN(data.age)) {
      ctx.addIssue({ path: ['age'], code: 'custom', message: t('join.error.age_required') });
    }
  }
  if (data.role === 'Club Owner') {
    if (!data.clubName || data.clubName.trim().length === 0) {
      ctx.addIssue({ path: ['clubName'], code: 'custom', message: t('join.error.club_name_required') });
    }
    const m = typeof data.clubMembers === 'number' ? data.clubMembers : undefined;
    if (m === undefined || Number.isNaN(m)) {
      ctx.addIssue({ path: ['clubMembers'], code: 'custom', message: t('join.error.club_members_required') });
    } else if (m < 1 || m > 30) {
      ctx.addIssue({ path: ['clubMembers'], code: 'custom', message: t('join.error.club_members_range') });
    }
  }
});

type FormValues = z.infer<typeof Schema>;

const SOCIAL_LINKS: { label: string; href: string; icon: React.ElementType }[] = [
  { label: 'Discord', href: '', icon: MessageCircle },
  { label: 'YouTube', href: '', icon: Youtube },
  { label: 'WhatsApp', href: '', icon: MessageCircle },
  { label: 'Instagram', href: '', icon: Instagram },
];

const formatPhone = (raw: string) => {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return raw;
  return `+${digits}`.slice(0, 16);
};

const isRateLimited = () => {
  try {
    const last = localStorage.getItem('joinUs:lastSubmit');
    if (!last) return false;
    const diff = Date.now() - Number(last);
    // 30 seconds
    return diff < 30_000;
  } catch {
    return false;
  }
};

const markSubmittedNow = () => {
  try { localStorage.setItem('joinUs:lastSubmit', String(Date.now())); } catch {}
};

const getCooldownRemainingMs = () => {
  try {
    const last = localStorage.getItem('joinUs:lastSubmit');
    if (!last) return 0;
    const rem = 30_000 - (Date.now() - Number(last));
    return Math.max(0, rem);
  } catch {
    return 0;
  }
};

const JoinUsPage = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isRTL = language === 'he';
  const [trophies, setTrophies] = useState<number>(0);
  const [cooldown, setCooldown] = useState<number>(0);
  const [roleTipOpen, setRoleTipOpen] = useState(false);
  const tipTimerRef = useRef<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(Schema),
    mode: 'onChange',
    defaultValues: {
      role: undefined as unknown as Role,
      name: '',
      contact: '',
      trophies: 0,
      age: undefined,
      clubName: '',
      clubMembers: undefined,
      website: '',
    },
  });
  const role = form.watch('role');
  const roleTip = role === 'Instructor'
    ? t('join.role.tip.instructor')
    : role === 'Club Owner'
    ? t('join.role.tip.club_owner')
    : role === 'Community Member'
    ? t('join.role.tip.community')
    : '';

  const showRoleTip = () => {
    setRoleTipOpen(true);
    if (tipTimerRef.current) window.clearTimeout(tipTimerRef.current);
    tipTimerRef.current = window.setTimeout(() => setRoleTipOpen(false), 2200);
  };

  useEffect(() => {
    return () => { if (tipTimerRef.current) window.clearTimeout(tipTimerRef.current); };
  }, []);

  useEffect(() => {
    form.setValue('trophies', trophies, { shouldDirty: true, shouldValidate: true });
  }, [trophies]);

  useEffect(() => {
    const update = () => {
      const rem = getCooldownRemainingMs();
      setCooldown(Math.ceil(rem / 1000));
    };
    update();
    const id = setInterval(update, 500);
    return () => clearInterval(id);
  }, []);

  const onSubmit = async (values: FormValues) => {
    // Honeypot
    if (values.website && values.website.trim().length > 0) {
      // Silently succeed
      toast.success(t('join.toast.thanks'));
      form.reset();
      return;
    }

    if (isRateLimited()) {
      toast.error(t('join.toast.rate_limit'));
      return;
    }

    // Auto-format contact if phone-like
    const contact = values.contact.includes('@') ? values.contact.trim() : formatPhone(values.contact);

    try {
      const payload = {
        role: values.role,
        name: values.name.trim(),
        contact,
        trophies: values.trophies,
        age: typeof values.age === 'number' ? values.age : undefined,
        locale: language,
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
      };

      const { error } = await supabase.from('join_applications').insert(payload);

      if (error) throw error;

      // Basic analytics event
      try {
        // gtag
        // @ts-expect-error optional
        window?.gtag?.('event', 'join_us_submit', { role: values.role, trophies: values.trophies });
        // dataLayer
        // @ts-expect-error optional
        window?.dataLayer?.push({ event: 'join_us_submit', role: values.role, trophies: values.trophies });
      } catch {}

      markSubmittedNow();
      toast.success(t('join.toast.sent'));
      form.reset();
      setTrophies(0);
      setCooldown(30);
    } catch (err: any) {
      console.error('JoinUs submit error', err);
      toast.error(t('join.toast.error'));
    }
  };

  const contactOnBlur = () => {
    const v = form.getValues('contact');
    if (!v) return;
    if (!v.includes('@')) {
      const f = formatPhone(v);
      form.setValue('contact', f, { shouldValidate: true });
    }
  };

  const onInvalid = (errors: any) => {
    try {
      const first = Object.keys(errors)[0];
      if (!first) return;
      const el: HTMLElement | null = document.querySelector(`[name="${first}"]`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      (el as HTMLInputElement | null)?.focus?.();
    } catch {}
  };

  return (
    <div className="relative min-h-screen flex flex-col">
      <RotatingBackground />
      {/* Header */}
      <div className="relative z-10 sticky top-0 flex items-center justify-between p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="brawl-nav-button"
        >
          <ArrowLeft size={20} aria-hidden="true" className={isRTL ? 'transform rotate-180' : ''} />
          <span className="sr-only">{t('back.to.home')}</span>
        </Button>
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 px-4 pb-8">
        <div className="max-w-md mx-auto">
          {/* Title */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
              <Users size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-extrabold text-brawl-yellow text-center drop-shadow-glow tracking-wide">
                {t('join.title')}
              </h1>
              <p className="text-sm text-white/80 leading-tight text-center">{t('join.subtitle')}</p>
            </div>
          </div>
          {/* Social icons moved for visibility */}
          <div className="mt-2 text-center text-xs text-white/60">{t('join.social.connect')}</div>
          <div className="mt-2 mb-4 flex items-center justify-center gap-6 text-white/80">
            {SOCIAL_LINKS.map(({ label, href, icon: Icon }) => (
              <a
                key={label}
                href={href || '#'}
                target={href ? '_blank' : undefined}
                rel={href ? 'noopener noreferrer' : undefined}
                className="hover:text-white transition-colors inline-flex items-center gap-2 hover:scale-110 will-change-transform"
                aria-label={label}
                onClick={(e) => { if (!href) { e.preventDefault(); toast.message(t('coming.soon')); } }}
              >
                <Icon size={22} />
                <span className="sr-only">{label}</span>
              </a>
            ))}
          </div>

          {/* Form */}
          <div className="brawl-card">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="space-y-4">
              {/* Honeypot field */}
              <div className="absolute -z-10 opacity-0 pointer-events-none h-0 w-0 overflow-hidden">
                <label htmlFor="website">Website</label>
                <input id="website" type="text" tabIndex={-1} aria-hidden="true" {...form.register('website')} />
              </div>

              {/* Roles as chips */}
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('join.role.label')} <span aria-hidden="true" className="text-amber-400">*</span>
                    </FormLabel>
                    <FormControl>
                      <TooltipProvider>
                        <Tooltip open={roleTipOpen} onOpenChange={setRoleTipOpen}>
                          <TooltipTrigger asChild>
                            <ToggleGroup
                              type="single"
                              value={field.value}
                              onValueChange={(v) => { if (v) { field.onChange(v); showRoleTip(); } }}
                              aria-label={t('join.aria.select_role')}
                              aria-required="true"
                              className="w-full grid grid-cols-3 gap-3"
                            >
                              <ToggleGroupItem
                                value="Community Member"
                                aria-label={t('join.role.community')}
                                className={`w-full aspect-square p-2 rounded-xl border-2 bg-black/60 text-white hover:bg-black/50 border-white/20 data-[state=on]:bg-black/70 data-[state=on]:text-brawl-yellow data-[state=on]:border-brawl-yellow flex flex-col items-center justify-center`}
                              >
                                <div className="flex flex-col items-center justify-center gap-1 text-xs sm:text-sm">
                                  <Users size={18} />
                                  <span>{t('join.role.community')}</span>
                                </div>
                              </ToggleGroupItem>
                              <ToggleGroupItem
                                value="Club Owner"
                                aria-label={t('join.role.club_owner')}
                                className={`w-full aspect-square p-2 rounded-xl border-2 bg-black/60 text-white hover:bg-black/50 border-white/20 data-[state=on]:bg-black/70 data-[state=on]:text-brawl-yellow data-[state=on]:border-brawl-yellow flex flex-col items-center justify-center`}
                              >
                                <div className="flex flex-col items-center justify-center gap-1 text-xs sm:text-sm">
                                  <Crown size={18} />
                                  <span>{t('join.role.club_owner')}</span>
                                </div>
                              </ToggleGroupItem>
                              <ToggleGroupItem
                                value="Instructor"
                                aria-label={t('join.role.instructor')}
                                className={`w-full aspect-square p-2 rounded-xl border-2 bg-black/60 text-white hover:bg-black/50 border-white/20 data-[state=on]:bg-black/70 data-[state=on]:text-brawl-yellow data-[state=on]:border-brawl-yellow flex flex-col items-center justify-center`}
                              >
                                <div className="flex flex-col items-center justify-center gap-1 text-xs sm:text-sm">
                                  <GraduationCap size={18} />
                                  <span>{t('join.role.instructor')}</span>
                                </div>
                              </ToggleGroupItem>
                            </ToggleGroup>
                          </TooltipTrigger>
                          {role && roleTip && (
                            <TooltipContent side="bottom" align="center" className="max-w-xs text-center">
                              <span>{roleTip}</span>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('join.name.label')}</FormLabel>
                    <FormControl>
                      <div className="relative rounded-xl">
                        <UserIcon size={16} className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-white/60`} />
                        <Input
                          className={`h-12 ${isRTL ? 'pr-9' : 'pl-9'} bg-black/60 text-white border-2 border-white/20 rounded-xl placeholder:text-white/40 focus:ring-2 focus:ring-brawl-yellow/50 focus:border-transparent hover:bg-black/50`}
                          placeholder={t('join.name.placeholder')}
                          autoFocus
                          maxLength={80}
                          {...field}
                        />
                      </div>
                    </FormControl>
                    {/* Removed character counter per request */}
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Contact */}
              <FormField
                control={form.control}
                name="contact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('join.contact.label')}</FormLabel>
                    <FormControl>
                      <div className="relative rounded-xl">
                        <Mail size={16} className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-white/60`} />
                        <Input
                          className={`h-12 ${isRTL ? 'pr-9' : 'pl-9'} bg-black/60 text-white border-2 border-white/20 rounded-xl placeholder:text-white/40 focus:ring-2 focus:ring-brawl-yellow/50 focus:border-transparent hover:bg-black/50`}
                          inputMode="email"
                          placeholder={t('join.contact.placeholder')}
                          {...field}
                          onBlur={contactOnBlur}
                          dir={isRTL ? 'ltr' : undefined}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>{t('join.contact.helper')}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Trophies Slider */}
              <FormField
                control={form.control}
                name="trophies"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('join.trophies.label')}</FormLabel>
                    {/* Force LTR for slider + labels in RTL locales to match handle orientation */}
                    <div dir={isRTL ? 'ltr' : undefined}>
                      <div className="flex items-center gap-3">
                        <FormControl>
                          <div className="flex-1 py-2">
                            <Slider
                              value={[field.value]}
                              min={0}
                              max={100000}
                              step={1000}
                              onValueChange={([v]) => {
                                setTrophies(v);
                                field.onChange(v);
                              }}
                              aria-label={t('join.aria.trophy_count')}
                              trackClassName="bg-white/10"
                              rangeClassName="bg-brawl-yellow"
                              thumbClassName="h-5 w-5 border-2 border-brawl-yellow bg-black/70 hover:scale-105"
                            />
                          </div>
                        </FormControl>
                        <div className="px-2 py-1 rounded-md bg-white/10 text-xs tabular-nums">
                          {field.value.toLocaleString()}
                        </div>
                      </div>
                      <div className="flex justify-between text-xs text-white/60 mt-1">
                        <span>0</span>
                        <div className="flex-1 mx-2 flex justify-between text-white/40">
                          <span>25k</span>
                          <span>50k</span>
                          <span>75k</span>
                        </div>
                        <span>100k</span>
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Age */}
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('join.age.label')} {role === 'Instructor' && <span aria-hidden="true" className="text-amber-400">*</span>}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={6}
                        max={30}
                        step={1}
                        className={`h-12 ${isRTL ? 'pr-3' : 'pl-3'} bg-black/60 text-white border-2 border-white/20 rounded-xl placeholder:text-white/40 focus:ring-2 focus:ring-brawl-yellow/50 focus:border-transparent hover:bg-black/50`}
                        inputMode="numeric"
                        placeholder={t('join.age.placeholder')}
                        dir={isRTL ? 'ltr' : undefined}
                        value={field.value ?? ''}
                        onChange={(e) => {
                          const v = e.target.value;
                          if (v === '') return field.onChange(undefined);
                          const n = Math.max(6, Math.min(30, Number(v)));
                          field.onChange(Number.isFinite(n) ? n : undefined);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Club Owner extra fields */}
              {role === 'Club Owner' && (
                <>
                  <FormField
                    control={form.control}
                    name="clubName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('join.club.name.label')} <span aria-hidden="true" className="text-amber-400">*</span></FormLabel>
                        <FormControl>
                          <div className="relative rounded-xl">
                            <Crown size={16} className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-white/60`} />
                            <Input
                              className={`h-12 ${isRTL ? 'pr-9' : 'pl-9'} bg-black/60 text-white border-2 border-white/20 rounded-xl placeholder:text-white/40 focus:ring-2 focus:ring-brawl-yellow/50 focus:border-transparent hover:bg-black/50`}
                              placeholder={t('join.club.name.placeholder')}
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="clubMembers"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('join.club.members.label')} <span aria-hidden="true" className="text-amber-400">*</span></FormLabel>
                        <FormControl>
                          <div className="relative rounded-xl">
                            <Users size={16} className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-white/60`} />
                            <Input
                              type="number"
                              min={1}
                              max={30}
                              step={1}
                              className={`h-12 ${isRTL ? 'pr-9' : 'pl-9'} bg-black/60 text-white border-2 border-white/20 rounded-xl placeholder:text-white/40 focus:ring-2 focus:ring-brawl-yellow/50 focus:border-transparent hover:bg-black/50`}
                              inputMode="numeric"
                              dir={isRTL ? 'ltr' : undefined}
                              placeholder={t('join.club.members.placeholder')}
                              value={field.value ?? ''}
                              onChange={(e) => {
                                const v = e.target.value;
                                if (v === '') return field.onChange(undefined);
                                const n = Math.max(1, Math.min(30, Number(v)));
                                field.onChange(Number.isFinite(n) ? n : undefined);
                              }}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              {/* Submit */}
              <Button
                type="submit"
                className="brawl-button bg-brawl-yellow hover:bg-brawl-yellow/90 text-black w-full h-12 text-base font-bold"
                disabled={!form.formState.isValid || form.formState.isSubmitting || cooldown > 0}
              >
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className={`${isRTL ? 'ml-2' : 'mr-2'} h-4 w-4 animate-spin`} />
                    {t('join.sending')}
                  </>
                ) : (
                  t('join.submit')
                )}
              </Button>
              {/* Tiny privacy info icon */}
              <div className="flex justify-center mt-2">
                <button
                  type="button"
                  className="text-white/40 hover:text-white/70"
                  aria-label={t('join.privacy.info_label')}
                  onClick={() => toast.message(t('join.privacy.copy'))}
                >
                  <Info size={12} />
                  <span className="sr-only">{t('join.privacy.info_label')}</span>
                </button>
              </div>
              {cooldown > 0 && (
                <div className="space-y-1" aria-live="polite">
                  <div className="h-1 w-full rounded bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 transition-all"
                      style={{ width: `${Math.round(((30 - cooldown) / 30) * 100)}%` }}
                    />
                  </div>
                  <p className="text-center text-xs text-white/60">{t('join.cooldown.prefix')} {cooldown}{t('join.cooldown.suffix')}</p>
                </div>
              )}
              {/* privacy copy moved to icon */}
            </form>
          </Form>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default JoinUsPage;