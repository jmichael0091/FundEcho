import React from 'react';
import { User, Mail, Phone, Globe, MapPin, Briefcase, GraduationCap, Link2 } from 'lucide-react';
import { ApplicantInformation } from '../../../types/application';
import { Opportunity } from '../../../types';
import { AIAssistanceDropdown } from '../AIAssistanceDropdown';

interface ApplicantInfoStepProps {
  info: ApplicantInformation;
  opportunity: Opportunity;
  onChange: (updated: ApplicantInformation) => void;
}

export const ApplicantInfoStep: React.FC<ApplicantInfoStepProps> = ({
  info,
  opportunity,
  onChange,
}) => {
  const handleChange = (field: keyof ApplicantInformation, value: any) => {
    onChange({
      ...info,
      [field]: value,
    });
  };

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Lead Applicant Profile & Contact
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Provide the official details of the primary investigator, project lead, or grant contact person.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Full Legal Name *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                id="applicant-fullName-input"
                value={info.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                placeholder="e.g. Dr. Jane Doe"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Official Email Address *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="email"
                id="applicant-email-input"
                value={info.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="jane.doe@organization.org"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Phone Number (with country code)
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="tel"
                id="applicant-phone-input"
                value={info.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="+234 801 234 5678"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Country */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Country of Residence *
            </label>
            <div className="relative">
              <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                id="applicant-country-input"
                value={info.country}
                onChange={(e) => handleChange('country', e.target.value)}
                placeholder="e.g. Nigeria, United Kingdom, Kenya"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* City */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              City / State
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                id="applicant-city-input"
                value={info.city}
                onChange={(e) => handleChange('city', e.target.value)}
                placeholder="e.g. Lagos, Nairobi, London"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Professional Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Professional Title / Role
            </label>
            <div className="relative">
              <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                id="applicant-title-input"
                value={info.professionalTitle}
                onChange={(e) => handleChange('professionalTitle', e.target.value)}
                placeholder="e.g. Founder & Executive Director"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Highest Education */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Highest Education Level
            </label>
            <div className="relative">
              <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <select
                id="applicant-education-select"
                value={info.highestEducation}
                onChange={(e) => handleChange('highestEducation', e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="bachelors">Bachelor's Degree</option>
                <option value="masters">Master's Degree</option>
                <option value="phd">Doctorate / Ph.D.</option>
                <option value="postdoc">Post-Doctoral Fellow</option>
                <option value="high_school">High School Diploma</option>
                <option value="none">Other / Practical Experience</option>
              </select>
            </div>
          </div>

          {/* Years of Experience */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Years of Relevant Experience
            </label>
            <input
              type="number"
              id="applicant-experience-input"
              min="0"
              max="50"
              value={info.yearsOfExperience}
              onChange={(e) => handleChange('yearsOfExperience', e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="e.g. 5"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* LinkedIn / Portfolio */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              LinkedIn Profile or Professional Portfolio URL
            </label>
            <div className="relative">
              <Link2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="url"
                id="applicant-linkedin-input"
                value={info.linkedInOrWebsite}
                onChange={(e) => handleChange('linkedInOrWebsite', e.target.value)}
                placeholder="https://linkedin.com/in/janedoe"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Bio Summary with AI Assistant */}
          <div className="sm:col-span-2 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Applicant Bio & Track Record Summary:
              </label>
              <AIAssistanceDropdown
                fieldKey="applicant_bio"
                fieldLabel="Applicant Bio & Track Record"
                currentValue={info.bioSummary}
                opportunity={opportunity}
                applicantName={info.fullName}
                applicantCountry={info.country}
                applicantEducation={info.highestEducation}
                onApplyText={(newText, mode) => {
                  handleChange('bioSummary', mode === 'replace' ? newText : `${info.bioSummary}\n\n${newText}`.trim());
                }}
              />
            </div>
            <textarea
              rows={3}
              id="applicant-bio-input"
              value={info.bioSummary}
              onChange={(e) => handleChange('bioSummary', e.target.value)}
              placeholder="Highlight previous accomplishments, research, community initiatives, or leadership experience..."
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
