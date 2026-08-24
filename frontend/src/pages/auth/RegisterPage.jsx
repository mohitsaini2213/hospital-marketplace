import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaArrowRight, FaCircleCheck } from 'react-icons/fa6';
import { StepIndicator } from '@/components/ui/StepIndicator';
import {
  StepFacilityType,
  StepBasicInfo,
  StepContact,
  StepLocation,
  StepWebsite,
  StepReview,
} from '@/pages/auth/RegisterSteps';
import { authService } from '@/services/authService';
import { parseApiError } from '@/services/api';
import { useToast } from '@/context/ToastContext';
import { isValidEmail, isValidIndianMobile, isValidPassword, isValidPincode, isValidUrl } from '@/utils/validators';
import { DEFAULT_CITY, DEFAULT_STATE, DEFAULT_CENTER } from '@/utils/constants';

const STEPS = ['Facility Type', 'Basic Info', 'Contact', 'Location', 'Website', 'Review'];

const initialData = {
  facilityType: '',
  customFacilityType: '',
  name: '',
  ownerName: '',
  email: '',
  password: '',
  confirmPassword: '',
  mobile1: '',
  mobile2: '',
  address: '',
  locality: '',
  city: DEFAULT_CITY,
  state: DEFAULT_STATE,
  pincode: '',
  latitude: DEFAULT_CENTER.lat,
  longitude: DEFAULT_CENTER.lng,
  resolvedAddress: '',
  hasWebsite: null,
  websiteUrl: '',
  wantsWebsite: false,
  agreedToTerms: false,
};

const validateStep = (step, data) => {
  const errors = {};
  if (step === 1) {
    if (!data.facilityType) errors.facilityType = 'Please select a facility type.';
    if (data.facilityType === 'Other' && !data.customFacilityType.trim()) {
      errors.customFacilityType = 'Please specify your facility type.';
    }
  }
  if (step === 2) {
    if (!data.name.trim()) errors.name = 'Facility name is required.';
    if (!data.ownerName.trim()) errors.ownerName = 'Owner/contact name is required.';
    if (!isValidEmail(data.email)) errors.email = 'Enter a valid email address.';
    if (!isValidPassword(data.password)) errors.password = 'Password does not meet all requirements.';
    if (data.password !== data.confirmPassword) errors.confirmPassword = 'Passwords do not match.';
  }
  if (step === 3) {
    if (!isValidIndianMobile(data.mobile1)) errors.mobile1 = 'Enter a valid 10-digit Indian mobile number.';
    if (data.mobile2 && !isValidIndianMobile(data.mobile2)) errors.mobile2 = 'Enter a valid 10-digit Indian mobile number.';
  }
  if (step === 4) {
    if (!data.address.trim()) errors.address = 'Address is required.';
    if (!data.city.trim()) errors.city = 'City is required.';
    if (!data.state.trim()) errors.state = 'State is required.';
    if (!isValidPincode(data.pincode)) errors.pincode = 'Enter a valid 6-digit pincode.';
    if (!data.latitude || !data.longitude) errors.location = 'Please select your location on the map.';
  }
  if (step === 5) {
    if (data.hasWebsite === null) errors.hasWebsite = 'Please tell us if you have a website.';
    if (data.hasWebsite === true && !isValidUrl(data.websiteUrl)) errors.websiteUrl = 'Enter a valid website URL (https://…).';
  }
  if (step === 6) {
    if (!data.agreedToTerms) errors.agreedToTerms = 'You must accept the Terms & Conditions to continue.';
  }
  return errors;
};

export const RegisterPage = () => {
  const [step, setStep] = useState(1);
  const [data, setData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const next = () => {
    const stepErrors = validateStep(step, data);
    setErrors(stepErrors);
    if (Object.keys(stepErrors).length === 0) {
      setStep((s) => Math.min(s + 1, STEPS.length));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const back = () => {
    setStep((s) => Math.max(s - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submit = async () => {
    const stepErrors = validateStep(6, data);
    setErrors(stepErrors);
    if (Object.keys(stepErrors).length > 0) return;

    setSubmitting(true);
    try {
      await authService.registerFacility({
        facilityType: data.facilityType,
        customFacilityType: data.facilityType === 'Other' ? data.customFacilityType : undefined,
        name: data.name,
        ownerName: data.ownerName,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        mobile1: data.mobile1,
        mobile2: data.mobile2 || undefined,
        address: data.address,
        locality: data.locality,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        latitude: data.latitude,
        longitude: data.longitude,
        websiteUrl: data.hasWebsite ? data.websiteUrl : undefined,
        wantsWebsite: !!data.wantsWebsite,
        agreeTerms: data.agreedToTerms,
      });
      setDone(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      const { message, details } = parseApiError(err);
      toast.error(message);
      if (details) setErrors((e) => ({ ...e, ...details }));
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="container-page flex min-h-[70vh] items-center justify-center py-16">
        <div className="card max-w-md p-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-teal-050)] text-[var(--color-teal-600)]">
            <FaCircleCheck size={26} />
          </div>
          <h1 className="text-xl font-semibold text-[var(--color-ink)]">Registration submitted successfully</h1>
          <p className="mt-2 text-sm text-[var(--color-ink-soft)]">
            Your listing is under verification. We'll notify you by email once it's reviewed — this usually takes 1–2 business days.
          </p>
          <button onClick={() => navigate('/login')} className="btn-primary mt-6 w-full">
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const StepComponent = [StepFacilityType, StepBasicInfo, StepContact, StepLocation, StepWebsite, StepReview][step - 1];

  return (
    <div className="container-page max-w-2xl py-10">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-semibold text-[var(--color-ink)]">Register Your Healthcare Facility</h1>
        <p className="mt-2 text-sm text-[var(--color-ink-soft)]">
          List your hospital, clinic, medical store or healthcare business on Hospital Marketplace.
        </p>
      </div>

      <div className="mb-8">
        <StepIndicator steps={STEPS} current={step} />
      </div>

      <div className="card p-6 sm:p-8">
        <StepComponent data={data} setData={setData} errors={errors} />

        <div className="mt-8 flex items-center justify-between border-t border-[var(--color-line)] pt-6">
          <button type="button" onClick={back} disabled={step === 1} className="btn-secondary">
            <FaArrowLeft size={13} /> Back
          </button>
          {step < STEPS.length ? (
            <button type="button" onClick={next} className="btn-primary">
              Next <FaArrowRight size={13} />
            </button>
          ) : (
            <button type="button" onClick={submit} disabled={submitting} className="btn-primary">
              {submitting ? 'Submitting…' : 'Submit Registration'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
