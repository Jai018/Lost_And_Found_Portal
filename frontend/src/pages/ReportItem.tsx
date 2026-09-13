import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Upload, X, ChevronRight, ChevronLeft,
  MapPin, Calendar, Tag, CheckCircle2,
  Image
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Button, Input, Textarea, Select, ProgressSteps } from '../components/ui';
import { reportsApi } from '../api/client';
import type { ItemCategory } from '../types';

const CATEGORIES: ItemCategory[] = [
  'Electronics', 'Bags & Wallets', 'Keys', 'Clothing',
  'Jewelry', 'Documents', 'Pets', 'Books', 'Sports', 'Other',
];

const CAMPUS_LOCATIONS = [
  'Main Building – Lobby', 'Library', 'Canteen / Cafeteria',
  'Gallery / Exhibition Hall', 'Parking Lot', 'Sports Ground', 'Lab Block', 'Auditorium',
  'Admin Block', 'Hostel', 'Classroom', 'Restroom', 'Other / Not sure',
];

const schema = z.object({
  title:           z.string().min(3, 'Give your item a short, clear name').max(100),
  description:     z.string().min(10, 'Add more detail so others can identify it').max(1000),
  category:        z.string().min(1, 'Pick a category'),
  locationDetails: z.string().min(3, 'Where on campus was it last seen?'),
  dateOccurred:    z.string().min(1, 'When did you lose it?'),
  contactInfo:     z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const STEPS = ['Item Details', 'Location & Date', 'Review & Submit'];

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } };

const ReportItem: React.FC = () => {
  const [step, setStep]           = useState(0);
  const [images, setImages]       = useState<File[]>([]);
  const [previews, setPreviews]   = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]     = useState(false);

  const { register, handleSubmit, watch, formState: { errors }, trigger } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const values = watch();

  // ── Image handling ─────────────────────────────────────────────────────
  const addImages = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files).slice(0, 4 - images.length);
    const newPreviews = newFiles.map((f) => URL.createObjectURL(f));
    setImages((p) => [...p, ...newFiles]);
    setPreviews((p) => [...p, ...newPreviews]);
  };

  const removeImage = (idx: number) => {
    setImages((p) => p.filter((_, i) => i !== idx));
    setPreviews((p) => p.filter((_, i) => i !== idx));
  };

  // ── Step navigation ────────────────────────────────────────────────────
  const nextStep = async () => {
    const fieldsPerStep: (keyof FormData)[][] = [
      ['title', 'description', 'category'],
      ['locationDetails', 'dateOccurred'],
    ];
    if (step < STEPS.length - 1) {
      const valid = await trigger(fieldsPerStep[step]);
      if (valid) setStep((s) => s + 1);
    }
  };

  // ── Submit ─────────────────────────────────────────────────────────────
  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(data).forEach(([k, v]) => { if (v) fd.append(k, v); });
      images.forEach((img) => fd.append('images', img));
      await reportsApi.submit(fd);
      setSubmitted(true);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Success screen ─────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen bg-[--color-bg] flex items-center justify-center pt-16 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h1 className="text-3xl font-display font-black text-gray-900 dark:text-white mb-3">
            Posted to Board! 🎉
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-2 leading-relaxed">
            Your lost item report is now live on the board. Other students can see it and tip you if they find it.
          </p>
          <p className="text-sm text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/30 rounded-xl px-4 py-3 mb-8 border border-primary-200 dark:border-primary-900/50">
            👀 Anyone who spots your item can send a tip directly to you.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/board" className="btn-primary">View on Board</Link>
            <Link to="/dashboard" className="btn-secondary">Go to My Dashboard</Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[--color-bg] pt-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">

        {/* Header */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="mb-8">
          <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 mb-3">
            <CheckCircle2 className="w-4 h-4" />
            <span>Instantly visible to all campus members</span>
          </div>
          <h1 className="text-3xl font-display font-black text-gray-900 dark:text-white">
            Report a Lost Item
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Fill in the details and your report goes live on the board immediately.
          </p>
        </motion.div>

        {/* Progress steps */}
        <ProgressSteps steps={STEPS} current={step} className="mb-8" />

        <form onSubmit={handleSubmit(onSubmit)}>
          <AnimatePresence mode="wait">

            {/* ── Step 0: Item Details ───────────────────────────────── */}
            {step === 0 && (
              <motion.div key="step0" initial="hidden" animate="visible" exit={{ opacity: 0, y: -10 }} variants={fadeUp} transition={{ duration: 0.3 }} className="space-y-5">
                <div className="card p-6 space-y-5">
                  <Input
                    id="report-title"
                    label="Item Name *"
                    placeholder='e.g. "Blue HP Laptop", "Black Wallet", "Car Keys"'
                    error={errors.title?.message}
                    {...register('title')}
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Category *</label>
                    <Select
                      id="report-category"
                      options={CATEGORIES.map(c => ({ value: c, label: c }))}
                      placeholder="Select a category"
                      error={errors.category?.message}
                      {...register('category')}
                    />
                  </div>

                  <Textarea
                    id="report-description"
                    label="Description *"
                    placeholder="Describe the item in detail — colour, brand, any unique markings, what was inside, etc."
                    rows={4}
                    error={errors.description?.message}
                    {...register('description')}
                  />

                  {/* Image upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Photos <span className="text-gray-400 text-xs font-normal">(Optional, up to 4)</span>
                    </label>
                    <div
                      className="border-2 border-dashed border-gray-200 dark:border-navy-700 rounded-2xl p-6 text-center cursor-pointer hover:border-primary-400 transition-colors"
                      onClick={() => document.getElementById('img-upload')?.click()}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => { e.preventDefault(); addImages(e.dataTransfer.files); }}
                    >
                      <Image className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">Drag photos here or <span className="text-primary-600 font-medium">click to upload</span></p>
                      <input id="img-upload" type="file" multiple accept="image/*" className="hidden"
                        onChange={(e) => addImages(e.target.files)} />
                    </div>

                    {previews.length > 0 && (
                      <div className="grid grid-cols-4 gap-2 mt-3">
                        {previews.map((src, i) => (
                          <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-navy-800">
                            <img src={src} alt="" className="w-full h-full object-cover" />
                            <button type="button" onClick={() => removeImage(i)}
                              className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                              <X className="w-3 h-3 text-white" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── Step 1: Location & Date ────────────────────────────── */}
            {step === 1 && (
              <motion.div key="step1" initial="hidden" animate="visible" exit={{ opacity: 0, y: -10 }} variants={fadeUp} transition={{ duration: 0.3 }} className="space-y-5">
                <div className="card p-6 space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      <MapPin className="w-4 h-4 inline mr-1" />Where was it last seen? *
                    </label>
                    <Select
                      id="report-location"
                      options={CAMPUS_LOCATIONS.map(l => ({ value: l, label: l }))}
                      placeholder="Select a campus location"
                      error={errors.locationDetails?.message}
                      {...register('locationDetails')}
                    />
                  </div>

                  <Input
                    id="report-date"
                    type="date"
                    label="Date it went missing *"
                    max={new Date().toISOString().split('T')[0]}
                    error={errors.dateOccurred?.message}
                    icon={<Calendar className="w-4 h-4" />}
                    {...register('dateOccurred')}
                  />

                  <Input
                    id="report-contact"
                    label="Your contact info (optional)"
                    placeholder="Phone number or email — admin uses this to contact you privately"
                    error={errors.contactInfo?.message}
                    {...register('contactInfo')}
                  />
                </div>
              </motion.div>
            )}

            {/* ── Step 2: Review ─────────────────────────────────────── */}
            {step === 2 && (
              <motion.div key="step2" initial="hidden" animate="visible" exit={{ opacity: 0, y: -10 }} variants={fadeUp} transition={{ duration: 0.3 }} className="space-y-4">
                <div className="card p-6 space-y-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-lg">Review Your Report</h3>

                  <div className="space-y-3 text-sm">
                    <div className="flex gap-3">
                      <Tag className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" />
                      <div><p className="text-gray-400 dark:text-gray-500 text-xs mb-0.5">Item</p>
                        <p className="font-medium text-gray-900 dark:text-white">{values.title}</p></div>
                    </div>
                    <div className="flex gap-3">
                      <MapPin className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" />
                      <div><p className="text-gray-400 dark:text-gray-500 text-xs mb-0.5">Last seen</p>
                        <p className="font-medium text-gray-900 dark:text-white">{values.locationDetails}</p></div>
                    </div>
                    <div className="flex gap-3">
                      <Calendar className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" />
                      <div><p className="text-gray-400 dark:text-gray-500 text-xs mb-0.5">Date</p>
                        <p className="font-medium text-gray-900 dark:text-white">{values.dateOccurred}</p></div>
                    </div>
                  </div>

                  {previews.length > 0 && (
                    <div className="flex gap-2 mt-2">
                      {previews.map((src, i) => (
                        <img key={i} src={src} alt="" className="w-16 h-16 rounded-xl object-cover" />
                      ))}
                    </div>
                  )}

                  {/* Privacy notice */}
                  <div className="flex gap-2.5 p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-xl">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-emerald-700 dark:text-emerald-300 leading-relaxed">
                      Once submitted, your report will be <strong>instantly visible</strong> to all campus members on the board.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6">
            {step > 0 ? (
              <button type="button" onClick={() => setStep((s) => s - 1)}
                className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
            ) : (
              <Link to="/board" className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">Cancel</Link>
            )}

            {step < STEPS.length - 1 ? (
              <Button type="button" variant="primary" onClick={nextStep} id="next-step-btn">
                Next <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button type="submit" variant="primary" loading={loading} id="submit-report-btn">
                <Upload className="w-4 h-4" /> Submit Report
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportItem;
