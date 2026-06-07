'use client';

import React, { useState, useRef, useEffect } from 'react';

// --- CUSTOM COMPONENT: Styled exactly like your new reference image ---
const CustomDropdown = ({ 
  options, 
  value, 
  onChange, 
  name 
}: { 
  options: { id: string, label: string }[], 
  value: string, 
  onChange: (name: string, value: string) => void, 
  name: string 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.id === value) || options[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* The Trigger Button */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white text-[#324a3a] rounded-xl px-4 py-3 flex items-center justify-between border border-[#cbd5e1] shadow-sm cursor-pointer hover:border-[#94a3b8] transition-all"
      >
        <span className="text-base font-medium">{selectedOption.label}</span>
        
        {/* Single Chevron that rotates when open */}
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className={`h-5 w-5 text-[#64748b] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* The Floating Menu */}
      {isOpen && (
        <div className="absolute z-50 mt-1.5 w-full bg-white border border-[#cbd5e1] rounded-xl shadow-lg overflow-hidden animate-fade-in origin-top">
          <div className="max-h-60 overflow-y-auto custom-scrollbar py-1.5">
            {options.map((option) => {
              const isSelected = value === option.id;
              return (
                <div
                  key={option.id}
                  onClick={() => {
                    onChange(name, option.id);
                    setIsOpen(false);
                  }}
                  className="flex items-center justify-between px-4 py-2.5 cursor-pointer transition-colors hover:bg-[#f8fafc]"
                >
                  <span className={`text-base ${isSelected ? 'text-[#324a3a] font-semibold' : 'text-[#475569]'}`}>
                    {option.label}
                  </span>
                  
                  {/* Checkmark for the selected item */}
                  {isSelected && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#8b5cf6]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
// -------------------------------------------------------------------------

type FormData = {
  gender: string;
  sexual_orientation: string;
  location_type: string;
  income_bracket: string;
  education_level: string;
  swipe_time_of_day: string;
  app_usage_time_min: number;
  likes_received: number;
  mutual_matches: number;
  profile_pics_count: number;
  bio_length: number;
  message_sent_count: number;
  last_active_hour: number;
  swipe_right_ratio: number;
  emoji_usage_rate: number;
  interest_tags: string[];
};

export default function MatchPotentialPredictor() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const interestOptions = ['tech', 'yoga', 'sneaker culture', 'traveling', 'writing'];

  const [formData, setFormData] = useState<FormData>({
    gender: 'Male',
    sexual_orientation: 'Straight',
    location_type: 'Urban',
    income_bracket: 'Middle',
    education_level: 'Bachelor’s',
    swipe_time_of_day: 'Evening',
    app_usage_time_min: 60,
    likes_received: 54,
    mutual_matches: 2,
    profile_pics_count: 4,
    bio_length: 100,
    message_sent_count: 5,
    last_active_hour: 20,
    swipe_right_ratio: 0.70,
    emoji_usage_rate: 0.2,
    interest_tags: [],
  });

  const dropdownConfigs = {
    gender: [
      { id: 'Prefer Not to Say', label: 'Prefer Not to Say' },
      { id: 'Male', label: 'Male' },
      { id: 'Female', label: 'Female' },
      { id: 'Non-binary', label: 'Non-binary' },
      { id: 'Genderfluid', label: 'Genderfluid' }
    ],
    sexual_orientation: [
      { id: 'Straight', label: 'Straight' },
      { id: 'Gay', label: 'Gay' },
      { id: 'Lesbian', label: 'Lesbian' },
      { id: 'Bisexual', label: 'Bisexual' },
      { id: 'Pansexual', label: 'Pansexual' },
      { id: 'Queer', label: 'Queer' }
    ],
    location_type: [
      { id: 'Urban', label: 'Urban' },
      { id: 'Suburban', label: 'Suburban' },
      { id: 'Rural', label: 'Rural' },
      { id: 'Metro', label: 'Metro' }
    ],
    income_bracket: [
      { id: 'Very Low', label: 'Very Low' },
      { id: 'Low', label: 'Low' },
      { id: 'Lower-Middle', label: 'Lower-Middle' },
      { id: 'Middle', label: 'Middle' },
      { id: 'Upper-Middle', label: 'Upper-Middle' },
      { id: 'High', label: 'High' }
    ],
    education_level: [
      { id: 'No Formal Education', label: 'No Formal Education' },
      { id: 'High School', label: 'High School' },
      { id: 'Bachelor’s', label: 'Bachelor’s' },
      { id: 'Master’s', label: 'Master’s' },
      { id: 'PhD', label: 'PhD' },
      { id: 'Postdoc', label: 'Postdoc' }
    ],
    swipe_time_of_day: [
      { id: 'Early Morning', label: 'Early Morning' },
      { id: 'Morning', label: 'Morning' },
      { id: 'Afternoon', label: 'Afternoon' },
      { id: 'Evening', label: 'Evening' },
      { id: 'Night', label: 'Night' },
      { id: 'After Midnight', label: 'After Midnight' }
    ]
  };

  const handleCustomDropdownChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' || type === 'range' ? Number(value) : value,
    }));
  };

  const handleCheckboxChange = (interest: string) => {
    setFormData((prev) => {
      const currentInterests = prev.interest_tags;
      if (currentInterests.includes(interest)) {
        return { ...prev, interest_tags: currentInterests.filter((i) => i !== interest) };
      } else {
        return { ...prev, interest_tags: [...currentInterests, interest] };
      }
    });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

try {
      // Notice the backticks (` `) wrapping the URL string here
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to audit profile. Is the FastAPI server running?');

      const data = await response.json();
      setResult(data.match_probability_percentage);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const getTier = (score: number) => {
    if (score >= 70) return { label: 'High Potential', color: 'bg-[#324a3a]', text: 'text-white', msg: 'Excellent parameters. Your data-driven avatar is highly optimized for mutual matches.' };
    if (score >= 40) return { label: 'Medium Potential', color: 'bg-[#d6cfc4]', text: 'text-[#324a3a]', msg: 'You are on the right track! Being slightly more selective might push you into the High tier.' };
    return { label: 'Low Potential', color: 'bg-[#8c7f75]', text: 'text-white', msg: 'Your parameters need tweaking. Consider optimizing your bio length or engaging more.' };
  };

  // Adjusted this slightly to perfectly match the new CustomDropdown borders
  const inputBaseStyle = "w-full bg-white text-[#324a3a] rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#324a3a]/20 transition-all border border-[#cbd5e1] text-base shadow-sm";

  return (
    <div className="min-h-screen bg-[#141a16] py-12 px-4 sm:px-6 lg:px-8 font-sans text-[#324a3a] selection:bg-[#324a3a] selection:text-white">
      
      <style dangerouslySetInnerHTML={{__html: `
        .form-number-input::-webkit-inner-spin-button,
        .form-number-input::-webkit-outer-spin-button {
          -webkit-appearance: inner-spin-button !important;
          opacity: 1 !important;
          display: block !important;
        }
      `}} />

      <div className="max-w-3xl mx-auto bg-[#fcfbf8] rounded-3xl shadow-2xl p-8 md:p-14">
        
        <div className="mb-10">
          <span className="inline-block px-3 py-1 bg-[#f3efe6] text-[#7a6f66] text-xs font-medium rounded-full border border-[#e8e2d8] mb-4">
            Predictive Step
          </span>
          <h1 className="text-4xl md:text-5xl font-serif text-[#324a3a] mb-3 tracking-tight">
            Profile readiness
          </h1>
          <p className="text-[#5b6b5e] text-lg font-medium">
            How optimized is your digital avatar right now?*
          </p>
        </div>

        {error && (
          <div className="mb-8 bg-[#f3efe6] border-l-4 border-[#8c7f75] p-4 text-[#7a6f66] rounded-r-lg">
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-12">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            
            <div className="space-y-6">
              <h3 className="text-xl font-serif text-[#324a3a] border-b border-[#e8e2d8] pb-3">Demographics</h3>

              {(['gender', 'sexual_orientation', 'location_type', 'income_bracket', 'education_level'] as const).map((field) => (
                <div key={field}>
                  <label className="block text-sm font-semibold text-[#324a3a] mb-2 capitalize">
                    {field.replace('_', ' ')}
                  </label>
                  <CustomDropdown 
                    name={field}
                    options={dropdownConfigs[field]}
                    value={formData[field as keyof FormData] as string}
                    onChange={handleCustomDropdownChange}
                  />
                </div>
              ))}
            </div>

            <div className="space-y-6">
              <h3 className="text-xl font-serif text-[#324a3a] border-b border-[#e8e2d8] pb-3">App Behavior</h3>

              {[
                { name: 'likes_received', label: 'Likes Received' },
                { name: 'profile_pics_count', label: 'Profile Pics Count' },
                { name: 'app_usage_time_min', label: 'App Usage (Mins)' },
                { name: 'bio_length', label: 'Bio Length' },
                { name: 'message_sent_count', label: 'Messages Sent' },
                { name: 'last_active_hour', label: 'Last Active Hour (0-23)' },
                { name: 'mutual_matches', label: 'Mutual Matches' },
              ].map((input) => (
                <div key={input.name}>
                  <label className="block text-sm font-semibold text-[#324a3a] mb-2">{input.label}</label>
                  <input 
                    type="number" 
                    name={input.name}
                    value={formData[input.name as keyof FormData] as number} 
                    onChange={handleInputChange} 
                    className={`${inputBaseStyle} form-number-input`}
                  />
                </div>
              ))}

              <div>
                <label className="block text-sm font-semibold text-[#324a3a] mb-2">Swipe Time of Day</label>
                <CustomDropdown 
                  name="swipe_time_of_day"
                  options={dropdownConfigs.swipe_time_of_day}
                  value={formData.swipe_time_of_day}
                  onChange={handleCustomDropdownChange}
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#e8e2d8]">
            <h3 className="text-xl font-serif text-[#324a3a] mb-6">Behavioral Ratios</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div>
                <div className="flex justify-between items-end mb-1">
                  <label className="block text-sm font-semibold text-[#324a3a]">Swipe Right Ratio</label>
                  <span className="text-lg font-serif text-[#324a3a]">{formData.swipe_right_ratio.toFixed(2)}</span>
                </div>
                <p className="text-xs text-[#7a6f66] mb-4">
                  Swiping right on <span className="font-bold text-[#5b6b5e]">{Math.round(formData.swipe_right_ratio * 10)} out of 10</span> profiles.
                </p>
                <input 
                  type="range" name="swipe_right_ratio" min="0" max="1" step="0.01" 
                  value={formData.swipe_right_ratio} onChange={handleInputChange} 
                  className="w-full h-2 bg-[#e8e2d8] rounded-lg appearance-none cursor-pointer accent-[#324a3a]"
                />
              </div>
              
              <div>
                <div className="flex justify-between items-end mb-1">
                  <label className="block text-sm font-semibold text-[#324a3a]">Emoji Usage Rate</label>
                  <span className="text-lg font-serif text-[#324a3a]">{formData.emoji_usage_rate.toFixed(2)}</span>
                </div>
                <p className="text-xs text-[#7a6f66] mb-4">
                  Using emojis in <span className="font-bold text-[#5b6b5e]">{Math.round(formData.emoji_usage_rate * 100)}%</span> of messages.
                </p>
                <input 
                  type="range" name="emoji_usage_rate" min="0" max="1" step="0.01" 
                  value={formData.emoji_usage_rate} onChange={handleInputChange} 
                  className="w-full h-2 bg-[#e8e2d8] rounded-lg appearance-none cursor-pointer accent-[#324a3a]"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#e8e2d8]">
            <h3 className="text-xl font-serif text-[#324a3a] mb-6">Profile Tags</h3>
            
            <div className="space-y-3">
              {interestOptions.map((interest) => {
                const isSelected = formData.interest_tags.includes(interest);
                return (
                  <label 
                    key={interest} 
                    className={`flex items-center justify-between w-full p-4 rounded-xl cursor-pointer transition-all duration-200 border ${
                      isSelected ? 'bg-[#e4dfd4] border-[#d6cfc4]' : 'bg-[#f3efe6] border-[#e8e2d8] hover:bg-[#ebe5dc]'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? 'border-[#324a3a] bg-[#324a3a]' : 'border-[#b5ac9d] bg-white'}`}>
                        {isSelected && <div className="w-2 h-2 bg-white rounded-full"></div>}
                      </div>
                      <span className="text-base font-medium text-[#324a3a] capitalize">{interest}</span>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={isSelected} 
                      onChange={() => handleCheckboxChange(interest)}
                      className="hidden"
                    />
                  </label>
                );
              })}
            </div>
          </div>

          <div className="pt-6">
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-5 rounded-xl text-white text-sm font-bold tracking-[0.2em] uppercase transition-all duration-300 ${
                loading ? 'bg-[#4a5f50] cursor-not-allowed opacity-80' : 'bg-[#19271c] hover:bg-[#283d2c]'
              }`}
            >
              {loading ? 'Analyzing Profile...' : 'Predict Match Potential'}
            </button>
          </div>
        </form>

        {result !== null && (
          <div className="mt-12 bg-[#f3efe6] rounded-3xl p-10 text-center animate-fade-in border border-[#e8e2d8]">
            <h4 className="text-[#5b6b5e] font-serif text-xl mb-4">Your Predicted Score</h4>
            
            <div className="mb-6 flex justify-center items-baseline space-x-1">
              <span className="text-7xl font-serif text-[#324a3a]">{result}</span>
              <span className="text-3xl font-serif text-[#7a6f66]">%</span>
            </div>

            <div className="mb-8">
              <span className={`inline-block px-6 py-2.5 rounded-full text-xs font-bold tracking-widest uppercase ${getTier(result).color} ${getTier(result).text}`}>
                {getTier(result).label}
              </span>
            </div>

            <p className="text-base text-[#5b6b5e] leading-relaxed max-w-lg mx-auto">
              {getTier(result).msg}
            </p>
          </div>
        )}

      </div>
    </div>
  );
}